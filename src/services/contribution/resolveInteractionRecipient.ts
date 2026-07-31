import { DEMO_USERS } from '@/data/demoUsers';
import { findTravelPlanById } from '@/data/findTravelPlan';
import { getTravelPlanCreator } from '@/data/travelPlanCreators';
import { ensureCuratedPublishedGuidesSeeded } from '@/services/guides/seedCuratedGuides';
import { readTravelMomentsFromStorage } from '@/stores/travelMoments/store';
import type { TravelMoment } from '@/types/domain/user/userSocial';
import { isEnrichedTravelPlan } from '@/types/domain/travelPlan';
import type { UserId } from '@/types/domain/user/userId';

/** 解析旅行计划创作者 userId（用于撒盐 / 收进壳里奖励） */
export function resolvePlanCreatorUserId(planId: string): UserId | null {
  const plan = findTravelPlanById(planId);
  if (plan && isEnrichedTravelPlan(plan)) {
    return plan.presentation.creator.id;
  }
  return getTravelPlanCreator(planId).id;
}

/** 解析瞬间作者 userId */
export function resolveMomentAuthorUserId(momentId: string): UserId | null {
  for (const user of DEMO_USERS) {
    const match = user.travelMoments.find((moment) => moment.id === momentId);
    if (match) {
      return match.authorId;
    }
  }

  const stored = readTravelMomentsFromStorage();
  for (const [authorId, moments] of Object.entries(stored.byUser)) {
    const list = moments as TravelMoment[];
    if (list.some((moment) => moment.id === momentId)) {
      return authorId;
    }
  }

  return null;
}

/** 解析已发布攻略作者 userId */
export function resolvePublishedGuideAuthorUserId(guideId: string): UserId | null {
  const record = ensureCuratedPublishedGuidesSeeded().find((guide) => guide.id === guideId);
  return record?.authorId ?? null;
}
