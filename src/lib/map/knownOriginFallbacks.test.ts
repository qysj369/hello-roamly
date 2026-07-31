import { describe, expect, it } from 'vitest';
import {
  isCoarseLixiaDistrictCenter,
  matchKnownOriginFallback,
  resolveKnownOriginFallback,
} from '@/lib/map/knownOriginFallbacks';

describe('matchKnownOriginFallback', () => {
  it('matches lily garden address', () => {
    expect(matchKnownOriginFallback('济南历下区中林路绿城百合花园')?.label).toContain('百合花园');
  });

  it('matches lixia district shorthand to product default', () => {
    expect(matchKnownOriginFallback('历下区')?.label).toBe('济南市历下区中林路绿城百合花园');
    expect(matchKnownOriginFallback('济南市历下区')?.label).toBe('济南市历下区中林路绿城百合花园');
  });
});

describe('resolveKnownOriginFallback', () => {
  it('strips Shandong prefix before matching', () => {
    expect(resolveKnownOriginFallback('山东省济南市历下区')?.label).toBe(
      '济南市历下区中林路绿城百合花园',
    );
  });

  it('returns precise coords for lixia district', () => {
    const resolved = resolveKnownOriginFallback('济南市历下区');
    expect(resolved?.lng).toBeCloseTo(117.11566, 4);
    expect(resolved?.lat).toBeCloseTo(36.69552, 4);
  });
});

describe('isCoarseLixiaDistrictCenter', () => {
  it('detects amap district center near Lixia Building', () => {
    expect(isCoarseLixiaDistrictCenter(117.076, 36.666)).toBe(true);
    expect(isCoarseLixiaDistrictCenter(117.11566, 36.69552)).toBe(false);
  });
});
