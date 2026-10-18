import type { IncomingMessage, ServerResponse } from 'node:http';
import { generateMapPlan, isValidMapPlanRequest } from '../../controllers/aiPlanController';
import type { ServerEnv } from '../../lib/deepseekServer';
import { readJsonBody, sendJson } from '../../lib/http';
import { DeepSeekUnconfiguredError } from '@/services/ai/runMapPlanGeneration';

/** POST /api/ai/deepseek — 地图点击 AI 规划（逆地理 + DeepSeek，文本原样返回） */
export async function handleDeepSeekPlanApi(
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
    if (!isValidMapPlanRequest(body)) {
      sendJson(res, 400, { error: '请求参数无效', code: 'invalid_params' });
      return;
    }

    const result = await generateMapPlan(body, env);
    sendJson(res, 200, result);
  } catch (error) {
    if (error instanceof DeepSeekUnconfiguredError) {
      sendJson(res, 503, { error: error.message, code: error.code });
      return;
    }
    const message = error instanceof Error ? error.message : '生成方案失败';
    sendJson(res, 500, { error: message, code: 'generate_failed' });
  }
}
