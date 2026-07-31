import type { EnrichedTravelPlan } from '@/types/domain/travelPlan';
import type { TravelOptions } from '@/types/domain/travelOptions';
import { AI_API } from '@/services/ai/paths';

export class GenerateTravelPlanApiError extends Error {
  readonly status?: number;

  readonly code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = 'GenerateTravelPlanApiError';
    this.status = options?.status;
    this.code = options?.code;
  }
}

type GenerateTravelPlanRequest = {
  prompt: string;
  options?: TravelOptions;
};

type GenerateTravelPlanResponse = {
  plan: EnrichedTravelPlan;
};

type GenerateTravelPlanErrorResponse = {
  error?: string;
  code?: string;
};

/** 调用后端 /api/ai/generate-travel-plan（服务端 DeepSeek，通常比浏览器直连更快） */
export async function fetchTravelPlanFromApi(
  prompt: string,
  options: TravelOptions = {},
): Promise<EnrichedTravelPlan> {
  const body: GenerateTravelPlanRequest = { prompt, options };
  const response = await fetch(AI_API.generateTravelPlan, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as
    | GenerateTravelPlanResponse
    | GenerateTravelPlanErrorResponse
    | null;

  if (!response.ok) {
    const message =
      payload && 'error' in payload && payload.error
        ? payload.error
        : `生成行程失败（HTTP ${response.status}）`;
    throw new GenerateTravelPlanApiError(message, {
      status: response.status,
      code: payload && 'code' in payload ? payload.code : undefined,
    });
  }

  if (!payload || !('plan' in payload) || !payload.plan) {
    throw new GenerateTravelPlanApiError('API 返回格式无效', { status: response.status });
  }

  return payload.plan;
}
