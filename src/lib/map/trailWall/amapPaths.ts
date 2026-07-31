import { wgs84ToGcj02 } from '@/lib/map/coordinates';

/** GeoJSON 线坐标（WGS84）→ 高德路径（GCJ-02） */
export function wgs84LineToAmapPath(coordinates: number[][]): [number, number][] {
  return coordinates.map(([longitude, latitude]) => {
    const gcj = wgs84ToGcj02(longitude, latitude);
    return [gcj.longitude, gcj.latitude];
  });
}

export function wgs84PointToAmapPoint(coordinates: number[]): [number, number] {
  const [longitude, latitude] = coordinates;
  const gcj = wgs84ToGcj02(longitude ?? 0, latitude ?? 0);
  return [gcj.longitude, gcj.latitude];
}
