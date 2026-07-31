import { buildTravelPlanPresentation } from '@/data/travelPlanPresentation';
import { extractCityFromPlanText } from '@/lib/map/geocodeTravelPlan';
import type { ParsedTravelPlan } from '@/services/ai/parseTravelPlan';
import { resolveGuideForPlan } from '@/services/ai/resolveGuideForPlan';
import type { EnrichedTravelPlan } from '@/types/domain/travelPlan';
import type { TravelOptions } from '@/types/domain/travelOptions';

/** 将模型 JSON 与演示 presentation（封面/作者/城市）合并为可渲染的 EnrichedTravelPlan */
export function assembleTravelPlan(
  parsed: ParsedTravelPlan,
  options: TravelOptions,
  prompt: string,
  planId?: string,
): EnrichedTravelPlan {
  const guide = resolveGuideForPlan(options, prompt);
  // 目的地链：用户选项 > 标题/需求中的城市 > 行程地点 > 关联攻略城市
  const destination =
    options.destination?.trim() ||
    extractCityFromPlanText(prompt) ||
    extractCityFromPlanText(parsed.title) ||
    parsed.dailyPlans[0]?.activities.find((a) => a.location)?.location?.split('·')[0]?.trim() ||
    guide.city;

  const id = planId ?? `plan-${guide.id}-${Date.now()}`;

  return {
    id,
    title: parsed.title,
    summary: parsed.summary,
    dailyPlans: parsed.dailyPlans,
    totalCost: parsed.totalCost,
    tags: parsed.tags.length > 0 ? parsed.tags : guide.tags,
    suitableAudience: parsed.suitableAudience,
    practicalInfo: parsed.practicalInfo,
    presentation: buildTravelPlanPresentation(guide, destination),
  };
}
