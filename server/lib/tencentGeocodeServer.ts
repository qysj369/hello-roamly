import type { ServerEnv } from './deepseekServer';

const TENCENT_GEOCODER_URL = 'https://apis.map.qq.com/ws/geocoder/v1';

type TencentGeocoderResponse = {
  status?: number;
  message?: string;
  result?: {
    address?: string;
    formatted_addresses?: {
      recommend?: string;
      rough?: string;
    };
    address_component?: {
      nation?: string;
      province?: string;
      city?: string;
      district?: string;
      street?: string;
    };
  };
};

function readTencentMapKey(env: ServerEnv): string | undefined {
  return (
    env.TENCENT_MAP_KEY ??
    env.VITE_TENCENT_MAP_KEY ??
    env.QQ_MAP_KEY ??
    env.VITE_QQ_MAP_KEY
  )?.trim() || undefined;
}

function shortPlaceName(formatted: string): string {
  const parts = formatted.split(/[,，]/).map((part) => part.trim()).filter(Boolean);
  return parts[0] ?? formatted;
}

/**
 * 腾讯位置服务逆地理编码（GCJ-02）
 *
 * 示例（Web 服务）：
 * ```js
 * const lat = 36.6512;
 * const lng = 117.1201;
 * const key = process.env.TENCENT_MAP_KEY;
 * const url =
 *   `https://apis.map.qq.com/ws/geocoder/v1/?location=${lat},${lng}&key=${key}&get_poi=0`;
 * const res = await fetch(url);
 * const data = await res.json();
 * // data.result.address 或 data.result.formatted_addresses.recommend
 * ```
 */
export async function serverTencentReverseGeocode(
  longitude: number,
  latitude: number,
  env: ServerEnv,
): Promise<string | null> {
  const key = readTencentMapKey(env);
  if (!key) {
    return null;
  }

  const params = new URLSearchParams({
    location: `${latitude},${longitude}`,
    key,
    get_poi: '0',
  });

  const response = await fetch(`${TENCENT_GEOCODER_URL}/?${params.toString()}`);
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as TencentGeocoderResponse;
  if (data.status !== 0 || !data.result) {
    return null;
  }

  const formatted =
    data.result.formatted_addresses?.recommend ??
    data.result.formatted_addresses?.rough ??
    data.result.address;

  if (!formatted) {
    return null;
  }

  return shortPlaceName(formatted);
}
