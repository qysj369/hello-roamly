import type { IncomingMessage, ServerResponse } from 'node:http';
import type { GenerateAiSnailGuideRequest } from '@/types/api/aiSnailGuide';
import { runAiSnailGuideGeneration } from '@/services/ai/runAiSnailGuideGeneration';
import { createServerDeepSeekCompleter, type ServerEnv } from '../../lib/deepseekServer';
import { readJsonBody, sendJson } from '../../lib/http';

function isValidParams(body: unknown): body is GenerateAiSnailGuideRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }
  const record = body as Record<string, unknown>;
  return (
    typeof record.destination === 'string' &&
    typeof record.days === 'number' &&
    typeof record.budgetRange === 'string' &&
    Array.isArray(record.preferences)
  );
}

/** POST /api/ai/generate-guide — 服务端调用 DeepSeek 生成结构化穷游攻略 */
export async function handleGenerateGuideApi(
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
    if (!isValidParams(body)) {
      sendJson(res, 400, { error: '请求参数无效', code: 'invalid_params' });
      return;
    }

    const completer = createServerDeepSeekCompleter(env);
    const guide = await runAiSnailGuideGeneration(body, completer, {
      forceMock: !completer,
    });

    sendJson(res, 200, { guide });
  } catch (error) {
    const message = error instanceof Error ? error.message : '生成攻略失败';
    sendJson(res, 500, { error: message, code: 'generate_failed' });
  }
}
