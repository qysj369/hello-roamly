import { AI_API } from '@/services/ai/paths';
import type {
  ContinuePlanChatErrorResponse,
  ContinuePlanChatRequest,
  ContinuePlanChatResponse,
} from '@/types/api/planContinueChat';

export class ContinuePlanChatApiError extends Error {
  readonly status?: number;

  readonly code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = 'ContinuePlanChatApiError';
    this.status = options?.status;
    this.code = options?.code;
  }
}

/** POST /api/ai/continue-chat */
export async function fetchContinuePlanChat(
  params: ContinuePlanChatRequest,
): Promise<ContinuePlanChatResponse> {
  const response = await fetch(AI_API.continueChat, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(params),
  });

  const payload = (await response.json().catch(() => null)) as
    | ContinuePlanChatResponse
    | ContinuePlanChatErrorResponse
    | null;

  if (!response.ok) {
    const message =
      payload && 'error' in payload && payload.error
        ? payload.error
        : `追问失败（HTTP ${response.status}）`;
    throw new ContinuePlanChatApiError(message, {
      status: response.status,
      code: payload && 'code' in payload ? payload.code : undefined,
    });
  }

  if (!payload || !('reply' in payload) || !payload.reply) {
    throw new ContinuePlanChatApiError('API 返回格式无效', { status: response.status });
  }

  return payload;
}
