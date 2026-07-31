import { buildPracticalInfoFromOptions } from '@/data/travelPlanPracticalInfo';
import { buildSuitableAudienceFromOptions } from '@/data/travelPlanAudience';
import { assembleTravelPlan } from '@/services/ai/assembleTravelPlan';
import { buildMockDailyPlans } from '@/services/ai/mockDailyPlans';
import { resolveGuideForPlan } from '@/services/ai/resolveGuideForPlan';
import type { EnrichedTravelPlan } from '@/types/domain/travelPlan';
import type { TravelOptions } from '@/types/domain/travelOptions';
import { DEFAULT_TRAVEL_OPTIONS } from '@/types/domain/travelOptions';

/** 无 DeepSeek Key 时的本地计划生成（演示） */
export function generateMockTravelPlan(prompt: string, options: TravelOptions): EnrichedTravelPlan {
  const guide = resolveGuideForPlan(options, prompt);
  const destination = options.destination?.trim() || guide.city;
  const days = options.days ?? DEFAULT_TRAVEL_OPTIONS.days;
  const { dailyPlans, totalCost } = buildMockDailyPlans(destination, options);

  const summary = `基于「${prompt.slice(0, 48)}${prompt.length > 48 ? '…' : ''}」生成的${destination}${days}天穷游方案，总预算约 ¥${totalCost}。`;

  return assembleTravelPlan(
    {
      title: `AI · ${destination}${days}天穷游方案`,
      summary,
      dailyPlans,
      totalCost,
      tags: guide.tags,
      suitableAudience: buildSuitableAudienceFromOptions(options),
      practicalInfo: buildPracticalInfoFromOptions(guide.id, options),
    },
    options,
    prompt,
  );
}
