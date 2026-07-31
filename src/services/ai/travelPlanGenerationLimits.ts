/** 按天数估算 token 上限，避免短行程也等满 4096 token */
export function resolveTravelPlanMaxTokens(days: number): number {
  const safeDays = Math.max(1, Math.min(Math.round(days) || 3, 14));
  return Math.min(2800, 420 + safeDays * 300);
}

/** 给用户展示的预计等待秒数（仅提示，非硬超时） */
export function estimateTravelPlanSeconds(days: number): number {
  const safeDays = Math.max(1, Math.min(Math.round(days) || 3, 14));
  return Math.min(55, 10 + safeDays * 7);
}
