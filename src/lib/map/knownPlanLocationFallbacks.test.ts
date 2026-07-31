import { describe, expect, it } from 'vitest';

import {
  matchKnownPlanLocationFallback,
  resolveKnownPlanLocationFallback,
} from '@/lib/map/knownPlanLocationFallbacks';

describe('knownPlanLocationFallbacks', () => {
  it('matches Chengdu POI with city constraint', () => {
    expect(matchKnownPlanLocationFallback('锦城湖', '成都市')?.label).toBe('锦城湖');
    expect(matchKnownPlanLocationFallback('锦城湖', '南京市')).toBeNull();
  });

  it('extracts POI from verbose AI location strings', () => {
    const hit = resolveKnownPlanLocationFallback('宽窄巷子 · 游玩2小时', '成都市');
    expect(hit?.label).toBe('宽窄巷子');
    expect(hit?.lng).toBeGreaterThan(104);
  });

  it('matches iron pagoda water street', () => {
    expect(resolveKnownPlanLocationFallback('铁像寺水街', '成都市')?.label).toBe('铁像寺水街');
  });

  it('matches distinctive POI even when city is unknown', () => {
    expect(resolveKnownPlanLocationFallback('锦城湖', undefined)?.label).toBe('锦城湖');
  });
});
