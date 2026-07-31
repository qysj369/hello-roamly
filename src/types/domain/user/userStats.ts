import type { UserId } from '@/types/domain/user/userId';
import type { UserPlanInteractions, UserStats } from '@/types/interfaces/user';

export type { UserPlanInteractions, UserStats } from '@/types/interfaces/user';

export const EMPTY_USER_STATS: UserStats = {
  publishedPlanCount: 0,
  receivedLikeCount: 0,
  favoriteCount: 0,
  companionPostCount: 0,
};

export const EMPTY_USER_PLAN_INTERACTIONS = (userId: UserId): UserPlanInteractions => ({
  userId,
  likedPlanIds: [],
  favoritedPlanIds: [],
  recentlyViewedPlanIds: [],
  updatedAt: new Date().toISOString(),
});
