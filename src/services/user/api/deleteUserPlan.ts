import { USER_API } from '@/services/user/paths';
import { buildUserApiHeaders } from '@/services/user/authHeaders';
import type { DeleteUserPlanResponse, SaveUserPlanErrorResponse } from '@/types/api/userPlans';

export class DeleteUserPlanApiError extends Error {
  readonly status?: number;

  readonly code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = 'DeleteUserPlanApiError';
    this.status = options?.status;
    this.code = options?.code;
  }
}

/** DELETE /api/user/plans/:id */
export async function deleteUserPlan(planId: string): Promise<DeleteUserPlanResponse> {
  const response = await fetch(`${USER_API.plans}/${encodeURIComponent(planId)}`, {
    method: 'DELETE',
    headers: buildUserApiHeaders(),
  });

  const payload = (await response.json().catch(() => null)) as
    | DeleteUserPlanResponse
    | SaveUserPlanErrorResponse
    | null;

  if (!response.ok) {
    const message =
      payload && 'error' in payload && payload.error
        ? payload.error
        : `删除失败（HTTP ${response.status}）`;
    throw new DeleteUserPlanApiError(message, {
      status: response.status,
      code: payload && 'code' in payload ? payload.code : undefined,
    });
  }

  if (!payload || !('ok' in payload)) {
    throw new DeleteUserPlanApiError('API 返回格式无效', { status: response.status });
  }

  return payload;
}
