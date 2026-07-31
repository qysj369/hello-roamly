import { USER_API } from '@/services/user/paths';
import { buildUserApiHeaders } from '@/services/user/authHeaders';
import type {
  GetUserPlanResponse,
  ListUserPlansErrorResponse,
} from '@/types/api/userPlans';

export class FetchUserPlanDetailApiError extends Error {
  readonly status?: number;

  constructor(message: string, options?: { status?: number }) {
    super(message);
    this.name = 'FetchUserPlanDetailApiError';
    this.status = options?.status;
  }
}

/** GET /api/user/plans/:id */
export async function fetchUserPlanById(planId: string): Promise<GetUserPlanResponse> {
  const response = await fetch(`${USER_API.plans}/${encodeURIComponent(planId)}`, {
    method: 'GET',
    headers: buildUserApiHeaders(),
  });

  const payload = (await response.json().catch(() => null)) as
    | GetUserPlanResponse
    | ListUserPlansErrorResponse
    | null;

  if (!response.ok) {
    const message =
      payload && 'error' in payload && payload.error
        ? payload.error
        : `读取失败（HTTP ${response.status}）`;
    throw new FetchUserPlanDetailApiError(message, { status: response.status });
  }

  if (!payload || !('item' in payload) || !payload.item) {
    throw new FetchUserPlanDetailApiError('API 返回格式无效', { status: response.status });
  }

  return payload;
}
