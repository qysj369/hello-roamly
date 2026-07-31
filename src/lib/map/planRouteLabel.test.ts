import { describe, expect, it } from 'vitest';
import {
  buildPlanRouteDisplayLabel,
  filterOriginFromMultiStops,
  preferPlanRouteLabel,
} from '@/lib/map/planRouteLabel';

describe('buildPlanRouteDisplayLabel', () => {
  it('prefixes origin before multi-stop chain', () => {
    expect(
      buildPlanRouteDisplayLabel('曲阜→微山湖→台儿庄', '济南市历下区中林路绿城百合花园'),
    ).toBe('济南市历下区中林路绿城百合花园 → 曲阜→微山湖→台儿庄');
  });

  it('keeps destination only when origin matches first stop region', () => {
    expect(buildPlanRouteDisplayLabel('济南→青岛', '济南市历下区')).toBe('济南→青岛');
  });
});

describe('filterOriginFromMultiStops', () => {
  it('removes origin city accidentally parsed as a stop', () => {
    expect(
      filterOriginFromMultiStops(['济南', '曲阜', '微山湖', '台儿庄'], '济南市历下区'),
    ).toEqual(['曲阜', '微山湖', '台儿庄']);
  });
});

describe('preferPlanRouteLabel', () => {
  it('keeps client three-stop route over server geocode mistake', () => {
    expect(
      preferPlanRouteLabel('曲阜→微山湖→台儿庄', '济宁→曲阜'),
    ).toBe('曲阜→微山湖→台儿庄');
  });
});
