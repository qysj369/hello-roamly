/** 无 GPS 时的 IP 粗定位（城市级，误差可达数十公里） */
export type IpApproximateLocation = {
  label: string;
  latitude: number;
  longitude: number;
};

type IpApiResponse = {
  status?: string;
  city?: string;
  regionName?: string;
  lat?: number;
  lon?: number;
};

export async function fetchApproximateLocationByIp(
  signal?: AbortSignal,
): Promise<IpApproximateLocation | null> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8_000);

  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(
      'https://ip-api.com/json/?lang=zh-CN&fields=status,message,city,regionName,lat,lon',
      { signal: controller.signal },
    );
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as IpApiResponse;
    if (data.status !== 'success' || data.lat == null || data.lon == null) {
      return null;
    }
    const label = [data.regionName, data.city].filter(Boolean).join('') || '当前城市';
    return {
      label,
      latitude: data.lat,
      longitude: data.lon,
    };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
