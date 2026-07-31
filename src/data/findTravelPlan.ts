import { getRecentTravelPlans } from '@/data/recentTravelPlans';
import type { TravelPlan } from '@/types/domain/travelPlan';

/** 从用户生成记录与演示数据中查找计划 */
export function findTravelPlanById(
  planId: string,
  generatedPlans: TravelPlan[] = [],
): TravelPlan | undefined {
  const fromGenerated = generatedPlans.find((plan) => plan.id === planId);
  if (fromGenerated) {
    return fromGenerated;
  }
  return getRecentTravelPlans(20).find((plan) => plan.id === planId);
}
