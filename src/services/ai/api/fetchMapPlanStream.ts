import {
  finalizeMapPlanContent,
  isMapPlanDeliverable,
} from '@/lib/plan/mapPlanCompleteness';
import { sanitizePlanContentForDisplay } from '@/lib/plan/sanitizePlanContent';
import { parseSseStream } from '@/services/ai/api/parseSseStream';
import { fetchMapPlanFromApi, GenerateMapPlanApiError } from '@/services/ai/api/generateMapPlan';
import { AI_API } from '@/services/ai/paths';
import type {
  GenerateMapPlanRequest,
  GenerateMapPlanResponse,
} from '@/types/api/mapGeneratePlan';

export type FetchMapPlanStreamOptions = {
  params: GenerateMapPlanRequest;
  signal?: AbortSignal;
  onDelta?: (text: string) => void;
  /** 服务端裁掉残缺尾巴或续写前，用全文覆盖客户端累积 */
  onSync?: (fullText: string) => void;
  onStatus?: (message: string) => void;
};

/**
 * POST /api/ai/generate-plan-stream
 * 正文以 delta 累积；done 仅含 locationName，避免超大 JSON 导致弹窗打不开。
 */
export async function fetchMapPlanWithStream(
  options: FetchMapPlanStreamOptions,
): Promise<GenerateMapPlanResponse> {
  const response = await fetch(AI_API.generatePlanStream, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(options.params),
    signal: options.signal,
  });

  const contentType = response.headers.get('Content-Type') ?? '';

  if (!response.ok && !contentType.includes('text/event-stream')) {
    let message = `流式规划失败 (${response.status})`;
    try {
      const json = (await response.json()) as { error?: string };
      if (json.error) {
        message = json.error;
      }
    } catch {
      /* ignore */
    }
    throw new GenerateMapPlanApiError(message);
  }

  if (!response.body) {
    throw new GenerateMapPlanApiError('未收到流式响应');
  }

  let finished = false;
  let doneFromServer = false;
  let unconfigured = false;
  let locationName = options.params.locationName?.trim() || '所选地点';
  let accumulated = '';

  await parseSseStream(
    response.body,
    {
      onEvent: (event, data) => {
        if (event === 'ping') {
          return;
        }
        if (event === 'status') {
          const message = (data as { message?: string }).message ?? '';
          if (message) {
            options.onStatus?.(message);
          }
          return;
        }
        if (event === 'delta') {
          const text = (data as { text?: string }).text ?? '';
          if (text) {
            accumulated += text;
            options.onDelta?.(text);
          }
          return;
        }
        if (event === 'sync') {
          const text = (data as { text?: string }).text ?? '';
          if (text) {
            accumulated = text;
            options.onSync?.(text);
          }
          return;
        }
        if (event === 'done') {
          const payload = data as { locationName?: string; content?: string };
          if (payload.locationName?.trim()) {
            locationName = payload.locationName.trim();
          }
          if (payload.content?.trim()) {
            accumulated = finalizeMapPlanContent(
              payload.content.trim(),
              locationName,
              options.params.originName,
              options.params.searchQuery ?? options.params.initialQuery ?? options.params.query,
            );
            options.onSync?.(accumulated);
            doneFromServer = true;
          }
          finished = true;
          return;
        }
        if (event === 'error') {
          const payload = data as { message?: string; code?: string };
          if (payload.code === 'deepseek_unconfigured') {
            unconfigured = true;
            return;
          }
          throw new GenerateMapPlanApiError(payload.message ?? '流式规划失败', {
            code: payload.code,
          });
        }
      },
    },
    options.signal,
  );

  if (unconfigured) {
    return fetchMapPlanFromApi(options.params, { signal: options.signal });
  }

  if (options.signal?.aborted) {
    throw new GenerateMapPlanApiError('已停止生成', { code: 'aborted' });
  }

  let content = sanitizePlanContentForDisplay(accumulated.trim());
  if (!doneFromServer) {
    content = finalizeMapPlanContent(
      content,
      locationName,
      options.params.originName,
      options.params.searchQuery ?? options.params.initialQuery ?? options.params.query,
    );
  }

  if (!content || !isMapPlanDeliverable(content)) {
    throw new GenerateMapPlanApiError('方案内容为空，请重试');
  }

  if (!finished && !doneFromServer) {
    throw new GenerateMapPlanApiError('连接已断开，请重新点击一键规划', {
      code: 'plan_incomplete',
    });
  }

  return {
    locationName,
    content,
  };
}
