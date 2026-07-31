import type { IncomingMessage, ServerResponse } from 'node:http';
import { mapToDeepSeekMessages } from '@/services/ai/mapMessages';
import type { AiChatStreamRequest } from '@/types/api/aiChatStream';
import type { AiChatMessage } from '@/types/domain/aiChat';
import {
  isServerDeepSeekStreamConfigured,
  streamDeepSeekChatCompletion,
} from '../lib/deepseekStreamServer';
import type { ServerEnv } from '../lib/deepseekServer';
import { endSse, initSseResponse, writeSseEvent } from '../lib/sse';

function isValidChatStreamRequest(body: unknown): body is AiChatStreamRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }
  const record = body as AiChatStreamRequest;
  if (!Array.isArray(record.messages) || record.messages.length === 0) {
    return false;
  }
  return record.messages.every(
    (turn) =>
      (turn.role === 'user' || turn.role === 'assistant') &&
      typeof turn.content === 'string' &&
      turn.content.trim().length > 0,
  );
}

function toAiChatMessages(turns: AiChatStreamRequest['messages']): AiChatMessage[] {
  const now = new Date().toISOString();
  return turns.map((turn, index) => ({
    id: `stream-${index}-${turn.role}`,
    role: turn.role,
    content: turn.content.trim(),
    createdAt: now,
    status: 'complete' as const,
  }));
}

/** POST /api/ai/chat-stream — 旅行顾问 SSE 流式对话 */
export async function streamAdvisorChat(
  body: AiChatStreamRequest,
  res: ServerResponse,
  env: ServerEnv,
  reqSignal?: AbortSignal,
): Promise<void> {
  if (!isServerDeepSeekStreamConfigured(env)) {
    initSseResponse(res);
    writeSseEvent(res, 'error', {
      message: 'DeepSeek 未配置，请设置服务端 API Key',
      code: 'deepseek_unconfigured',
    });
    endSse(res);
    return;
  }

  const apiMessages = mapToDeepSeekMessages(toAiChatMessages(body.messages), body.context);
  initSseResponse(res);

  const abortController = new AbortController();
  const onClientClose = () => abortController.abort();
  reqSignal?.addEventListener('abort', onClientClose, { once: true });
  res.on('close', onClientClose);

  try {
    await streamDeepSeekChatCompletion({
      env,
      messages: apiMessages,
      signal: abortController.signal,
      onDelta: (text) => {
        if (!res.writableEnded) {
          writeSseEvent(res, 'delta', { text });
        }
      },
    });

    if (!res.writableEnded) {
      writeSseEvent(res, 'done', {});
      endSse(res);
    }
  } catch (error) {
    if (res.writableEnded) {
      return;
    }
    const message = error instanceof Error ? error.message : '流式回复失败';
    const code = abortController.signal.aborted ? 'aborted' : 'stream_failed';
    writeSseEvent(res, 'error', { message, code });
    endSse(res);
  } finally {
    res.off('close', onClientClose);
  }
}

export function isValidAdvisorChatStreamRequest(body: unknown): body is AiChatStreamRequest {
  return isValidChatStreamRequest(body);
}

export async function handleAdvisorChatStreamFromRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: ServerEnv,
  body: unknown,
): Promise<void> {
  if (!isValidAdvisorChatStreamRequest(body)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: '请求参数无效', code: 'invalid_params' }));
    return;
  }

  await streamAdvisorChat(body, res, env);
}
