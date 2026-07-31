import { USER_API } from '@/services/user/paths';
import { buildUserApiHeaders } from '@/services/user/authHeaders';
import type {
  PatchUserPlanRequest,
  PatchUserPlanResponse,
  SaveUserPlanErrorResponse,
} from '@/types/api/userPlans';

export class PatchUserPlanApiError extends Error {
  readonly status?: number;

  readonly code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = 'PatchUserPlanApiError';
    this.status = options?.status;
    this.code = options?.code;
  }
}

/** PATCH /api/user/plans/:id */
export async function patchUserPlan(
  planId: string,
  body: PatchUserPlanRequest,
): Promise<PatchUserPlanResponse> {
  const response = await fetch(`${USER_API.plans}/${encodeURIComponent(planId)}`, {
    method: 'PATCH',
    headers: buildUserApiHeaders(),
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as
    | PatchUserPlanResponse
    | SaveUserPlanErrorResponse
    | null;

  if (!response.ok) {
    const message =
      payload && 'error' in payload && payload.error
        ? payload.error
        : `更新失败（HTTP ${response.status}）`;
    throw new PatchUserPlanApiError(message, {
      status: response.status,
      code: payload && 'code' in payload ? payload.code : undefined,
    });
  }

  if (!payload || !('item' in payload) || !payload.item) {
    throw new PatchUserPlanApiError('API 返回格式无效', { status: response.status });
  }

  return payload;
}
