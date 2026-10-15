import { describe, expect, it } from 'vitest';
import { cityDotWorldPosition, resolveCityDotClick } from '@/components/capsule-one/EarthCityDots';
import { EARTH_RADIUS } from '@/components/capsule-one/geoMath';
import { capsuleCityPoints } from '@/data/capsuleHotRoutes';

describe('EarthCityDots', () => {
  it('places every city on the earth surface shell', () => {
    const expectedRadius = EARTH_RADIUS + 0.08;
    for (const city of capsuleCityPoints) {
      const point = cityDotWorldPosition(city.lat, city.lng);
      expect(Number.isFinite(point.x)).toBe(true);
      expect(Number.isFinite(point.y)).toBe(true);
      expect(Number.isFinite(point.z)).toBe(true);
      expect(point.length()).toBeCloseTo(expectedRadius, 5);
    }
  });

  it('resolves click to the city name, ignoring drag', () => {
    const hangzhouIndex = capsuleCityPoints.findIndex((city) => city.id === 'hangzhou');
    expect(resolveCityDotClick(hangzhouIndex, false)?.label).toBe('杭州');
    expect(resolveCityDotClick(hangzhouIndex, true)).toBeNull();
    expect(resolveCityDotClick(undefined, false)).toBeNull();
    expect(resolveCityDotClick(999, false)).toBeNull();
  });
});
