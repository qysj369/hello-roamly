import type { ServerEnv } from './deepseekServer';
import { serverAmapReverseGeocode } from './amapGeocodeServer';
import { serverTencentReverseGeocode } from './tencentGeocodeServer';

export type GeocodeProvider = 'amap' | 'tencent';

function readGeocodeProvider(env: ServerEnv): GeocodeProvider {
  const raw = (env.GEOCODE_PROVIDER ?? env.VITE_GEOCODE_PROVIDER ?? 'amap').trim().toLowerCase();
  return raw === 'tencent' ? 'tencent' : 'amap';
}

/** 按配置选择高德或腾讯逆地理编码 */
export async function serverReverseGeocode(
  longitude: number,
  latitude: number,
  env: ServerEnv,
): Promise<string | null> {
  const provider = readGeocodeProvider(env);
  if (provider === 'tencent') {
    return serverTencentReverseGeocode(longitude, latitude, env);
  }
  return serverAmapReverseGeocode(longitude, latitude, env);
}
