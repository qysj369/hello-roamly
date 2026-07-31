import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleAdvisorChatStreamFromRequest } from '../../controllers/aiChatStreamController';
import type { ServerEnv } from '../../lib/deepseekServer';
import { readJsonBody } from '../../lib/http';

/** POST /api/ai/chat-stream — 旅行顾问 SSE 流式对话（Key 仅服务端） */
export async function handleChatStreamApi(
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
    await handleAdvisorChatStreamFromRequest(req, res, env, body);
  } catch (error) {
    if (res.headersSent) {
      return;
    }
    const message = error instanceof Error ? error.message : '流式对话失败';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: message, code: 'stream_failed' }));
  }
}
