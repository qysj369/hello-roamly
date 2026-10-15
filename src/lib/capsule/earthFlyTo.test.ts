import { describe, expect, it } from 'vitest';
import { EARTH_ROAM_CAMERA } from '@/lib/capsule/earthRoamCamera';
import {
  EARTH_FLY_DESTINATIONS,
  easeInOutCubic,
  flyDurationMs,
  interpolateFlyOrbit,
  latLngToOrbitSpherical,
  lookAtOrbitSpherical,
  shortestAngleDelta,
} from '@/lib/capsule/earthFlyTo';

describe('earthFlyTo', () => {
  it('exposes the three test destinations', () => {
    expect(EARTH_FLY_DESTINATIONS.map((item) => item.label)).toEqual(['巴黎', '拉萨', '里约热内卢']);
    expect(EARTH_FLY_DESTINATIONS.map((item) => item.blurb).join('|')).toContain('塞纳河');
    expect(EARTH_FLY_DESTINATIONS.map((item) => item.blurb).join('|')).toContain('青藏高原');
    expect(EARTH_FLY_DESTINATIONS.map((item) => item.blurb).join('|')).toContain('大西洋');
    expect(EARTH_FLY_DESTINATIONS.some((item) => /浪漫之都|圣洁雪山|热烈奔放/.test(item.blurb))).toBe(
      false,
    );
  });

  it('eases in and out so the middle moves faster than the ends', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 5);
    expect(easeInOutCubic(0.25)).toBeLessThan(0.25);
    expect(easeInOutCubic(0.75)).toBeGreaterThan(0.75);
  });

  it('takes the short arc when interpolating azimuth', () => {
    expect(Math.abs(shortestAngleDelta(3, -3))).toBeLessThan(Math.PI);
    const from = { theta: 3, phi: 1, radius: 13 };
    const to = { theta: -3, phi: 1, radius: 13 };
    const mid = interpolateFlyOrbit(from, to, 0.5, false);
    expect(Math.abs(mid.theta)).toBeGreaterThan(2.5);
  });

  it('keeps fly radius inside the no-clip envelope', () => {
    const start = lookAtOrbitSpherical(48.8566, 2.3522, 4, false);
    expect(start.radius).toBe(EARTH_ROAM_CAMERA.desktop.minDistance);
    const lifted = interpolateFlyOrbit(start, start, 0.5, false);
    expect(lifted.radius).toBeGreaterThanOrEqual(EARTH_ROAM_CAMERA.desktop.minDistance);
    expect(lifted.radius).toBeLessThanOrEqual(EARTH_ROAM_CAMERA.desktop.maxDistance);
  });

  it('keeps destination polar angles inside the roam envelope', () => {
    for (const city of EARTH_FLY_DESTINATIONS) {
      const look = lookAtOrbitSpherical(city.lat, city.lng, 13, false);
      expect(look.phi).toBeGreaterThanOrEqual(EARTH_ROAM_CAMERA.minPolarAngle);
      expect(look.phi).toBeLessThanOrEqual(EARTH_ROAM_CAMERA.maxPolarAngle);
      expect(look.radius).toBeGreaterThanOrEqual(EARTH_ROAM_CAMERA.desktop.minDistance);
    }
  });

  it('scales duration with angular distance', () => {
    const paris = latLngToOrbitSpherical(48.8566, 2.3522);
    const rio = latLngToOrbitSpherical(-22.9068, -43.1729);
    const shortHop = flyDurationMs({ ...paris, radius: 13 }, { ...paris, phi: paris.phi + 0.05, radius: 13 });
    const longHop = flyDurationMs({ ...paris, radius: 13 }, { ...rio, radius: 13 });
    expect(longHop).toBeGreaterThan(shortHop);
    expect(shortHop).toBeGreaterThanOrEqual(1700);
    expect(longHop).toBeLessThanOrEqual(3200);
  });
});
