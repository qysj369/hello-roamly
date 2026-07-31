import {
  DEMO_USER_CONNECTIONS,
  DEMO_USER_FAVORITE_PLAN_IDS,
} from '@/data/demoUserProfileContent';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import { findUserById } from '@/data/findUserById';
import { findTravelPlanById } from '@/data/findTravelPlan';
import { getRecentTravelPlans } from '@/data/recentTravelPlans';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { isEnrichedTravelPlan } from '@/types/domain/travelPlan';
import type { User } from '@/types/domain/user/user';
import type { UserId } from '@/types/domain/user/userId';
import type { TravelMoment } from '@/types/domain/user/userSocial';
import { canViewTravelMoment } from '@/utils/travelMomentVisibility';
import { getPlanCreator } from '@/utils/travelPlanView';

export type ProfileCompanionSummary = {
  userId: UserId;
  username: string;
  avatar?: string;
  bio?: string;
};

function dedupePlans(plans: TravelPlan[]): TravelPlan[] {
  const seen = new Set<string>();
  return plans.filter((plan) => {
    if (seen.has(plan.id)) {
      return false;
    }
    seen.add(plan.id);
    return true;
  });
}

/** 用户发布的 AI 旅行计划 */
export function getUserProfilePlans(
  userId: UserId,
  generatedPlans: TravelPlan[] = [],
): TravelPlan[] {
  const demoPlans = getRecentTravelPlans(20).filter((plan) => getPlanCreator(plan).id === userId);

  // 当前演示账号：合并本次会话 AI 生成的计划与静态 demo，按时间倒序
  if (userId === DEMO_CURRENT_USER_ID) {
    return dedupePlans([...generatedPlans, ...demoPlans]).sort(
      (a, b) =>
        new Date(getPlanSortTime(b)).getTime() - new Date(getPlanSortTime(a)).getTime(),
    );
  }

  return demoPlans;
}

function getPlanSortTime(plan: TravelPlan): string {
  if (isEnrichedTravelPlan(plan)) {
    return plan.presentation.generatedAt;
  }
  return new Date().toISOString();
}

/** 用户收藏的计划 */
export function getUserProfileFavoritePlans(
  userId: UserId,
  favoritedPlanIds: string[],
  generatedPlans: TravelPlan[] = [],
  isOwnProfile: boolean,
): TravelPlan[] {
  const demoIds = DEMO_USER_FAVORITE_PLAN_IDS[userId] ?? [];
  // 本人优先读 localStorage 收藏；访客或无本地数据时回退演示 ID，保证个人页有内容可展示
  // TODO: 访客收藏列表也应来自 API，移除 DEMO_USER_FAVORITE_PLAN_IDS 回退
  const ids =
    isOwnProfile && favoritedPlanIds.length > 0 ? favoritedPlanIds : demoIds.length > 0 ? demoIds : favoritedPlanIds;

  return ids
    .map((id) => findTravelPlanById(id, generatedPlans))
    .filter((plan): plan is TravelPlan => plan != null);
}

/** 旅行动态（按时间倒序，尊重可见性） */
export function getUserProfileMoments(
  user: User,
  options: { isOwnProfile: boolean; viewerId: UserId },
): TravelMoment[] {
  return [...user.travelMoments]
    .filter((moment) =>
      canViewTravelMoment({
        moment,
        authorId: user.id,
        viewerId: options.viewerId,
        isOwnProfile: options.isOwnProfile,
      }),
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function resolveProfileCompanions(userIds: UserId[]): ProfileCompanionSummary[] {
  return userIds
    .map((id) => findUserById(id))
    .filter((user): user is User => user != null)
    .map((user) => ({
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
    }));
}

export function getUserProfileFollowing(userId: UserId): ProfileCompanionSummary[] {
  const following = DEMO_USER_CONNECTIONS[userId]?.following ?? [];
  return resolveProfileCompanions(following);
}

export function getUserProfileFollowers(userId: UserId): ProfileCompanionSummary[] {
  const followers = DEMO_USER_CONNECTIONS[userId]?.followers ?? [];
  return resolveProfileCompanions(followers);
}
