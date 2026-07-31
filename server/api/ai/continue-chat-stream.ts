import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleMapPlanContinueStreamFromRequest } from '../../controllers/aiPlanContinueStreamController';
import type { ServerEnv } from '../../lib/deepseekServer';
import { readJsonBody } from '../../lib/http';

/** POST /api/ai/continue-chat-stream — 方案增量追问 SSE */
export async function handleContinuePlanChatStreamApi(
  req: IncomingMessage,
  res: ServerResponse,
  env: ServerEnv,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    const body = await readJsonBody<unknown>(req);
    await handleMapPlanContinueStreamFromRequest(req, res, env, body);
  } catch (error) {
    if (res.headersSent) {
      return;
    }
    const message = error instanceof Error ? error.message : '流式追问失败';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: message, code: 'stream_failed' }));
  }
}
