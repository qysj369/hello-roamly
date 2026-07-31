import { describe, expect, it } from 'vitest';
import { CONTRIBUTION_SCORE_RULES } from '@/lib/config/contributionScore';
import { formatContributionTitleLabel, resolveContributionTitle } from '@/utils/contributionScore';

describe('resolveContributionTitle', () => {
  it('returns 小蜗牛 for 0-100', () => {
    expect(resolveContributionTitle(0).title).toBe('小蜗牛');
    expect(resolveContributionTitle(100).title).toBe('小蜗牛');
  });

  it('returns 旅行蜗牛 for 101-500', () => {
    expect(resolveContributionTitle(101).title).toBe('旅行蜗牛');
    expect(resolveContributionTitle(500).title).toBe('旅行蜗牛');
  });

  it('returns 蜗牛大佬 for 501+', () => {
    expect(resolveContributionTitle(501).title).toBe('蜗牛大佬');
  });
});

describe('CONTRIBUTION_SCORE_RULES', () => {
  it('matches prompt scoring framework', () => {
    expect(CONTRIBUTION_SCORE_RULES.publishGuide).toBe(50);
    expect(CONTRIBUTION_SCORE_RULES.receiveSalt).toBe(5);
    expect(CONTRIBUTION_SCORE_RULES.receiveShellKeep).toBe(10);
  });
});

describe('formatContributionTitleLabel', () => {
  it('includes emoji and title', () => {
    const tier = resolveContributionTitle(80);
    expect(formatContributionTitleLabel(tier)).toBe('🐌 小蜗牛');
  });
});
