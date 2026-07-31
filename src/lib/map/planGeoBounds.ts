import type { MapCoordinates } from '@/types/domain/travelPlan';
import type { PlanMapPoint } from '@/lib/map/planMapPoints';

/** 近似平面距离（km），用于行程地图范围校验 */
export function distanceKm(a: MapCoordinates, b: MapCoordinates): number {
  const latMid = ((a.latitude + b.latitude) / 2) * (Math.PI / 180);
  const dx = (a.longitude - b.longitude) * 111 * Math.cos(latMid);
  const dy = (a.latitude - b.latitude) * 111;
  return Math.hypot(dx, dy);
}

/** 坐标是否落在行程目的地合理范围内（单城多日游通常 < 120km） */
export function isWithinPlanRegion(
  coords: MapCoordinates,
  anchor: MapCoordinates,
  maxKm = 120,
): boolean {
  return distanceKm(coords, anchor) <= maxKm;
}

/** 过滤偏离锚点过远的精确定位点，避免 fitView 缩放到全国 */
export function filterMapViewportPoints(
  points: PlanMapPoint[],
  anchor: MapCoordinates,
  maxKm = 120,
): PlanMapPoint[] {
  const geocoded = points.filter((point) => point.geocoded);
  if (geocoded.length === 0) {
    return points;
  }

  const inRegion = geocoded.filter((point) =>
    isWithinPlanRegion(
      { longitude: point.longitude, latitude: point.latitude },
      anchor,
      maxKm,
    ),
  );

  if (inRegion.length >= 2) {
    return inRegion;
  }
  if (inRegion.length === 1) {
    return inRegion;
  }
  if (geocoded.length >= 2) {
    return geocoded;
  }
  return points;
}
