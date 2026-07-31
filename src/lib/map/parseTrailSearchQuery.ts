import { getCityCoordinates } from '@/data/cityCoordinates';
import { forwardGeocodeWithAmapGeocoder } from '@/lib/map/amapGeocoderClient';
import { compactGeocodeLabelForDisplay } from '@/lib/map/resolveAmapPlaceName';
import { resolveTravelPlacesFromText } from '@/lib/map/resolveTravelPlaces';
import {
  coalesceSearchQueryWithDestination,
  extractMultiStopDestinations,
  extractPrimaryLocation,
  extractRouteEndpoints,
  extractSearchDestination,
  normalizeTrailSearchQuery,
} from '@/lib/map/travelQueryParsing';

export type { RouteEndpoints } from '@/lib/map/travelQueryParsing';
export {
  coalesceSearchQueryWithDestination,
  extractMultiStopDestinations,
  extractPrimaryLocation,
  extractRouteEndpoints,
  extractSearchDestination,
  normalizeTrailSearchQuery,
} from '@/lib/map/travelQueryParsing';

function shortPlaceName(formatted: string): string {
  const parts = formatted.split(/[,，]/).map((part) => part.trim()).filter(Boolean);
  const raw = parts[0] ?? formatted;
  return compactGeocodeLabelForDisplay(raw);
}

export type ResolvedSearchLocation = {
  label: string;
  longitude: number;
  latitude: number;
  /** 本地城市表为 WGS84；高德 JS 地理编码为 GCJ-02 */
  coordSystem: 'wgs84' | 'gcj02';
};

export type ResolvedStopLocation = ResolvedSearchLocation & {
  stopName: string;
};

export type ResolvedMultiStopSearch = {
  routeLabel: string;
  stops: ResolvedStopLocation[];
  /** 第一站，兼容旧逻辑 */
  primary: ResolvedSearchLocation;
};

async function geocodeHint(hint: string): Promise<ResolvedSearchLocation | null> {
  const local = getCityCoordinates(hint);
  if (local) {
    return {
      label: hint,
      longitude: local.longitude,
      latitude: local.latitude,
      coordSystem: 'wgs84',
    };
  }

  const geocoded = await forwardGeocodeWithAmapGeocoder(hint);
  if (!geocoded) {
    return null;
  }

  return {
    label: shortPlaceName(geocoded.label),
    longitude: geocoded.lng,
    latitude: geocoded.lat,
    coordSystem: 'gcj02',
  };
}

/** 同步解析已知城市中心（本地城市表，WGS84） */
export function resolveCityCenterSync(query: string): ResolvedSearchLocation | null {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  const multiStops = extractMultiStopDestinations(trimmed);
  const hint =
    multiStops[0] ??
    extractSearchDestination(trimmed) ??
    extractPrimaryLocation(trimmed) ??
    trimmed.split(/[，,]/)[0]?.trim() ??
    trimmed;
  const local = getCityCoordinates(hint);
  if (!local) {
    return null;
  }

  return {
    label: hint,
    longitude: local.longitude,
    latitude: local.latitude,
    coordSystem: 'wgs84',
  };
}

/** 解析搜索目的地（本地城市表 → 主地名 → 全句；避免无差别慢速扫描） */
export async function resolveSearchLocation(query: string): Promise<ResolvedSearchLocation | null> {
  const trimmed = coalesceSearchQueryWithDestination(query);
  if (!trimmed) {
    return null;
  }

  const geocode = async (keyword: string) => {
    const result = await forwardGeocodeWithAmapGeocoder(keyword);
    return result ? { label: result.label, lng: result.lng, lat: result.lat } : null;
  };

  const hint =
    extractSearchDestination(trimmed) ??
    extractPrimaryLocation(trimmed) ??
    trimmed.split(/[，,]/)[0]?.trim() ??
    trimmed;
  const fromHint = await geocodeHint(hint);
  if (fromHint) {
    return fromHint;
  }

  const resolvedPlaces = await resolveTravelPlacesFromText(trimmed, geocode);
  if (resolvedPlaces.length >= 1) {
    const first = resolvedPlaces[0]!;
    if (first.longitude != null && first.latitude != null) {
      return {
        label: shortPlaceName(first.label),
        longitude: first.longitude,
        latitude: first.latitude,
        coordSystem: first.source === 'local' ? 'wgs84' : 'gcj02',
      };
    }
  }

  return geocodeHint(trimmed);
}

function toResolvedStop(
  place: { name: string; label: string; longitude?: number; latitude?: number; source: 'local' | 'geocode' },
): ResolvedStopLocation | null {
  if (place.longitude == null || place.latitude == null) {
    return null;
  }
  return {
    stopName: place.name,
    label: shortPlaceName(place.label),
    longitude: place.longitude,
    latitude: place.latitude,
    coordSystem: place.source === 'local' ? 'wgs84' : 'gcj02',
  };
}

/** 解析多地联游全部站点坐标（用于地图逐站锚点） */
export function resolveMultiStopFromLocalTable(
  stopNames: string[],
): ResolvedMultiStopSearch | null {
  if (stopNames.length < 2) {
    return null;
  }

  const stops: ResolvedStopLocation[] = [];
  for (const stopName of stopNames) {
    const local = getCityCoordinates(stopName);
    if (!local) {
      return null;
    }
    stops.push({
      stopName,
      label: stopName,
      longitude: local.longitude,
      latitude: local.latitude,
      coordSystem: 'wgs84',
    });
  }

  return {
    routeLabel: stops.map((stop) => stop.stopName).join('→'),
    stops,
    primary: stops[0]!,
  };
}

/** 解析多地联游全部站点坐标（用于地图逐站锚点） */
export async function resolveMultiStopSearchLocations(
  query: string,
): Promise<ResolvedMultiStopSearch | null> {
  const trimmed = coalesceSearchQueryWithDestination(query);
  if (!trimmed) {
    return null;
  }

  const geocode = async (keyword: string) => {
    const result = await forwardGeocodeWithAmapGeocoder(keyword);
    return result ? { label: result.label, lng: result.lng, lat: result.lat } : null;
  };

  const resolvedPlaces = await resolveTravelPlacesFromText(trimmed, geocode);
  const stops = resolvedPlaces
    .map((place) => toResolvedStop(place))
    .filter((item): item is ResolvedStopLocation => item != null);

  if (stops.length < 2) {
    return null;
  }

  const routeLabel = stops.map((stop) => stop.stopName).join('→');
  return {
    routeLabel,
    stops,
    primary: stops[0]!,
  };
}
