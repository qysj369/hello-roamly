import type { EnrichedTravelPlan, TravelPlan } from '@/types/interfaces/travelPlan';

/** GET /plans/:id */
export interface GetTravelPlanResponse {
  plan: EnrichedTravelPlan;
}

/** GET /plans（分页列表） */
export interface ListTravelPlansResponse {
  items: EnrichedTravelPlan[];
  total: number;
  page: number;
  limit: number;
}

/** POST /plans（AI 生成或创建） */
export interface CreateTravelPlanResponse {
  plan: EnrichedTravelPlan;
}

/** PATCH /plans/:id */
export interface UpdateTravelPlanRequest {
  plan: Partial<
    Pick<TravelPlan, 'title' | 'summary' | 'tags' | 'suitableAudience' | 'practicalInfo'>
  > & {
    dailyPlans?: TravelPlan['dailyPlans'];
    totalCost?: number;
  };
}

export interface UpdateTravelPlanResponse {
  plan: EnrichedTravelPlan;
}
