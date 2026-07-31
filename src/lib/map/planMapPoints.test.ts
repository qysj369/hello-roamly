import { describe, expect, it } from 'vitest';
import { buildTravelPlanFromGuide } from '@/data/buildTravelPlan';
import { demoGuides } from '@/data/demoGuides';
import { buildPlanMapPoints, buildPlanRouteGeoJson, canDrawPlanRoute } from '@/lib/map/planMapPoints';

describe('planMapPoints', () => {
  it('builds ordered points and route line for demo hangzhou plan', () => {
    const guide = demoGuides.find((item) => item.id === 'hangzhou');
    expect(guide).toBeDefined();
    const plan = buildTravelPlanFromGuide(guide!);
    const points = buildPlanMapPoints(plan);

    expect(points.length).toBeGreaterThan(1);
    expect(points[0]?.day).toBe(1);
    expect(points.every((point) => Number.isFinite(point.longitude))).toBe(true);

    const route = buildPlanRouteGeoJson(points);
    expect(route?.geometry.type).toBe('LineString');
    expect(route?.geometry.coordinates.length).toBe(points.length);
    expect(canDrawPlanRoute(points)).toBe(false);
  });

  it('allows route drawing only when at least two points are geocoded', () => {
    const guide = demoGuides.find((item) => item.id === 'hangzhou');
    expect(guide).toBeDefined();
    const plan = buildTravelPlanFromGuide(guide!);
    const points = buildPlanMapPoints(plan).map((point, index) => ({
      ...point,
      geocoded: index < 2,
    }));

    expect(canDrawPlanRoute(points)).toBe(true);
  });
});
