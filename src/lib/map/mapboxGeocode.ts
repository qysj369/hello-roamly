import type { MapCoordinates } from '@/types/domain/travelPlan';
import type { MapboxGeocodeResponse } from '@/types/api/mapboxGeocode';

const GEOCODE_BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const CACHE = new Map<string, MapCoordinates | null>();
const REVERSE_CACHE = new Map<string, ReverseGeocodeResult | null>();

export type GeocodeOptions = {
  token: string;
  proximity?: MapCoordinates;
  limit?: number;
};

function buildCacheKey(query: string, proximity?: MapCoordinates): string {
  const prox = proximity ? `${proximity.longitude},${proximity.latitude}` : '';
  return `${query.trim()}|${prox}`;
}

/**
 * Mapbox Forward Geocoding：将地点文案解析为坐标
 * @see https://docs.mapbox.com/api/search/geocoding/
 */
export async function geocodePlace(
  query: string,
  { token, proximity, limit = 1 }: GeocodeOptions,
): Promise<MapCoordinates | null> {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  const cacheKey = buildCacheKey(trimmed, proximity);
  if (CACHE.has(cacheKey)) {
    return CACHE.get(cacheKey) ?? null;
  }

  const pathSegment = encodeURIComponent(trimmed);
  const params = new URLSearchParams({
    access_token: token,
    limit: String(limit),
    language: 'zh',
    country: 'cn',
  });
  if (proximity) {
    params.set('proximity', `${proximity.longitude},${proximity.latitude}`);
  }

  const url = `${GEOCODE_BASE}/${pathSegment}.json?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      CACHE.set(cacheKey, null);
      return null;
    }
    const data = (await response.json()) as MapboxGeocodeResponse;
    const feature = data.features?.[0];
    if (!feature?.center || feature.center.length < 2) {
      CACHE.set(cacheKey, null);
      return null;
    }
    const [longitude, latitude] = feature.center;
    const coords = { longitude, latitude };
    CACHE.set(cacheKey, coords);
    return coords;
  } catch {
    CACHE.set(cacheKey, null);
    return null;
  }
}

/** 批量地理编码，返回 query → 坐标（失败为 null） */
export async function geocodePlaces(
  queries: string[],
  options: GeocodeOptions,
): Promise<Map<string, MapCoordinates | null>> {
  const unique = [...new Set(queries.map((q) => q.trim()).filter(Boolean))];
  const result = new Map<string, MapCoordinates | null>();
  const batchSize = 4;
  const batches: string[][] = [];

  for (let index = 0; index < unique.length; index += batchSize) {
    batches.push(unique.slice(index, index + batchSize));
  }

  const batchResults = await Promise.all(
    batches.map((batch) =>
      Promise.all(
        batch.map(async (query) => {
          const coords = await geocodePlace(query, options);
          return [query, coords] as const;
        }),
      ),
    ),
  );

  batchResults.flat().forEach(([query, coords]) => {
    result.set(query, coords);
  });

  return result;
}

export type ReverseGeocodeResult = {
  placeName: string;
  coordinates: MapCoordinates;
  countryCode?: string;
};

export function clearGeocodeCache(): void {
  CACHE.clear();
  REVERSE_CACHE.clear();
}

function extractCountryCode(feature: MapboxGeocodeResponse['features'][0]): string | undefined {
  const country = feature?.context?.find((item) => item.id.startsWith('country.'));
  const code = country?.short_code?.toUpperCase();
  if (!code) {
    return undefined;
  }
  return code.length > 2 ? code.slice(0, 2) : code;
}

/**
 * Mapbox Reverse Geocoding：坐标 → 地点名称
 * @see https://docs.mapbox.com/api/search/geocoding/#reverse-geocoding
 */
export async function reverseGeocodePlace(
  longitude: number,
  latitude: number,
  token: string,
): Promise<ReverseGeocodeResult | null> {
  const cacheKey = `${longitude.toFixed(5)},${latitude.toFixed(5)}`;
  if (REVERSE_CACHE.has(cacheKey)) {
    return REVERSE_CACHE.get(cacheKey) ?? null;
  }

  const params = new URLSearchParams({
    access_token: token,
    language: 'zh',
    limit: '1',
  });
  const url = `${GEOCODE_BASE}/${longitude},${latitude}.json?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      REVERSE_CACHE.set(cacheKey, null);
      return null;
    }
    const data = (await response.json()) as MapboxGeocodeResponse;
    const feature = data.features?.[0];
    if (!feature?.center || feature.center.length < 2) {
      REVERSE_CACHE.set(cacheKey, null);
      return null;
    }
    const [lng, lat] = feature.center;
    const coordinates = { longitude: lng, latitude: lat };

    const shortLabel = feature.place_name.split(',')[0]?.trim() || feature.place_name;

    const result: ReverseGeocodeResult = {
      placeName: shortLabel,
      coordinates,
      countryCode: extractCountryCode(feature),
    };
    REVERSE_CACHE.set(cacheKey, result);
    return result;
  } catch {
    REVERSE_CACHE.set(cacheKey, null);
    return null;
  }
}
