import {
  SNAIL_RANKS,
  SNAIL_SLANG_GLOSSARY,
  type SnailRank,
  type SnailSlangEntry,
} from '@/lib/config/snailCommunity';

export function getSnailSlangById(id: string): SnailSlangEntry | undefined {
  return SNAIL_SLANG_GLOSSARY.find((entry) => entry.id === id);
}

export function getSnailSlangByTerm(term: string): SnailSlangEntry | undefined {
  return SNAIL_SLANG_GLOSSARY.find((entry) => entry.term === term);
}

/** 按蜗阶门槛解析当前称号（演示：以发布计划数为 proxy） */
export function resolveSnailRank(publishedPlanCount: number): SnailRank {
  const sorted = [...SNAIL_RANKS].sort((a, b) => b.minPublishedPlans - a.minPublishedPlans);
  return sorted.find((rank) => publishedPlanCount >= rank.minPublishedPlans) ?? SNAIL_RANKS[0]!;
}

export function formatSnailRankLabel(rank: SnailRank): string {
  return `${rank.emoji} ${rank.title}`;
}
