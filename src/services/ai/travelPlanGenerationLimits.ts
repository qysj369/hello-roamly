/** 按天数估算 token 上限；短行程压低上限以加快收尾 */
export function resolveTravelPlanMaxTokens(days: number): number {
  const safeDays = Math.max(1, Math.min(Math.round(days) || 3, 14));
  return Math.min(2200, 280 + safeDays * 220);
}

/** 给用户展示的预计等待秒数（仅提示，非硬超时） */
export function estimateTravelPlanSeconds(days: number): number {
  const safeDays = Math.max(1, Math.min(Math.round(days) || 3, 14));
  return Math.min(42, 7 + safeDays * 5);
}
