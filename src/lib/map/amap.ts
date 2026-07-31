import { readEnv } from '@/lib/config/env';
import { normalizeMapCredential } from '@/lib/map/credentials';
import type { MapViewState } from '@/lib/map/types';

/** 高德 Web 端 Key：https://console.amap.com/dev/key/app */
export function getAmapKey(): string | undefined {
  return normalizeMapCredential(readEnv('VITE_AMAP_KEY'));
}

/** 高德 Web 服务 Key（REST 地理编码/POI，与 JS Key 不可混用） */
export function getAmapWebServiceKey(): string | undefined {
  return (
    normalizeMapCredential(readEnv('VITE_AMAP_WEB_SERVICE_KEY')) ?? getAmapKey()
  );
}

/** 高德安全密钥（JS API 2.0 必填，与 Key 配对） */
export function getAmapSecurityCode(): string | undefined {
  return normalizeMapCredential(readEnv('VITE_AMAP_SECURITY_CODE'));
}

/** 默认视野：北京（GCJ-02，与高德底图一致） */
export const DEFAULT_AMAP_VIEW: MapViewState = {
  longitude: 116.4074,
  latitude: 39.9042,
  zoom: 10,
};

declare global {
  interface Window {
    _AMapSecurityConfig?: {
      securityJsCode?: string;
    };
  }
}

/** 加载 JS API 前注入安全密钥配置 */
export function configureAmapSecurity(): void {
  const code = getAmapSecurityCode();
  if (!code || typeof window === 'undefined') {
    return;
  }
  window._AMapSecurityConfig = { securityJsCode: code };
}
