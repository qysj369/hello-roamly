/** 演示用初始点赞数（不含当前用户） */
export const TRAVEL_PLAN_LIKE_COUNT_BY_GUIDE_ID: Record<string, number> = {
  hangzhou: 42,
  xiamen: 67,
  xian: 91,
  chengdu: 35,
};

export function getTravelPlanLikeCount(guideId: string): number {
  return TRAVEL_PLAN_LIKE_COUNT_BY_GUIDE_ID[guideId] ?? 24;
}
