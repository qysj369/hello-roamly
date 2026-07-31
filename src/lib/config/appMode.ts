import { readEnv } from '@/lib/config/env';

export type AppRuntimeMode = 'production' | 'development';

const PRODUCTION_ALIASES = new Set(['production', 'prod', 'online', 'live']);

/**
 * 应用运行模式。
 * - development（默认）：允许演示地图、Mock AI、本地模板行程
 * - production：仅真实服务（DeepSeek / 高德等），缺配置时明确报错
 */
export function getAppRuntimeMode(): AppRuntimeMode {
  const explicit = readEnv('VITE_APP_MODE')?.toLowerCase();
  if (explicit && PRODUCTION_ALIASES.has(explicit)) {
    return 'production';
  }
  if (explicit === 'development' || explicit === 'dev' || explicit === 'demo') {
    return 'development';
  }

  // 正式构建默认上线模式；本地 dev 默认演示，除非显式 VITE_APP_MODE=production
  if (import.meta.env.PROD) {
    return 'production';
  }

  return 'development';
}

export function isProductionAppMode(): boolean {
  return getAppRuntimeMode() === 'production';
}

export function isDevelopmentAppMode(): boolean {
  return !isProductionAppMode();
}
