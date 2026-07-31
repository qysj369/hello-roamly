import { USER_API } from '@/services/user/paths';
import { buildUserApiHeaders } from '@/services/user/authHeaders';
import type {
  ListUserPlansErrorResponse,
  ListUserPlansParams,
  ListUserPlansResponse,
} from '@/types/api/userPlans';

export class FetchUserPlansApiError extends Error {
  readonly status?: number;

  constructor(message: string, options?: { status?: number }) {
    super(message);
    this.name = 'FetchUserPlansApiError';
    this.status = options?.status;
  }
}

function buildListUrl(params: ListUserPlansParams = {}): string {
  const search = new URLSearchParams();
  if (params.public) {
    search.set('public', '1');
  }
  if (params.userId) {
    search.set('userId', params.userId);
  }
  const query = search.toString();
  return query ? `${USER_API.plans}?${query}` : USER_API.plans;
}

/** GET /api/user/plans */
export async function fetchUserPlans(
  params: ListUserPlansParams = {},
): Promise<ListUserPlansResponse> {
  const response = await fetch(buildListUrl(params), {
    method: 'GET',
    headers: buildUserApiHeaders(),
  });

  const payload = (await response.json().catch(() => null)) as
    | ListUserPlansResponse
    | ListUserPlansErrorResponse
    | null;

  if (!response.ok) {
    const message =
      payload && 'error' in payload && payload.error
        ? payload.error
        : `读取失败（HTTP ${response.status}）`;
    throw new FetchUserPlansApiError(message, { status: response.status });
  }

  if (!payload || !('items' in payload) || !Array.isArray(payload.items)) {
    throw new FetchUserPlansApiError('API 返回格式无效', { status: response.status });
  }

  return payload;
}
