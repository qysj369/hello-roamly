import { AI_API } from '@/services/ai/paths';
import type { PlanToolsRequest, PlanToolsResponse } from '@/types/api/planTools';

export class PlanToolsApiError extends Error {
  readonly status?: number;

  readonly code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = 'PlanToolsApiError';
    this.status = options?.status;
    this.code = options?.code;
  }
}

/** POST /api/ai/plan-tools — 预算/POI/天气工具分析 */
export async function fetchPlanTools(
  params: PlanToolsRequest,
  options: { signal?: AbortSignal } = {},
): Promise<PlanToolsResponse> {
  const response = await fetch(AI_API.planTools, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(params),
    signal: options.signal,
  });

  const payload = (await response.json().catch(() => null)) as
    | PlanToolsResponse
    | { error?: string; code?: string }
    | null;

  if (!response.ok) {
    const message =
      payload && 'error' in payload && payload.error
        ? payload.error
        : `工具分析失败（HTTP ${response.status}）`;
    throw new PlanToolsApiError(message, {
      status: response.status,
      code: payload && 'code' in payload ? payload.code : undefined,
    });
  }

  if (!payload || !('report' in payload) || !payload.report) {
    throw new PlanToolsApiError('API 返回格式无效', { status: response.status });
  }

  return payload;
}
