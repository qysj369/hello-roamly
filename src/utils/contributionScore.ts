import {
  CONTRIBUTION_TITLE_TIERS,
  type ContributionTitleTier,
} from '@/lib/config/contributionScore';

export function resolveContributionTitle(score: number): ContributionTitleTier {
  const normalized = Math.max(0, Math.floor(score));
  const sorted = [...CONTRIBUTION_TITLE_TIERS].sort((a, b) => b.min - a.min);
  return sorted.find((tier) => normalized >= tier.min) ?? CONTRIBUTION_TITLE_TIERS[0]!;
}

export function formatContributionTitleLabel(
  tier: ContributionTitleTier,
  options?: { withScore?: boolean; score?: number },
): string {
  if (options?.withScore && options.score !== undefined) {
    return `${tier.emoji} ${tier.title} · ${options.score}分`;
  }
  return `${tier.emoji} ${tier.title}`;
}
