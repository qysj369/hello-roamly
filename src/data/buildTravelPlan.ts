import {
  buildDailyPlansFromGuide,
  estimateTotalCostFromGuide,
} from '@/data/buildDailyPlansFromGuide';
import { buildTravelPlanPresentation } from '@/data/travelPlanPresentation';
import { getPracticalInfoForGuide } from '@/data/travelPlanPracticalInfo';
import { getSuitableAudienceForGuide } from '@/data/travelPlanAudience';
import { demoGuides } from '@/data/demoGuides';
import type { Guide } from '@/types/domain/guide';
import type { EnrichedTravelPlan } from '@/types/domain/travelPlan';

const planSummaries: Record<string, string> = {
  hangzhou: '西湖免费步道 + 公交环线，适合周末零压力出行。',
  xiamen: '轮渡上岛 + 街巷摄影，海岛慢游不赶景点。',
  xian: '城墙骑行串联回民街小吃，历史与味蕾一次满足。',
  chengdu: '宽窄巷子步行串联锦里夜景，美食为主轴。',
};

/** 将攻略实体组装为 AI 旅行计划（含按日行程） */
export function buildTravelPlanFromGuide(guide: Guide): EnrichedTravelPlan {
  const summary = planSummaries[guide.id] ?? guide.title;
  const dailyPlans = buildDailyPlansFromGuide(guide);

  return {
    id: `plan-${guide.id}`,
    title: `AI · ${guide.city}${guide.days}穷游方案`,
    summary,
    dailyPlans,
    totalCost: estimateTotalCostFromGuide(guide),
    tags: guide.tags,
    suitableAudience: getSuitableAudienceForGuide(guide.id, guide.tags),
    practicalInfo: getPracticalInfoForGuide(guide.id),
    presentation: {
      ...buildTravelPlanPresentation(guide, guide.city),
      generatedAt: guide.updatedAt,
    },
  };
}

export function getGuidesSortedByRecent(): Guide[] {
  return [...demoGuides].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}
