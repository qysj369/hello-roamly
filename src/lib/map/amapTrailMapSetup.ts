import { readEnv } from '@/lib/config/env';

/**
 * 轨迹墙底图：用 standard 样式保证地名可见，外层 CSS 略压暗以配合轨迹墙。
 * 勿用 darkblue/dark + showLabel:false，会导致「一片黑、无地名」。
 */
export const DEFAULT_AMAP_TRAIL_MAP_STYLE = 'amap://styles/normal';

/** 缩放 < 11：不显示 3D 楼块，减少 clutter；地名始终在 point 图层 */
export const AMAP_TRAIL_ZOOM_DETAIL = 11;

export function getAmapTrailMapStyle(): string {
  return readEnv('VITE_AMAP_TRAIL_STYLE') ?? DEFAULT_AMAP_TRAIL_MAP_STYLE;
}

export type AmapTrailFeatureLevel = 'standard' | 'detail';

export function resolveAmapTrailFeatureLevel(zoom: number): AmapTrailFeatureLevel {
  return zoom < AMAP_TRAIL_ZOOM_DETAIL ? 'standard' : 'detail';
}

/**
 * 按缩放控制底图要素。
 * 注意：省/市/区县地名在高德里属于 point 图层，绝不能省略 point，否则看不到任何地名。
 */
export function applyAmapTrailMapFeatures(map: AMapMapInstance, zoom: number): void {
  if (zoom < AMAP_TRAIL_ZOOM_DETAIL) {
    map.setFeatures(['bg', 'road', 'point']);
    return;
  }
  map.setFeatures(['bg', 'road', 'point', 'building']);
}

export function ensureAmapTrailLabelsVisible(map: AMapMapInstance): void {
  map.setStatus({ showLabel: true });
  applyAmapTrailMapFeatures(map, map.getZoom());
}

/** 绑定 zoomend：放大后显示楼块；缩小后隐藏楼块但保留地名 */
export function bindAmapTrailZoomFeatures(map: AMapMapInstance): () => void {
  const sync = () => {
    ensureAmapTrailLabelsVisible(map);
  };
  map.on('complete', sync);
  map.on('zoomend', sync);
  sync();
  return () => {
    map.off('complete', sync);
    map.off('zoomend', sync);
  };
}

export function createAmapTrailMapOptions(
  center: [number, number],
  zoom: number,
): Record<string, unknown> {
  return {
    zoom,
    center,
    viewMode: '2D',
    mapStyle: getAmapTrailMapStyle(),
    showLabel: true,
    features: ['bg', 'road', 'point'],
  };
}

/** 轨迹墙容器 CSS：略压暗 standard 底图，与深色 UI 协调 */
export function trailMapVisualFilter(brightness = 1): string {
  const base = Math.max(brightness, 0.88);
  return `brightness(${base * 0.9}) saturate(0.92) contrast(1.04)`;
}
