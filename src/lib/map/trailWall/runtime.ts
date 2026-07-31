import { getTrailWallMapStyle } from '@/lib/config/homeMapTrail';
import { getMapboxToken } from '@/lib/map/mapbox';
import {
  getMapProviderMode,
  hasAmapCredentials,
  hasMapboxCredentials,
} from '@/lib/map/provider';

/** 无 Mapbox / 高德时的免费暗色底图（Carto Dark Matter） */
export const TRAIL_WALL_FALLBACK_MAP_STYLE =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export type TrailWallMapRuntime =
  | { provider: 'mapbox'; token: string; style: string }
  | { provider: 'amap' }
  | { provider: 'maplibre'; style: string };

/** 与全站地图策略一致：auto 优先高德，其次 Mapbox，最后 MapLibre 演示底图 */
export function resolveTrailWallMapRuntime(): TrailWallMapRuntime {
  const mode = getMapProviderMode();

  if (mode === 'mapbox' && hasMapboxCredentials()) {
    const token = getMapboxToken();
    if (token) {
      return { provider: 'mapbox', token, style: getTrailWallMapStyle() };
    }
  }

  if (mode === 'amap' && hasAmapCredentials()) {
    return { provider: 'amap' };
  }

  if (mode === 'auto') {
    if (hasAmapCredentials()) {
      return { provider: 'amap' };
    }
    const token = getMapboxToken();
    if (token) {
      return { provider: 'mapbox', token, style: getTrailWallMapStyle() };
    }
  }

  return {
    provider: 'maplibre',
    style: TRAIL_WALL_FALLBACK_MAP_STYLE,
  };
}
