import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleMapPlanStreamFromRequest } from '../../controllers/aiPlanStreamController';
import type { ServerEnv } from '../../lib/deepseekServer';
import { readJsonBody } from '../../lib/http';

/** POST /api/ai/generate-plan-stream — 一键规划 SSE 流式输出 */
export async function handleGeneratePlanStreamApi(
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
    await handleMapPlanStreamFromRequest(req, res, env, body);
  } catch (error) {
    if (res.headersSent) {
      return;
    }
    const message = error instanceof Error ? error.message : '流式规划失败';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: message, code: 'stream_failed' }));
  }
}
