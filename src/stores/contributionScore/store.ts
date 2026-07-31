import { create } from 'zustand';
import {
  readContributionScoresFromStorage,
  writeContributionScoresToStorage,
} from '@/stores/contributionScore/storage';

type ContributionScoreState = {
  scores: Record<string, number>;
  hydrated: boolean;
  hydrate: () => void;
  getScore: (userId: string, baseScore?: number) => number;
  addPoints: (userId: string, points: number, baseScore?: number) => number;
};

export const useContributionScoreStore = create<ContributionScoreState>((set, get) => ({
  scores: {},
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) {
      return;
    }
    set({ scores: readContributionScoresFromStorage(), hydrated: true });
  },
  getScore: (userId, baseScore = 0) => {
    const { scores } = get();
    return scores[userId] ?? baseScore;
  },
  addPoints: (userId, points, baseScore = 0) => {
    const current = get().getScore(userId, baseScore);
    const next = Math.max(0, current + points);
    const scores = { ...get().scores, [userId]: next };
    writeContributionScoresToStorage(scores);
    set({ scores, hydrated: true });
    return next;
  },
}));

/** 非 React 环境奖励贡献分（发布、互动回调） */
export function awardContributionPoints(userId: string, points: number, baseScore = 0): number {
  return useContributionScoreStore.getState().addPoints(userId, points, baseScore);
}
