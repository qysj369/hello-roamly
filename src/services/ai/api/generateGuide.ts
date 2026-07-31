import type {
  GenerateAiSnailGuideErrorResponse,
  GenerateAiSnailGuideRequest,
  GenerateAiSnailGuideResponse,
} from '@/types/api/aiSnailGuide';
import type { AiSnailGuideResult } from '@/types/domain/aiSnailGuide';
import { AI_API } from '@/services/ai/paths';

export class GenerateGuideApiError extends Error {
  readonly status?: number;

  readonly code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = 'GenerateGuideApiError';
    this.status = options?.status;
    this.code = options?.code;
  }
}

/** 调用后端 /api/ai/generate-guide */
export async function fetchAiSnailGuideFromApi(
  params: GenerateAiSnailGuideRequest,
): Promise<AiSnailGuideResult> {
  const response = await fetch(AI_API.generateGuide, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(params),
  });

  const payload = (await response.json().catch(() => null)) as
    | GenerateAiSnailGuideResponse
    | GenerateAiSnailGuideErrorResponse
    | null;

  if (!response.ok) {
    const message =
      payload && 'error' in payload && payload.error
        ? payload.error
        : `生成攻略失败（HTTP ${response.status}）`;
    throw new GenerateGuideApiError(message, {
      status: response.status,
      code: payload && 'code' in payload ? payload.code : undefined,
    });
  }

  if (!payload || !('guide' in payload) || !payload.guide) {
    throw new GenerateGuideApiError('API 返回格式无效', { status: response.status });
  }

  return payload.guide;
}
