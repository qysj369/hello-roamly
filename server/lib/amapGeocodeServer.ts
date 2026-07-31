import type { ServerEnv } from './deepseekServer';
import {
  resolveAmapPlaceName,
  type AmapRegeocodePayload,
} from '@/lib/map/resolveAmapPlaceName';

const REGEO_URL = 'https://restapi.amap.com/v3/geocode/regeo';
const GEO_URL = 'https://restapi.amap.com/v3/geocode/geo';
const PLACE_TEXT_URL = 'https://restapi.amap.com/v3/place/text';

export type GeocodeOriginResult = {
  label: string;
  lng: number;
  lat: number;
  source: 'place' | 'geo';
};

type AmapGeocodeGeoResponse = {
  status?: string;
  info?: string;
  geocodes?: Array<{ formatted_address?: string; location?: string }>;
};

type AmapPlaceTextResponse = {
  status?: string;
  info?: string;
  pois?: Array<{ name?: string; address?: string; location?: string }>;
};

function parseLocationPair(location: string): { lng: number; lat: number } | null {
  const [lng, lat] = location.split(',').map((part) => Number.parseFloat(part.trim()));
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return null;
  }
  return { lng, lat };
}

type AmapRegeocodeResponse = {
  status?: string;
  regeocode?: AmapRegeocodePayload & {
    formatted_address?: string;
    addressComponent?: AmapRegeocodePayload['addressComponent'];
    pois?: AmapRegeocodePayload['pois'];
  };
};

export function readAmapWebServiceKey(env: ServerEnv): string | undefined {
  return (
    env.AMAP_WEB_SERVICE_KEY ??
    env.VITE_AMAP_WEB_SERVICE_KEY ??
    env.AMAP_KEY ??
    env.VITE_AMAP_KEY
  )?.trim() || undefined;
}

/** 服务端高德逆地理编码（GCJ-02；extensions=all + 800m POI） */
export async function serverAmapReverseGeocode(
  longitude: number,
  latitude: number,
  env: ServerEnv,
): Promise<string | null> {
  const key = readAmapWebServiceKey(env);
  if (!key) {
    return null;
  }

  const params = new URLSearchParams({
    key,
    location: `${longitude},${latitude}`,
    output: 'JSON',
    extensions: 'all',
    radius: '800',
  });

  const response = await fetch(`${REGEO_URL}?${params.toString()}`);
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as AmapRegeocodeResponse;
  if (data.status !== '1' || !data.regeocode) {
    return null;
  }

  const payload: AmapRegeocodePayload = {
    formatted_address: data.regeocode.formatted_address,
    addressComponent: data.regeocode.addressComponent,
    pois: data.regeocode.pois,
  };

  return resolveAmapPlaceName(payload);
}

/** 服务端 POI 关键词搜索（需 Web 服务 Key） */
export async function serverAmapPlaceTextSearch(
  keywords: string,
  city: string | undefined,
  env: ServerEnv,
): Promise<GeocodeOriginResult | null> {
  const key = readAmapWebServiceKey(env);
  if (!key) {
    return null;
  }

  const params = new URLSearchParams({
    key,
    keywords: keywords.trim(),
    offset: '1',
    page: '1',
    extensions: 'base',
    output: 'JSON',
  });
  if (city?.trim()) {
    params.set('city', city.trim());
    params.set('citylimit', 'true');
  }

  const response = await fetch(`${PLACE_TEXT_URL}?${params.toString()}`);
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as AmapPlaceTextResponse;
  const poi = data.pois?.[0];
  if (data.status !== '1' || !poi?.location) {
    return null;
  }

  const coords = parseLocationPair(poi.location);
  if (!coords) {
    return null;
  }

  const addressPart = poi.address?.trim();
  const label = addressPart
    ? `${poi.name?.trim() || keywords}（${addressPart}）`
    : poi.name?.trim() || keywords;

  return { label, lng: coords.lng, lat: coords.lat, source: 'place' };
}

/** 服务端地理编码（需 Web 服务 Key） */
export async function serverAmapForwardGeocode(
  address: string,
  city: string | undefined,
  env: ServerEnv,
): Promise<GeocodeOriginResult | null> {
  const key = readAmapWebServiceKey(env);
  if (!key) {
    return null;
  }

  const params = new URLSearchParams({
    key,
    address: address.trim(),
    output: 'JSON',
  });
  if (city?.trim()) {
    params.set('city', city.trim());
  }

  const response = await fetch(`${GEO_URL}?${params.toString()}`);
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as AmapGeocodeGeoResponse;
  const geocode = data.geocodes?.[0];
  if (data.status !== '1' || !geocode?.location) {
    return null;
  }

  const coords = parseLocationPair(geocode.location);
  if (!coords) {
    return null;
  }

  return {
    label: geocode.formatted_address?.trim() || address.trim(),
    lng: coords.lng,
    lat: coords.lat,
    source: 'geo',
  };
}

/** 出发地地址解析：POI → 地理编码 */
export async function serverResolveOriginAddress(
  address: string,
  city: string | undefined,
  env: ServerEnv,
): Promise<GeocodeOriginResult | null> {
  const trimmed = address.trim();
  if (!trimmed) {
    return null;
  }

  const fromPlace = await serverAmapPlaceTextSearch(trimmed, city, env);
  if (fromPlace) {
    return fromPlace;
  }

  return serverAmapForwardGeocode(trimmed, city, env);
}
