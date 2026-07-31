import { describe, expect, it } from 'vitest';
import { resolveAmapTrailFeatureLevel } from '@/lib/map/amapTrailMapSetup';

describe('resolveAmapTrailFeatureLevel', () => {
  it('keeps labels at country zoom (standard level)', () => {
    expect(resolveAmapTrailFeatureLevel(4.2)).toBe('standard');
  });

  it('adds buildings only when zoomed in', () => {
    expect(resolveAmapTrailFeatureLevel(9)).toBe('standard');
    expect(resolveAmapTrailFeatureLevel(12)).toBe('detail');
  });
});
