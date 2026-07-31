import { getAmapKey } from '@/lib/map/amap';
import { getMapboxToken } from '@/lib/map/mapbox';
import { resolveMapProvider } from '@/lib/map/provider';
import type { MapCoordinates } from '@/types/domain/travelPlan';
import { buildMapboxStaticMapUrl } from '@/utils/travelMomentLocation';

export type StaticMapOptions = {
  width?: number;
  height?: number;
  zoom?: number;
};

/**
 * 按当前地图服务商生成静态地图预览 URL（高德 / Mapbox）。
 * 未配置 Key 时返回 null。
 */
export function buildStaticMapPreviewUrl(
  coordinates: MapCoordinates,
  options?: StaticMapOptions,
): string | null {
  const provider = resolveMapProvider();
  const width = options?.width ?? 320;
  const height = options?.height ?? 140;
  const zoom = options?.zoom ?? 13;
  const { longitude, latitude } = coordinates;

  if (provider === 'amap') {
    const key = getAmapKey();
    if (!key) {
      return null;
    }
    const params = new URLSearchParams({
      key,
      location: `${longitude},${latitude}`,
      zoom: String(zoom),
      size: `${width}*${height}`,
      markers: `mid,0x8B5CF6,${longitude},${latitude}`,
    });
    return `https://restapi.amap.com/v3/staticmap?${params.toString()}`;
  }

  if (provider === 'mapbox') {
    const token = getMapboxToken();
    if (!token) {
      return null;
    }
    return buildMapboxStaticMapUrl(coordinates, token, options);
  }

  return null;
}
