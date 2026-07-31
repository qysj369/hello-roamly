import { amapGeocodePlace, amapGeocodePlaces, amapReverseGeocodePlace, clearAmapGeocodeCache } from '@/lib/map/amapGeocode';
import { amapGeocodePlanPlaces, clearAmapPlanGeocodeCache } from '@/lib/map/amapGeocodePlan';
import {
  geocodePlace as mapboxGeocodePlace,
  geocodePlaces as mapboxGeocodePlaces,
  reverseGeocodePlace as mapboxReverseGeocodePlace,
  clearGeocodeCache as clearMapboxGeocodeCache,
} from '@/lib/map/mapboxGeocode';
import { getMapboxToken } from '@/lib/map/mapbox';
import { resolveMapProvider } from '@/lib/map/provider';
import type { GeocodeOptions, ReverseGeocodeResult } from '@/lib/map/types';
import type { MapCoordinates } from '@/types/domain/travelPlan';

export type { GeocodeOptions, ReverseGeocodeResult } from '@/lib/map/types';

export function clearGeocodeCache(): void {
  clearMapboxGeocodeCache();
  clearAmapGeocodeCache();
  clearAmapPlanGeocodeCache();
}

/** 统一地理编码：按当前地图服务商（高德优先 / Mapbox） */
export async function geocodePlace(
  query: string,
  options: GeocodeOptions = {},
): Promise<MapCoordinates | null> {
  const provider = resolveMapProvider();
  if (provider === 'amap') {
    return amapGeocodePlace(query, options);
  }
  if (provider === 'mapbox') {
    const token = getMapboxToken();
    if (!token) {
      return null;
    }
    return mapboxGeocodePlace(query, { token, ...options, limit: options.limit ?? 1 });
  }
  return null;
}

export async function geocodePlaces(
  queries: string[],
  options: GeocodeOptions = {},
): Promise<Map<string, MapCoordinates | null>> {
  const provider = resolveMapProvider();
  if (provider === 'amap') {
    return amapGeocodePlaces(queries, options);
  }
  if (provider === 'mapbox') {
    const token = getMapboxToken();
    if (!token) {
      return new Map();
    }
    return mapboxGeocodePlaces(queries, { token, ...options });
  }
  return new Map();
}

/** 行程地图批量解析（高德走快速并行通道） */
export async function geocodePlanPlaces(
  queries: string[],
  options: GeocodeOptions = {},
): Promise<Map<string, MapCoordinates | null>> {
  const provider = resolveMapProvider();
  if (provider === 'amap') {
    return amapGeocodePlanPlaces(queries, options);
  }
  return geocodePlaces(queries, options);
}

export async function reverseGeocodePlace(
  longitude: number,
  latitude: number,
): Promise<ReverseGeocodeResult | null> {
  const provider = resolveMapProvider();
  if (provider === 'amap') {
    return amapReverseGeocodePlace(longitude, latitude);
  }
  if (provider === 'mapbox') {
    const token = getMapboxToken();
    if (!token) {
      return null;
    }
    return mapboxReverseGeocodePlace(longitude, latitude, token);
  }
  return null;
}
