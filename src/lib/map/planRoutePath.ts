import type { PlanMapPoint } from '@/lib/map/planMapPoints';

export type LngLatPair = [number, number];

const DEFAULT_STEPS_PER_SEGMENT = 18;

function toLngLatPair(point: Pick<PlanMapPoint, 'longitude' | 'latitude'>): LngLatPair {
  return [point.longitude, point.latitude];
}

/** Catmull-Rom 样条插值（t=0→p1，t=1→p2，整条路径连续平滑） */
export function catmullRomPoint(
  p0: LngLatPair,
  p1: LngLatPair,
  p2: LngLatPair,
  p3: LngLatPair,
  t: number,
): LngLatPair {
  const t2 = t * t;
  const t3 = t2 * t;

  const interpolate = (a: number, b: number, c: number, d: number) =>
    0.5 *
    (2 * b +
      (-a + c) * t +
      (2 * a - 5 * b + 4 * c - d) * t2 +
      (-a + 3 * b - 3 * c + d) * t3);

  return [interpolate(p0[0], p1[0], p2[0], p3[0]), interpolate(p0[1], p1[1], p2[1], p3[1])];
}

/** 将行程点串成一条连续平滑样条曲线 */
export function buildCurvedRouteCoordinates(
  points: Array<Pick<PlanMapPoint, 'longitude' | 'latitude'>>,
  stepsPerSegment = DEFAULT_STEPS_PER_SEGMENT,
): LngLatPair[] {
  if (points.length === 0) {
    return [];
  }
  if (points.length === 1) {
    return [toLngLatPair(points[0])];
  }

  const coords = points.map(toLngLatPair);
  const path: LngLatPair[] = [coords[0]];

  for (let index = 0; index < coords.length - 1; index += 1) {
    const p0 = coords[Math.max(0, index - 1)];
    const p1 = coords[index];
    const p2 = coords[index + 1];
    const p3 = coords[Math.min(coords.length - 1, index + 2)];

    for (let step = 1; step <= stepsPerSegment; step += 1) {
      path.push(catmullRomPoint(p0, p1, p2, p3, step / stepsPerSegment));
    }
  }

  return path;
}

/** 按进度（0–1）截取样条路径，用于打开地图时的串联动画 */
export function sliceCurvedRouteByProgress(
  points: Array<Pick<PlanMapPoint, 'longitude' | 'latitude'>>,
  progress: number,
  stepsPerSegment = DEFAULT_STEPS_PER_SEGMENT,
): { path: LngLatPair[]; visibleMarkerCount: number } {
  if (points.length === 0) {
    return { path: [], visibleMarkerCount: 0 };
  }
  if (points.length === 1 || progress <= 0) {
    return {
      path: [toLngLatPair(points[0])],
      visibleMarkerCount: 1,
    };
  }

  const fullPath = buildCurvedRouteCoordinates(points, stepsPerSegment);
  const clamped = Math.min(1, Math.max(0, progress));
  const endIndex = Math.max(1, Math.round((fullPath.length - 1) * clamped));

  return {
    path: fullPath.slice(0, endIndex + 1),
    visibleMarkerCount: Math.min(
      points.length,
      Math.max(1, Math.floor(clamped * (points.length - 1)) + 1),
    ),
  };
}

export function estimateRouteRevealDurationMs(pointCount: number): number {
  if (pointCount <= 1) {
    return 0;
  }
  return Math.min(3200, 800 + pointCount * 120);
}

/** @deprecated 保留测试兼容 */
export function buildCurveControlPoint(
  start: LngLatPair,
  end: LngLatPair,
  legIndex: number,
): LngLatPair {
  const midLng = (start[0] + end[0]) / 2;
  const midLat = (start[1] + end[1]) / 2;
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const distance = Math.hypot(dx, dy) || 0.0001;
  const bend = Math.min(distance * 0.28, 0.1);
  const direction = legIndex % 2 === 0 ? 1 : -1;
  return [
    midLng + (-dy / distance) * bend * direction,
    midLat + (dx / distance) * bend * direction,
  ];
}
