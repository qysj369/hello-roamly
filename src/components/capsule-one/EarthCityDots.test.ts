import { describe, expect, it } from 'vitest';
import {
  cityDotWorldPosition,
  isCityDotTap,
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

  it('treats a short still press as a tap, not a hold or drag', () => {
    expect(isCityDotTap('click', 80)).toBe(true);
    expect(isCityDotTap('click', 400)).toBe(true);
    expect(isCityDotTap('click', 401)).toBe(false);
    expect(isCityDotTap('drag', 80)).toBe(false);
    expect(isCityDotTap('idle', 80)).toBe(false);
  });

  it('resolves a city name only for a short stationary tap', () => {
    const hangzhouIndex = capsuleCityPoints.findIndex((city) => city.id === 'hangzhou');
    expect(resolveCityDotClick(hangzhouIndex, 'click', 90)?.label).toBe('杭州');
    expect(resolveCityDotClick(hangzhouIndex, 'click', 800)).toBeNull();
    expect(resolveCityDotClick(hangzhouIndex, 'drag', 90)).toBeNull();
    expect(resolveCityDotClick(undefined, 'click', 90)).toBeNull();
    expect(resolveCityDotClick(999, 'click', 90)).toBeNull();
  });
});
