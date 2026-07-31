import { getAmapKey, getAmapWebServiceKey } from '@/lib/map/amap';
import {
  forwardGeocodeWithAmapGeocoder,
  forwardGeocodeWithAmapPlaceSearch,
} from '@/lib/map/amapGeocoderClient';
import { buildPlanLocationGeocodeQuery } from '@/lib/map/geocodeTravelPlan';
import type { GeocodeOptions, ReverseGeocodeResult } from '@/lib/map/types';
import { fetchServerOriginGeocode } from '@/services/map/fetchServerOriginGeocode';
import type { MapCoordinates } from '@/types/domain/travelPlan';
import type { AmapGeocodeResponse, AmapRegeocodeResponse } from '@/types/api/amapGeocode';

const GEO_URL = 'https://restapi.amap.com/v3/geocode/geo';
const REGEO_URL = 'https://restapi.amap.com/v3/geocode/regeo';
const PLACE_TEXT_URL = 'https://restapi.amap.com/v3/place/text';

const CACHE = new Map<string, MapCoordinates | null>();
const REVERSE_CACHE = new Map<string, ReverseGeocodeResult | null>();

function parseLocation(location: string): MapCoordinates | null {
  const [lng, lat] = location.split(',').map((part) => Number.parseFloat(part.trim()));
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return null;
  }
  return { longitude: lng, latitude: lat };
}

function buildCacheKey(query: string, proximity?: MapCoordinates): string {
  const prox = proximity ? `${proximity.longitude},${proximity.latitude}` : '';
  return `amap|${query.trim()}|${prox}`;
}

function shortPlaceName(formatted: string): string {
  const parts = formatted.split(/[,，]/).map((part) => part.trim()).filter(Boolean);
  return parts[0] ?? formatted;
}

/**
 * 高德地理编码（GCJ-02）
 * @see https://lbs.amap.com/api/webservice/guide/api/georegeo
 */
export async function amapGeocodePlace(
  query: string,
  options: GeocodeOptions = {},
): Promise<MapCoordinates | null> {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  const city = options.city?.trim();
  const cityCore = city?.replace(/市$/, '');
  const enriched = city ? buildPlanLocationGeocodeQuery(trimmed, city) : trimmed;

  const tryJsSdk = async (query: string): Promise<MapCoordinates | null> => {
    try {
      const fromPoi = await forwardGeocodeWithAmapPlaceSearch(query, cityCore);
      if (fromPoi) {
        return { longitude: fromPoi.lng, latitude: fromPoi.lat };
      }
      const fromGeo = await forwardGeocodeWithAmapGeocoder(query, { city: city ?? cityCore });
      if (fromGeo) {
        return { longitude: fromGeo.lng, latitude: fromGeo.lat };
      }
    } catch {
      /* JS API 未加载或 Key 受限 */
    }
    return null;
  };

  const fromJs = await tryJsSdk(trimmed);
  if (fromJs) {
    return fromJs;
  }
  if (enriched !== trimmed) {
    const fromEnrichedJs = await tryJsSdk(enriched);
    if (fromEnrichedJs) {
      return fromEnrichedJs;
    }
  }

  const fromServer = await fetchServerOriginGeocode(enriched);
  if (fromServer) {
    return { longitude: fromServer.lng, latitude: fromServer.lat };
  }
  if (enriched !== trimmed) {
    const fromServerRaw = await fetchServerOriginGeocode(trimmed);
    if (fromServerRaw) {
      return { longitude: fromServerRaw.lng, latitude: fromServerRaw.lat };
    }
  }

  if (city) {
    const fromPoi = await amapPlaceTextSearch(trimmed, cityCore);
    if (fromPoi) {
      return { longitude: fromPoi.longitude, latitude: fromPoi.latitude };
    }
    if (enriched !== trimmed) {
      const fromEnrichedPoi = await amapPlaceTextSearch(enriched, cityCore);
      if (fromEnrichedPoi) {
        return { longitude: fromEnrichedPoi.longitude, latitude: fromEnrichedPoi.latitude };
      }
    }
  }

  const labeled = await amapGeocodePlaceWithLabel(enriched, city, options);
  if (labeled) {
    return { longitude: labeled.longitude, latitude: labeled.latitude };
  }

  if (enriched !== trimmed) {
    const fallback = await amapGeocodePlaceWithLabel(trimmed, city, options);
    return fallback ? { longitude: fallback.longitude, latitude: fallback.latitude } : null;
  }

  return null;
}

