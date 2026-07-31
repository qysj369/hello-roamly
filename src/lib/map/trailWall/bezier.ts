/** 二次贝塞尔曲线采样 — 用于地图轨迹弧线 */

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash + value.charCodeAt(i) * (i + 3)) % 997;
  }
  return hash;
}

function quadraticPoint(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  t: number,
): [number, number] {
  const u = 1 - t;
  const lng = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0];
  const lat = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
  return [lng, lat];
}

function controlPoint(
  start: [number, number],
  end: [number, number],
  bendSeed: string,
): [number, number] {
  const midLng = (start[0] + end[0]) / 2;
  const midLat = (start[1] + end[1]) / 2;
  const hash = hashString(bendSeed);
  const sign = hash % 2 === 0 ? 1 : -1;
  const magnitude = 0.12 + (hash % 7) * 0.02;
  const deltaLng = (end[0] - start[0]) * magnitude * sign;
  const deltaLat = (end[1] - start[1]) * magnitude * -sign;
  return [midLng + deltaLng, midLat + deltaLat];
}

export function sampleQuadraticBezier(
  start: [number, number],
  end: [number, number],
  steps = 40,
  bendSeed = `${start.join(',')}-${end.join(',')}`,
): [number, number][] {
  const control = controlPoint(start, end, bendSeed);
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i += 1) {
    points.push(quadraticPoint(start, control, end, i / steps));
  }
  return points;
}
