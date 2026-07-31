import { useEffect } from 'react';
import { useContributionScoreStore } from '@/stores/contributionScore/store';
import type { UserId } from '@/types/domain/user/userId';

/** 读取蜗友有效贡献分（演示用户基准分 + localStorage 增量） */
export function useContributionScore(userId: UserId | undefined, baseScore = 0): number {
  const hydrate = useContributionScoreStore((state) => state.hydrate);
  const stored = useContributionScoreStore((state) => (userId ? state.scores[userId] : undefined));

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!userId) {
    return baseScore;
  }

  return stored ?? baseScore;
}
