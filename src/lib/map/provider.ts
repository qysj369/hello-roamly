import { isProductionAppMode } from '@/lib/config/appMode';
import { readEnv } from '@/lib/config/env';
import { getAmapKey, getAmapSecurityCode } from '@/lib/map/amap';
import { getMapboxToken } from '@/lib/map/mapbox';
import type { MapProviderId } from '@/lib/map/types';

export type MapProviderMode = 'auto' | MapProviderId;

/** VITE_MAP_PROVIDER：auto（默认）| amap | mapbox */
export function getMapProviderMode(): MapProviderMode {
  const raw = readEnv('VITE_MAP_PROVIDER')?.toLowerCase();
  if (raw === 'amap' || raw === 'mapbox') {
    return raw;
  }
  return 'auto';
}

export function hasAmapCredentials(): boolean {
  return Boolean(getAmapKey() && getAmapSecurityCode());
}

/** 开发环境是否启用免 Key 演示地图（VITE_MAP_DEV_DEMO=0 可关闭） */
export function canShowDevDemoMap(): boolean {
  if (isProductionAppMode()) {
    return false;
  }
  if (!import.meta.env.DEV) {
    return false;
  }
  const flag = readEnv('VITE_MAP_DEV_DEMO')?.toLowerCase();
  if (flag === '0' || flag === 'false') {
    return false;
  }
  return true;
}

/** 页面上能否展示可交互地图（含开发演示） */
export function hasDisplayableMap(): boolean {
  return hasMapService() || canShowDevDemoMap();
}

export function hasMapboxCredentials(): boolean {
  return Boolean(getMapboxToken());
}

/** 是否已配置任一地图服务 */
export function hasMapService(): boolean {
  const mode = getMapProviderMode();
  if (mode === 'amap') {
    return hasAmapCredentials();
  }
  if (mode === 'mapbox') {
    return hasMapboxCredentials();
  }
  return hasAmapCredentials() || hasMapboxCredentials();
}

/**
 * 解析当前使用的地图服务商。
 * auto：优先高德（中国版），否则 Mapbox。
 */
export function resolveMapProvider(): MapProviderId | null {
  const mode = getMapProviderMode();

  if (mode === 'amap') {
    return hasAmapCredentials() ? 'amap' : null;
  }
  if (mode === 'mapbox') {
    return hasMapboxCredentials() ? 'mapbox' : null;
  }

  if (hasAmapCredentials()) {
    return 'amap';
  }
  if (hasMapboxCredentials()) {
    return 'mapbox';
  }
  return null;
}

export function getMapProviderLabel(provider: MapProviderId): string {
  return provider === 'amap' ? '高德地图' : 'Mapbox';
}
