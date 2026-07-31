import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ContinuePlanChatRequest } from '@/types/api/planContinueChat';
import {
  buildMapPlanContinueMessages,
  finalizeMapPlanContinueReply,
} from '@/services/ai/runMapPlanContinue';
import { isValidContinuePlanChatRequest } from './aiPlanContinueController';
import {
  isServerDeepSeekStreamConfigured,
  streamDeepSeekChatCompletion,
} from '../lib/deepseekStreamServer';
import type { ServerEnv } from '../lib/deepseekServer';
import { endSse, initSseResponse, writeSseEvent } from '../lib/sse';

/** POST /api/ai/continue-chat-stream — 方案增量追问 SSE */
export async function streamMapPlanContinue(
  body: ContinuePlanChatRequest,
  res: ServerResponse,
  env: ServerEnv,
): Promise<void> {
  if (!isServerDeepSeekStreamConfigured(env)) {
    initSseResponse(res);
    writeSseEvent(res, 'error', {
      message: 'DeepSeek 未配置',
      code: 'deepseek_unconfigured',
    });
    endSse(res);
    return;
  }

  const locationName =
    (typeof body.locationName === 'string' && body.locationName.trim()) || '目的地';

  const messages = buildMapPlanContinueMessages({
    planId: body.planId.trim(),
    message: body.message.trim(),
    fullHistory: body.fullHistory,
    locationName,
    lng: typeof body.lng === 'number' ? body.lng : undefined,
    lat: typeof body.lat === 'number' ? body.lat : undefined,
  });

  initSseResponse(res);
  const abortController = new AbortController();
  const onClientClose = () => abortController.abort();
  res.on('close', onClientClose);

  const keepalive = setInterval(() => {
    if (!res.writableEnded && !abortController.signal.aborted) {
      writeSseEvent(res, 'ping', {});
    }
  }, 12_000);

  let accumulated = '';

  try {
    await streamDeepSeekChatCompletion({
      env,
      messages,
      temperature: 0.55,
      maxTokens: 1800,
      signal: abortController.signal,
      onDelta: (text) => {
        accumulated += text;
        if (!res.writableEnded) {
          writeSseEvent(res, 'delta', { text });
        }
      },
    });

    if (abortController.signal.aborted || res.writableEnded) {
      return;
    }

    const reply = finalizeMapPlanContinueReply(accumulated);
    writeSseEvent(res, 'done', { reply });
    endSse(res);
  } catch (error) {
    if (res.writableEnded) {
      return;
    }
    const message = error instanceof Error ? error.message : '流式追问失败';
    const code = abortController.signal.aborted ? 'aborted' : 'stream_failed';
    writeSseEvent(res, 'error', { message, code });
    endSse(res);
  } finally {
    clearInterval(keepalive);
    res.off('close', onClientClose);
  }
}

export async function handleMapPlanContinueStreamFromRequest(
  req: IncomingMessage,
  res: ServerResponse,
  env: ServerEnv,
  body: unknown,
): Promise<void> {
  if (!isValidContinuePlanChatRequest(body)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: '请求参数无效', code: 'invalid_params' }));
    return;
  }

  await streamMapPlanContinue(body, res, env);
}
