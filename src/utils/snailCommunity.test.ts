import { describe, expect, it } from 'vitest';
import { resolveSnailRank } from '@/utils/snailCommunity';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';

describe('resolveSnailRank', () => {
  it('returns 慢行者 for zero plans', () => {
    expect(resolveSnailRank(0).title).toBe('慢行者');
  });

  it('returns 轨迹主 for high plan count', () => {
    expect(resolveSnailRank(10).title).toBe('轨迹主');
  });

  it('returns 壳内达人 for top tier', () => {
    expect(resolveSnailRank(20).title).toBe('壳内达人');
  });
});

describe('SNAIL_GLOBAL_COPY', () => {
  it('uses canonical publish success copy', () => {
    expect(SNAIL_GLOBAL_COPY.publishSuccess).toBe('轨迹已留下！');
  });
});
