import { AI_API } from '@/services/ai/paths';
import type {
  SearchPlanIncrementRequest,
  SearchPlanRequest,
} from '@/types/domain/searchStructuredPlan';

export class SearchStructuredPlanApiError extends Error {
  readonly status?: number;
  readonly code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = 'SearchStructuredPlanApiError';
    this.status = options?.status;
    this.code = options?.code;
  }
}

type SearchPlanApiResponse = {
  content?: string;
  error?: string;
  code?: string;
};

async function postPlanJson(body: unknown, signal?: AbortSignal): Promise<string> {
  const response = await fetch(AI_API.generatePlanJson, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  const payload = (await response.json().catch(() => null)) as SearchPlanApiResponse | null;

  if (!response.ok) {
    throw new SearchStructuredPlanApiError(payload?.error || `生成失败（HTTP ${response.status}）`, {
      status: response.status,
      code: payload?.code,
    });
  }

  const content = payload?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new SearchStructuredPlanApiError('API 返回为空', { status: response.status });
  }
  return content;
}

/** POST /api/ai/generate-plan-json — 只拿模型原文，校验在前端 */
export async function fetchSearchStructuredPlanRaw(
  params: SearchPlanRequest,
  signal?: AbortSignal,
): Promise<string> {
  return postPlanJson(params, signal);
}

export async function fetchSearchPlanIncrementRaw(
  body: SearchPlanIncrementRequest,
  signal?: AbortSignal,
): Promise<string> {
  return postPlanJson(body, signal);
}