/** REST 地理编码，返回坐标与格式化地址（不依赖 JS API 加载） */
export async function amapGeocodePlaceWithLabel(
  query: string,
  city?: string,
  options: GeocodeOptions = {},
): Promise<{ label: string; longitude: number; latitude: number } | null> {
  const key = getAmapWebServiceKey();
  const trimmed = query.trim();
  if (!key || !trimmed) {
    return null;
  }

  const cacheKey = buildCacheKey(`${trimmed}|${city ?? ''}`, options.proximity);
  const cached = CACHE.get(cacheKey);
  if (cached) {
    return cached
      ? { label: trimmed, longitude: cached.longitude, latitude: cached.latitude }
      : null;
  }

  const params = new URLSearchParams({
    key,
    address: trimmed,
    output: 'JSON',
  });
  if (city?.trim()) {
    params.set('city', city.trim());
  }
  if (options.proximity) {
    params.set('location', `${options.proximity.longitude},${options.proximity.latitude}`);
  }

  try {
    const response = await fetch(`${GEO_URL}?${params.toString()}`);
    if (!response.ok) {
      CACHE.set(cacheKey, null);
      return null;
    }
    const data = (await response.json()) as AmapGeocodeResponse;
    const geocode = data.geocodes?.[0];
    if (data.status !== '1' || !geocode?.location) {
      CACHE.set(cacheKey, null);
      return null;
    }
    const coords = parseLocation(geocode.location);
    if (!coords) {
      CACHE.set(cacheKey, null);
      return null;
    }
    CACHE.set(cacheKey, coords);
    return {
      label: geocode.formatted_address?.trim() || trimmed,
      longitude: coords.longitude,
      latitude: coords.latitude,
    };
  } catch {
    CACHE.set(cacheKey, null);
    return null;
  }
}

/** REST POI 关键词搜索（小区/门牌；不依赖浏览器 GPS） */
export async function amapPlaceTextSearch(
  keywords: string,
  city?: string,
): Promise<{ label: string; longitude: number; latitude: number } | null> {
  const key = getAmapWebServiceKey();
  const trimmed = keywords.trim();
  if (!key || !trimmed) {
    return null;
  }

  const params = new URLSearchParams({
    key,
    keywords: trimmed,
    offset: '1',
    page: '1',
    extensions: 'base',
    output: 'JSON',
  });
  if (city?.trim()) {
    params.set('city', city.trim());
    params.set('citylimit', 'true');
  }

  try {
    const response = await fetch(`${PLACE_TEXT_URL}?${params.toString()}`);
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as {
      status?: string;
      pois?: Array<{ name?: string; address?: string; location?: string }>;
    };
    const poi = data.pois?.[0];
    if (data.status !== '1' || !poi?.location) {
      return null;
    }
    const coords = parseLocation(poi.location);
    if (!coords) {
      return null;
    }
    const addressPart = poi.address?.trim();
    const label = addressPart
      ? `${poi.name?.trim() || trimmed}（${addressPart}）`
      : poi.name?.trim() || trimmed;
    return { label, longitude: coords.longitude, latitude: coords.latitude };
  } catch {
    return null;
  }
}

export async function amapGeocodePlaces(
  queries: string[],
  options: GeocodeOptions = {},
): Promise<Map<string, MapCoordinates | null>> {
  const unique = [...new Set(queries.map((q) => q.trim()).filter(Boolean))];
  const result = new Map<string, MapCoordinates | null>();
  const batchSize = 4;

  for (let index = 0; index < unique.length; index += batchSize) {
    const batch = unique.slice(index, index + batchSize);
    const pairs = await Promise.all(
      batch.map(async (query) => [query, await amapGeocodePlace(query, options)] as const),
    );
    pairs.forEach(([query, coords]) => {
      result.set(query, coords);
    });
  }

  return result;
}

export async function amapReverseGeocodePlace(
  longitude: number,
  latitude: number,
): Promise<ReverseGeocodeResult | null> {
  const key = getAmapKey();
  if (!key) {
    return null;
  }

  const cacheKey = `amap|${longitude.toFixed(5)},${latitude.toFixed(5)}`;
  if (REVERSE_CACHE.has(cacheKey)) {
    return REVERSE_CACHE.get(cacheKey) ?? null;
  }

  const params = new URLSearchParams({
    key,
    location: `${longitude},${latitude}`,
    output: 'JSON',
    extensions: 'base',
  });

  try {
    const response = await fetch(`${REGEO_URL}?${params.toString()}`);
    if (!response.ok) {
      REVERSE_CACHE.set(cacheKey, null);
      return null;
    }
    const data = (await response.json()) as AmapRegeocodeResponse;
    if (data.status !== '1' || !data.regeocode?.formatted_address) {
      REVERSE_CACHE.set(cacheKey, null);
      return null;
    }

    const formatted = data.regeocode.formatted_address;
    const result: ReverseGeocodeResult = {
      placeName: shortPlaceName(formatted),
      coordinates: { longitude, latitude },
      countryCode: data.regeocode.addressComponent?.country === '中国' ? 'CN' : undefined,
    };
    REVERSE_CACHE.set(cacheKey, result);
    return result;
  } catch {
    REVERSE_CACHE.set(cacheKey, null);
    return null;
  }
}

export function clearAmapGeocodeCache(): void {
  CACHE.clear();
  REVERSE_CACHE.clear();
}
