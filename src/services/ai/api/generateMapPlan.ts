import { AI_API } from '@/services/ai/paths';
import type {
  GenerateMapPlanErrorResponse,
  GenerateMapPlanRequest,
  GenerateMapPlanResponse,
} from '@/types/api/mapGeneratePlan';

export class GenerateMapPlanApiError extends Error {
  readonly status?: number;

  readonly code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = 'GenerateMapPlanApiError';
    this.status = options?.status;
    this.code = options?.code;
  }
}

const PLAN_FETCH_TIMEOUT_MS = 75_000;

function mergeAbortSignals(userSignal?: AbortSignal): AbortSignal {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort(new DOMException('规划请求超时', 'TimeoutError'));
  }, PLAN_FETCH_TIMEOUT_MS);

  const abortFrom = (source?: AbortSignal) => {
    window.clearTimeout(timeoutId);
    if (!controller.signal.aborted) {
      controller.abort(source?.reason);
    }
  };

  if (userSignal?.aborted) {
    abortFrom(userSignal);
    return controller.signal;
  }

  userSignal?.addEventListener('abort', () => abortFrom(userSignal), { once: true });

  controller.signal.addEventListener(
    'abort',
    () => {
      window.clearTimeout(timeoutId);
    },
    { once: true },
  );

  return controller.signal;
}

/** POST /api/ai/generate-plan */
export async function fetchMapPlanFromApi(
  params: GenerateMapPlanRequest,
  options?: { signal?: AbortSignal },
): Promise<GenerateMapPlanResponse> {
  const response = await fetch(AI_API.generatePlan, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(params),
    signal: mergeAbortSignals(options?.signal),
  });

  const payload = (await response.json().catch(() => null)) as
    | GenerateMapPlanResponse
    | GenerateMapPlanErrorResponse
    | null;

  if (!response.ok) {
    const message =
      payload && 'error' in payload && payload.error
        ? payload.error
        : `生成方案失败（HTTP ${response.status}）`;
    throw new GenerateMapPlanApiError(message, {
      status: response.status,
      code: payload && 'code' in payload ? payload.code : undefined,
    });
  }

  if (!payload || !('content' in payload) || !payload.content) {
    throw new GenerateMapPlanApiError('API 返回格式无效', { status: response.status });
  }

  return payload;
}
