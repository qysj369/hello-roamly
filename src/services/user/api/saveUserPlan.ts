import { USER_API } from '@/services/user/paths';
import { buildUserApiHeaders } from '@/services/user/authHeaders';
import type {
  SaveUserPlanErrorResponse,
  SaveUserPlanRequest,
  SaveUserPlanResponse,
} from '@/types/api/userPlans';

export class SaveUserPlanApiError extends Error {
  readonly status?: number;

  readonly code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = 'SaveUserPlanApiError';
    this.status = options?.status;
    this.code = options?.code;
  }
}

/** POST /api/user/plans */
export async function saveUserPlan(params: SaveUserPlanRequest): Promise<SaveUserPlanResponse> {
  const response = await fetch(USER_API.plans, {
    method: 'POST',
    headers: buildUserApiHeaders(),
    body: JSON.stringify(params),
  });

  const payload = (await response.json().catch(() => null)) as
    | SaveUserPlanResponse
    | SaveUserPlanErrorResponse
    | null;

  if (!response.ok) {
    const message =
      payload && 'error' in payload && payload.error
        ? payload.error
        : `保存失败（HTTP ${response.status}）`;
    throw new SaveUserPlanApiError(message, {
      status: response.status,
      code: payload && 'code' in payload ? payload.code : undefined,
    });
  }

  if (!payload || !('item' in payload) || !payload.item) {
    throw new SaveUserPlanApiError('API 返回格式无效', { status: response.status });
  }

  return payload;
}
