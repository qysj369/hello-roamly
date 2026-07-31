import { buildTravelPlanFromGuide, getGuidesSortedByRecent } from '@/data/buildTravelPlan';
import type { TravelPlan } from '@/types/domain/travelPlan';

/** 取最近更新的攻略，包装为「AI 生成计划」 */
export function getRecentTravelPlans(limit = 3): TravelPlan[] {
  return getGuidesSortedByRecent()
    .slice(0, limit)
    .map((guide) => buildTravelPlanFromGuide(guide));
}
