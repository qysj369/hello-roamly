/** 演示用预算区间（AI 计划卡片展示） */
export const TRAVEL_PLAN_BUDGET_RANGE_BY_GUIDE_ID: Record<string, string> = {
  hangzhou: '¥30–50',
  xiamen: '¥40–80',
  xian: '¥90–150',
  chengdu: '¥60–100',
};

export function getTravelPlanBudgetRange(guideId: string, budgetFallback: string): string {
  return TRAVEL_PLAN_BUDGET_RANGE_BY_GUIDE_ID[guideId] ?? budgetFallback;
}
