import { inferCityFromAddress } from '@/lib/map/inferCityFromAddress';

export type ServerGeocodeOriginResult = {
  label: string;
  lng: number;
  lat: number;
};

/** 经本站 API 解析地址（服务端 Web 服务 Key，避免浏览器 Key 平台不匹配） */
export async function fetchServerOriginGeocode(
  address: string,
  city?: string,
): Promise<ServerGeocodeOriginResult | null> {
  const trimmed = address.trim();
  if (!trimmed) {
    return null;
  }

  const params = new URLSearchParams({ address: trimmed });
  const resolvedCity = city?.trim() || inferCityFromAddress(trimmed);
  if (resolvedCity) {
    params.set('city', resolvedCity);
  }

  try {
    const response = await fetch(`/api/map/geocode-origin?${params.toString()}`);
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as ServerGeocodeOriginResult;
    if (
      typeof data.label !== 'string' ||
      typeof data.lng !== 'number' ||
      typeof data.lat !== 'number'
    ) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
