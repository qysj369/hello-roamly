import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  continueMapPlanChat,
  isValidContinuePlanChatRequest,
} from '../../controllers/aiPlanContinueController';
import type { ServerEnv } from '../../lib/deepseekServer';
import { readJsonBody, sendJson } from '../../lib/http';

/** POST /api/ai/continue-chat — 穷游方案连续追问 */
export async function handleContinuePlanChatApi(
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
    if (!isValidContinuePlanChatRequest(body)) {
      sendJson(res, 400, { error: '请求参数无效', code: 'invalid_params' });
      return;
    }

    const result = await continueMapPlanChat(body, env);
    sendJson(res, 200, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '追问失败';
    sendJson(res, 500, { error: message, code: 'continue_failed' });
  }
}
