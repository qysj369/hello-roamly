import { USER_API } from '@/services/user/paths';
import { buildUserApiHeaders } from '@/services/user/authHeaders';
import type {
  CreateUserAiSessionRequest,
  ListUserAiSessionsParams,
  ListUserAiSessionsResponse,
  UserAiSessionErrorResponse,
  UserAiSessionMutationResponse,
} from '@/types/api/userAiSessions';

export class UserAiSessionApiError extends Error {
  readonly status?: number;

  readonly code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = 'UserAiSessionApiError';
    this.status = options?.status;
    this.code = options?.code;
  }
}

function buildListUrl(params: ListUserAiSessionsParams = {}): string {
  const search = new URLSearchParams();
  if (params.saved) {
    search.set('saved', '1');
  }
  if (params.public) {
    search.set('public', '1');
  }
  if (params.userId) {
    search.set('userId', params.userId);
  }
  const query = search.toString();
  return query ? `${USER_API.aiSessions}?${query}` : USER_API.aiSessions;
}

export async function fetchUserAiSessionById(
  sessionId: string,
): Promise<import('@/types/api/userAiSessions').GetUserAiSessionResponse['item']> {
  const response = await fetch(
    `${USER_API.aiSessions}/${encodeURIComponent(sessionId)}`,
    {
      method: 'GET',
      headers: buildUserApiHeaders(),
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | import('@/types/api/userAiSessions').GetUserAiSessionResponse
    | UserAiSessionErrorResponse
    | null;

  if (!response.ok) {
    const message =
      payload && 'error' in payload && payload.error
        ? payload.error
        : `读取失败（HTTP ${response.status}）`;
    throw new UserAiSessionApiError(message, {
      status: response.status,
      code: payload && 'code' in payload ? payload.code : undefined,
    });
  }

  if (!payload || !('item' in payload) || !payload.item) {
    throw new UserAiSessionApiError('API 返回格式无效', { status: response.status });
  }

  return payload.item;
}

export async function fetchUserAiSessions(
  params: ListUserAiSessionsParams = {},
): Promise<ListUserAiSessionsResponse> {
  const response = await fetch(buildListUrl(params), {
    method: 'GET',
    headers: buildUserApiHeaders(),
  });

  const payload = (await response.json().catch(() => null)) as
    | ListUserAiSessionsResponse
    | UserAiSessionErrorResponse
    | null;

  if (!response.ok) {
    const message =
      payload && 'error' in payload && payload.error
        ? payload.error
        : `读取失败（HTTP ${response.status}）`;
    throw new UserAiSessionApiError(message, {
      status: response.status,
      code: payload && 'code' in payload ? payload.code : undefined,
    });
  }

  if (!payload || !('items' in payload) || !Array.isArray(payload.items)) {
    throw new UserAiSessionApiError('API 返回格式无效', { status: response.status });
  }

  return payload;
}

export async function createUserAiSession(
  body: CreateUserAiSessionRequest,
): Promise<UserAiSessionMutationResponse> {
  const response = await fetch(USER_API.aiSessions, {
    method: 'POST',
    headers: buildUserApiHeaders(),
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as
    | UserAiSessionMutationResponse
    | UserAiSessionErrorResponse
    | null;

  if (!response.ok) {
    const message =
      payload && 'error' in payload && payload.error
        ? payload.error
        : `创建失败（HTTP ${response.status}）`;
    throw new UserAiSessionApiError(message, {
      status: response.status,
      code: payload && 'code' in payload ? payload.code : undefined,
    });
  }

  if (!payload || !('item' in payload) || !payload.item) {
    throw new UserAiSessionApiError('API 返回格式无效', { status: response.status });
  }

  return payload;
}

export async function updateUserAiSession(
  sessionId: string,
  body: import('@/types/api/userAiSessions').UpdateUserAiSessionRequest,
): Promise<UserAiSessionMutationResponse> {
  const response = await fetch(`${USER_API.aiSessions}/${encodeURIComponent(sessionId)}`, {
    method: 'PATCH',
    headers: buildUserApiHeaders(),
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as
    | UserAiSessionMutationResponse
    | UserAiSessionErrorResponse
    | null;

  if (!response.ok) {
    const message =
      payload && 'error' in payload && payload.error
        ? payload.error
        : `更新失败（HTTP ${response.status}）`;
    throw new UserAiSessionApiError(message, {
      status: response.status,
      code: payload && 'code' in payload ? payload.code : undefined,
    });
  }

  if (!payload || !('item' in payload) || !payload.item) {
    throw new UserAiSessionApiError('API 返回格式无效', { status: response.status });
  }

  return payload;
}
