import { describe, expect, it } from 'vitest';

import {
  buildCurvedRouteCoordinates,
  buildCurveControlPoint,
  catmullRomPoint,
  sliceCurvedRouteByProgress,
} from '@/lib/map/planRoutePath';

describe('planRoutePath', () => {
  const points = [
    { longitude: 104.06, latitude: 30.57 },
    { longitude: 104.08, latitude: 30.58 },
    { longitude: 104.1, latitude: 30.56 },
  ];

  it('builds a single continuous spline denser than control points', () => {
    const curved = buildCurvedRouteCoordinates(points);
    expect(curved.length).toBeGreaterThan(points.length * 5);
    expect(curved[0]).toEqual([104.06, 30.57]);
    expect(curved.at(-1)?.[0]).toBeCloseTo(104.1, 2);
  });

  it('spline passes through intermediate waypoints approximately', () => {
    const curved = buildCurvedRouteCoordinates(points);
    const mid = curved[Math.floor(curved.length / 2)];
    expect(mid[0]).toBeGreaterThan(104.06);
    expect(mid[0]).toBeLessThan(104.1);
  });

  it('catmull-rom segment is smooth between adjacent control points', () => {
    const first = buildCurveControlPoint([0, 0], [1, 0], 0);
    const second = buildCurveControlPoint([1, 0], [2, 0], 1);
    expect(first[1]).not.toBeCloseTo(second[1], 1);

    const onCurve = catmullRomPoint([0, 0], [0, 0], [1, 0], [2, 0], 0.5);
    expect(onCurve[0]).toBeGreaterThan(0);
    expect(onCurve[0]).toBeLessThan(1);
  });

  it('reveals path progressively with spline progress', () => {
    const start = sliceCurvedRouteByProgress(points, 0);
    const mid = sliceCurvedRouteByProgress(points, 0.5);
    const end = sliceCurvedRouteByProgress(points, 1);

    expect(start.path.length).toBe(1);
    expect(mid.path.length).toBeGreaterThan(start.path.length);
    expect(end.path.length).toBeGreaterThan(mid.path.length);
    expect(end.visibleMarkerCount).toBe(3);
  });
});
