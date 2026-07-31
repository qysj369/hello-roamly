import { getPracticalInfoForGuide } from '@/data/travelPlanPracticalInfo';
import { getSuitableAudienceForGuide } from '@/data/travelPlanAudience';
import type { TravelPlanPracticalInfo } from '@/types/domain/travelPlanPracticalInfo';
import { getTravelPlanCreator } from '@/data/travelPlanCreators';
import { getTravelPlanStyleTags } from '@/data/travelPlanStyleTags';
import type { TravelPlan, TravelPlanPresentation } from '@/types/domain/travelPlan';
import { isEnrichedTravelPlan } from '@/types/domain/travelPlan';

function getPresentation(plan: TravelPlan): TravelPlanPresentation | undefined {
  return isEnrichedTravelPlan(plan) ? plan.presentation : undefined;
}

export function getPlanDestination(plan: TravelPlan): string {
  const presentation = getPresentation(plan);
  if (presentation?.destination) {
    return presentation.destination;
  }
  const fromActivity = plan.dailyPlans[0]?.activities.find((a) => a.location)?.location;
  return fromActivity ?? plan.tags[0] ?? '目的地';
}

export function getPlanTotalDays(plan: TravelPlan): number {
  return plan.dailyPlans.length;
}

export function getPlanDaysLabel(plan: TravelPlan): string {
  const count = getPlanTotalDays(plan);
  return count > 0 ? `${count} 天` : '—';
}

export function getPlanTotalCostLabel(plan: TravelPlan): string {
  return `¥${plan.totalCost.toLocaleString('zh-CN')}`;
}

export function getPlanBudgetLabel(plan: TravelPlan): string {
  return `约 ${getPlanTotalCostLabel(plan)}`;
}

export function getPlanGuideId(plan: TravelPlan): string {
  return getPresentation(plan)?.guideId ?? 'hangzhou';
}

export function getPlanPracticalInfo(plan: TravelPlan): TravelPlanPracticalInfo {
  if (plan.practicalInfo) {
    return plan.practicalInfo;
  }
  return getPracticalInfoForGuide(getPlanGuideId(plan));
}

export function getPlanSuitableAudience(plan: TravelPlan): string {
  if (plan.suitableAudience?.trim()) {
    return plan.suitableAudience.trim();
  }
  return getSuitableAudienceForGuide(getPlanGuideId(plan), plan.tags);
}

export function getPlanCoverUrl(plan: TravelPlan): string | undefined {
  return getPresentation(plan)?.coverImageUrl;
}

export function getPlanCoverAlt(plan: TravelPlan): string {
  const presentation = getPresentation(plan);
  return presentation?.coverImageAlt ?? `${getPlanDestination(plan)} 目的地`;
}

export function getPlanStyleTags(plan: TravelPlan) {
  const fromPresentation = getPresentation(plan)?.styleTags;
  if (fromPresentation?.length) {
    return fromPresentation;
  }
  return getTravelPlanStyleTags(getPlanGuideId(plan));
}

export function getPlanCreator(plan: TravelPlan) {
  return getPresentation(plan)?.creator ?? getTravelPlanCreator(getPlanGuideId(plan));
}

export function getPlanGeneratedAt(plan: TravelPlan): string {
  return getPresentation(plan)?.generatedAt ?? new Date().toISOString();
}

export function getPlanLikeCount(plan: TravelPlan): number {
  return getPresentation(plan)?.stats?.likeCount ?? 0;
}

export function getPlanShareSummary(plan: TravelPlan): string {
  const dayHint =
    plan.dailyPlans.length > 0
      ? `共 ${plan.dailyPlans.length} 天 · ${plan.dailyPlans[0]?.title ?? ''}`
      : plan.summary;
  return `${plan.title} · ${getPlanDestination(plan)} · ${getPlanBudgetLabel(plan)} · ${dayHint}`;
}
