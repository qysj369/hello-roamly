import { describe, expect, it } from 'vitest';
import {
  cityDotWorldPosition,
  nextCityDotInteractionMode,
  resolveCityDotClick,
} from '@/components/capsule-one/EarthCityDots';
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

  it('upgrades a click to drag after pointer travel', () => {
    expect(nextCityDotInteractionMode('click', 2, 2)).toBe('click');
    expect(nextCityDotInteractionMode('click', 12, 0)).toBe('drag');
    expect(nextCityDotInteractionMode('drag', 0, 0)).toBe('drag');
    expect(nextCityDotInteractionMode('idle', 40, 40)).toBe('idle');
  });

  it('prints a city only for a stationary click', () => {
    const hangzhouIndex = capsuleCityPoints.findIndex((city) => city.id === 'hangzhou');
    expect(resolveCityDotClick(hangzhouIndex, 'click')?.label).toBe('杭州');
    expect(resolveCityDotClick(hangzhouIndex, 'drag')).toBeNull();
    expect(resolveCityDotClick(hangzhouIndex, 'idle')).toBeNull();
    expect(resolveCityDotClick(undefined, 'click')).toBeNull();
    expect(resolveCityDotClick(999, 'click')).toBeNull();
  });
});
