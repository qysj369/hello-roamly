import { describe, expect, it } from 'vitest';

import { getMapDisplayPoints, getRouteDrawablePoints, type PlanMapPoint } from '@/lib/map/planMapPoints';
import { isTransitRouteStop } from '@/lib/map/planRouteStops';

function point(partial: Partial<PlanMapPoint> & Pick<PlanMapPoint, 'order'>): PlanMapPoint {
  return {
    id: `point-${partial.order}`,
    name: partial.name ?? `活动 ${partial.order + 1}`,
    description: partial.description ?? '',
    location: partial.location,
    time: partial.time ?? '09:00',
    day: partial.day ?? 1,
    dayTitle: partial.dayTitle ?? '第1天',
    order: partial.order,
    longitude: partial.longitude ?? 104.05,
    latitude: partial.latitude ?? 30.66,
    geocoded: partial.geocoded ?? true,
  };
}

describe('planRouteStops', () => {
  it('detects stations and door-to-door transit nodes', () => {
    expect(isTransitRouteStop(point({ order: 0, location: '济南西站' }))).toBe(true);
    expect(isTransitRouteStop(point({ order: 1, location: '成都东站' }))).toBe(true);
    expect(isTransitRouteStop(point({ order: 2, description: '从家门口打车到济南西站' }))).toBe(true);
    expect(isTransitRouteStop(point({ order: 3, dayTitle: '返程·济南' }))).toBe(true);
  });

  it('keeps sightseeing POIs in route candidates', () => {
    expect(isTransitRouteStop(point({ order: 0, location: '宽窄巷子' }))).toBe(false);
    expect(isTransitRouteStop(point({ order: 1, location: '临清宛园' }))).toBe(false);
  });
});

describe('getRouteDrawablePoints cross-city filtering', () => {
  const destinationAnchor = { longitude: 115.7047, latitude: 36.8384 };

  it('excludes origin city and transit stops from destination route line', () => {
    const points = [
      point({ order: 0, location: '济南西站', longitude: 116.89, latitude: 36.65 }),
      point({ order: 1, location: '临清宛园', longitude: 115.71, latitude: 36.84 }),
      point({ order: 2, location: '东昌湖', longitude: 115.99, latitude: 36.45 }),
      point({ order: 3, location: '返程济南', longitude: 117.12, latitude: 36.65 }),
    ];

    const routePoints = getRouteDrawablePoints(points, destinationAnchor);
    expect(routePoints.map((item) => item.location)).toEqual(['临清宛园', '东昌湖']);
  });
});

describe('getMapDisplayPoints', () => {
  const destinationAnchor = { longitude: 115.7047, latitude: 36.8384 };

  it('shows sightseeing stops without transit nodes', () => {
    const points = [
      point({ order: 0, location: '济南西站', longitude: 116.89, latitude: 36.65 }),
      point({ order: 1, location: '临清宛园', longitude: 115.71, latitude: 36.84 }),
      point({ order: 2, location: '东昌湖', longitude: 115.99, latitude: 36.45, geocoded: false }),
    ];

    const displayPoints = getMapDisplayPoints(points, destinationAnchor);
    expect(displayPoints.map((item) => item.location)).toEqual(['临清宛园', '东昌湖']);
  });
});
