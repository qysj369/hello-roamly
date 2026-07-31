import type { IncomingMessage, ServerResponse } from 'node:http';

import { runTravelPlanGeneration } from '@/services/ai/runTravelPlanGeneration';
import type { TravelOptions } from '@/types/domain/travelOptions';
import { createServerDeepSeekCompleter, type ServerEnv } from '../../lib/deepseekServer';
import { readJsonBody, sendJson } from '../../lib/http';

type GenerateTravelPlanRequest = {
  prompt?: string;
  options?: TravelOptions;
};

function isValidRequest(body: unknown): body is GenerateTravelPlanRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }
  const record = body as Record<string, unknown>;
  return typeof record.prompt === 'string' && record.prompt.trim().length > 0;
}

/** POST /api/ai/generate-travel-plan — 顾问页结构化行程卡片（服务端 DeepSeek） */
export async function handleGenerateTravelPlanApi(
  req: IncomingMessage,
  res: ServerResponse,
  env: ServerEnv,
): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = await readJsonBody<unknown>(req);
    if (!isValidRequest(body)) {
      sendJson(res, 400, { error: '请求参数无效', code: 'invalid_params' });
      return;
    }

    const completer = createServerDeepSeekCompleter(env);
    if (!completer) {
      sendJson(res, 503, { error: 'DeepSeek 未配置', code: 'deepseek_unconfigured' });
      return;
    }

    const plan = await runTravelPlanGeneration(body.prompt, body.options ?? {}, completer);
    sendJson(res, 200, { plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : '生成行程失败';
    sendJson(res, 500, { error: message, code: 'generate_failed' });
  }
}
