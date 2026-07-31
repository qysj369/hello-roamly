import { describe, expect, it } from 'vitest';
import {
  resolveDefaultOriginName,
  resolveEffectiveSearchQuery,
} from '@/lib/map/resolveEffectivePlanRequest';

describe('resolveEffectiveSearchQuery', () => {
  it('prefers searchQuery with three stops', () => {
    expect(
      resolveEffectiveSearchQuery({
        searchQuery: '曲阜微山湖台儿庄三日1500',
        rawQuery: '想去曲阜，行程3天',
      }),
    ).toBe('曲阜微山湖台儿庄三日1500');
  });

  it('falls back to enriched query when it lists all stops', () => {
    expect(
      resolveEffectiveSearchQuery({
        rawQuery: '从济南市历下区出发，用户要去曲阜、微山湖、台儿庄共3个目的地',
      }),
    ).toContain('曲阜');
  });
});

describe('resolveDefaultOriginName', () => {
  it('defaults Jinan for multi-stop', () => {
    expect(resolveDefaultOriginName(3)).toBe('济南市历下区中林路绿城百合花园');
    expect(resolveDefaultOriginName(1)).toBeNull();
  });
});
