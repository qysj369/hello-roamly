import type { ServerEnv } from './deepseekServer';
import {
  serverAmapForwardGeocode,
  serverAmapPlaceTextSearch,
} from './amapGeocodeServer';
import {
  resolveTravelPlacesFromText,
  type GeocodePlaceFn,
} from '@/lib/map/resolveTravelPlaces';

export function createServerGeocodePlaceFn(env: ServerEnv): GeocodePlaceFn {
  return async (keyword: string) => {
    const fromPlace = await serverAmapPlaceTextSearch(keyword, undefined, env);
    if (fromPlace) {
      return { label: fromPlace.label, lng: fromPlace.lng, lat: fromPlace.lat };
    }
    const fromGeo = await serverAmapForwardGeocode(keyword, undefined, env);
    if (fromGeo) {
      return { label: fromGeo.label, lng: fromGeo.lng, lat: fromGeo.lat };
    }
    return null;
  };
}

export async function serverResolveTravelPlaces(text: string, env: ServerEnv) {
  return resolveTravelPlacesFromText(text, createServerGeocodePlaceFn(env));
}
