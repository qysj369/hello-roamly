import { describe, expect, it } from 'vitest';
import {
  clampOrbitDistance,
  earthRoamToggleLabel,
  isEarthRoaming,
  nextModeOnOrbitStart,
  orbitDistanceLimits,
  toggleEarthViewMode,
} from '@/lib/capsule/earthRoamCamera';

describe('earthRoamCamera', () => {
  it('defaults to manual until toggled', () => {
    expect(isEarthRoaming('manual')).toBe(false);
    expect(toggleEarthViewMode('manual')).toBe('roam');
    expect(toggleEarthViewMode('roam')).toBe('manual');
    expect(earthRoamToggleLabel('manual')).toBe('开启漫游');
    expect(earthRoamToggleLabel('roam')).toBe('停止漫游');
  });

  it('stops roam as soon as the user starts orbiting', () => {
    expect(nextModeOnOrbitStart('roam')).toBe('manual');
    expect(nextModeOnOrbitStart('manual')).toBe('manual');
  });

  it('clamps camera distance so the lens cannot clip or fly away', () => {
    const desktop = orbitDistanceLimits(false);
    const mobile = orbitDistanceLimits(true);
    expect(clampOrbitDistance(0, desktop.minDistance, desktop.maxDistance)).toBe(7.5);
    expect(clampOrbitDistance(80, desktop.minDistance, desktop.maxDistance)).toBe(26);
    expect(clampOrbitDistance(12, desktop.minDistance, desktop.maxDistance)).toBe(12);
    expect(clampOrbitDistance(Number.NaN, mobile.minDistance, mobile.maxDistance)).toBe(7);
  });
});
