import { getMapillaryAccessToken } from '@/lib/map/mapillary';

export type MapillaryNearbyImage = {
  id: string;
  sequenceId?: string;
  lng: number;
  lat: number;
};

type MapillaryImageResponse = {
  data?: Array<{
    id: string;
    sequence?: string;
    geometry?: { type?: string; coordinates?: [number, number] };
  }>;
};

/**
 * 按经纬度查找附近 Mapillary 图像（用于连续序列起点）。
 * @see https://www.mapillary.com/developer/api-documentation
 */
export async function fetchMapillaryNearbyImage(
  lng: number,
  lat: number,
  radiusMeters = 120,
): Promise<MapillaryNearbyImage | null> {
  const token = getMapillaryAccessToken();
  if (!token) {
    return null;
  }

  const params = new URLSearchParams({
    access_token: token,
    fields: 'id,geometry,sequence',
    closeto: `${lng},${lat}`,
    radius: String(radiusMeters),
  });

  const response = await fetch(`https://graph.mapillary.com/images?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Mapillary 查询失败 (${response.status})`);
  }

  const payload = (await response.json()) as MapillaryImageResponse;
  const first = payload.data?.[0];
  if (!first?.id) {
    return null;
  }

  const coordinates = first.geometry?.coordinates;
  return {
    id: first.id,
    sequenceId: first.sequence,
    lng: coordinates?.[0] ?? lng,
    lat: coordinates?.[1] ?? lat,
  };
}
