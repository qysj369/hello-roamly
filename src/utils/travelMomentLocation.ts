import { isChinaPrimaryMarket } from '@/lib/config/marketScope';
import type { MapCoordinates } from '@/types/domain/travelPlan';

export type TravelMomentLocationValue = {
  label: string;
  coordinates?: MapCoordinates;
  countryCode?: string;
};

export function formatCoordinatesLabel(coords: MapCoordinates): string {
  const lat = coords.latitude.toFixed(4);
  const lng = coords.longitude.toFixed(4);
  if (isChinaPrimaryMarket()) {
    return `北纬 ${lat}，东经 ${lng}`;
  }
  return `${lat}°N, ${lng}°E`;
}
export function buildMapboxStaticMapUrl(
  coordinates: MapCoordinates,
  token: string,
  options?: { width?: number; height?: number; zoom?: number },
): string {
  const width = options?.width ?? 320;
  const height = options?.height ?? 140;
  const zoom = options?.zoom ?? 13;
  const { longitude, latitude } = coordinates;
  const pin = `pin-s-violet+ffffff(${longitude},${latitude})`;
  const center = `${longitude},${latitude},${zoom},0`;
  const params = new URLSearchParams({
    access_token: token,
  });
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${pin}/${center}/${width}x${height}@2x?${params.toString()}`;
}
