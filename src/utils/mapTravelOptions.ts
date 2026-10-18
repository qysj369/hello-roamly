import type { AiTravelParams } from '@/types/domain/aiTravelParams';
import { TRAVEL_INTEREST_OPTIONS, TRAVEL_PACE_OPTIONS } from '@/types/domain/aiTravelParams';
import type { TravelOptions, TravelOptionsBudget } from '@/types/domain/travelOptions';
import { resolveTravelOptionsBudget } from '@/types/domain/travelOptions';

/** 将 AI 旅行参数面板状态映射为 generateTravelPlan 选项 */
export function mapAiTravelParamsToOptions(
  params: AiTravelParams,
  overrides: Partial<TravelOptions> = {},
): TravelOptions {
  return {
    destination: overrides.destination,
    days: params.days,
    budget: { min: params.budgetMin, max: params.budgetMax },
    interests: [...params.interests],
    pace: params.pace,
    guideId: overrides.guideId,
  };
}

/** 无对话历史时，根据参数拼出计划生成 prompt */
export function buildTravelPlanPromptFromParams(
  params: AiTravelParams,
  destination?: string,
): string {
  const dest = destination?.trim() || '未指定目的地';
  const interestLabels = params.interests
    .map((id) => TRAVEL_INTEREST_OPTIONS.find((o) => o.id === id)?.label)
    .filter(Boolean)
    .join('、');
  const paceLabel = TRAVEL_PACE_OPTIONS.find((o) => o.id === params.pace)?.label ?? '适中';

  return `请为${dest}规划${params.days}天漫行行程，预算约¥${params.budgetMin}–${params.budgetMax}，节奏${paceLabel}，偏好${interestLabels || '美食与文化'}。`;
}

/** 根据 TravelOptions 拼出计划生成 prompt */
export function buildTravelPlanPromptFromOptions(options: TravelOptions): string {
  const budget = resolveTravelOptionsBudget(options);
  const dest = options.destination?.trim() || '未指定目的地';
  const days = options.days ?? 3;
  const interestLabels =
    options.interests
      ?.map((id) => TRAVEL_INTEREST_OPTIONS.find((o) => o.id === id)?.label)
      .filter(Boolean)
      .join('、') ?? '美食、文化';
  const paceLabel =
    TRAVEL_PACE_OPTIONS.find((o) => o.id === options.pace)?.label ?? '适中';

  return `请为${dest}规划${days}天漫行行程，预算约¥${budget.min}–${budget.max}，节奏${paceLabel}，偏好${interestLabels}。`;
}

function parseBudgetFromInput(value: string): TravelOptionsBudget {
  const parsed = Number.parseInt(value, 10);
  const max = Number.isNaN(parsed) ? 2000 : Math.max(500, parsed);
  // 首页只填「总预算」：自动生成区间供 AI prompt，下限约 65% 留给交通/住宿弹性
  const min = Math.max(300, Math.floor(max * 0.65));
  return { min, max };
}

/** 首页 AI 规划器：根据表单字段生成 prompt 与选项 */
export function buildHomePlannerTravelRequest(
  destination: string,
  days: number,
  budget: string,
): { prompt: string; options: TravelOptions } {
  const dest = destination.trim() || '未指定目的地';
  const budgetRange = parseBudgetFromInput(budget);

  return {
    prompt: `帮我规划${dest}${days}天、预算约${budgetRange.max}元的漫行行程`,
    options: {
      destination: destination.trim() || undefined,
      days,
      budget: budgetRange,
      // 首页未选兴趣/节奏时的默认 persona，与 AI 面板常见组合一致
      interests: ['food', 'culture'],
      pace: 'balanced',
    },
  };
}
