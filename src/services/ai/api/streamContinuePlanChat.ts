import { parseSseStream } from '@/services/ai/api/parseSseStream';
import { fetchContinuePlanChat } from '@/services/ai/api/continuePlanChat';
import { AI_API } from '@/services/ai/paths';
import type {
  ContinuePlanChatRequest,
  ContinuePlanChatResponse,
} from '@/types/api/planContinueChat';

export class ContinuePlanChatStreamError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ContinuePlanChatStreamError';
    this.code = code;
  }
}

export type StreamContinuePlanChatOptions = {
  params: ContinuePlanChatRequest;
  signal?: AbortSignal;
  onDelta?: (text: string) => void;
};

/**
 * POST /api/ai/continue-chat-stream
 * DeepSeek 未配置时回退非流式 continue-chat。
 */
export async function streamContinuePlanChat(
  options: StreamContinuePlanChatOptions,
): Promise<ContinuePlanChatResponse> {
  const response = await fetch(AI_API.continueChatStream, {
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
    let message = `流式追问失败 (${response.status})`;
    try {
      const json = (await response.json()) as { error?: string };
      if (json.error) {
        message = json.error;
      }
    } catch {
      /* ignore */
    }
    throw new ContinuePlanChatStreamError(message, 'http_error');
  }

  if (!response.body) {
    throw new ContinuePlanChatStreamError('未收到流式响应', 'no_body');
  }

  let finished = false;
  let unconfigured = false;
  let reply = '';

  await parseSseStream(
    response.body,
    {
      onEvent: (event, data) => {
        if (event === 'ping') {
          return;
        }
        if (event === 'delta') {
          const text = (data as { text?: string }).text ?? '';
          if (text) {
            reply += text;
            options.onDelta?.(text);
          }
          return;
        }
        if (event === 'done') {
          const payload = data as { reply?: string };
          if (payload.reply?.trim()) {
            reply = payload.reply.trim();
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
          throw new ContinuePlanChatStreamError(payload.message ?? '流式追问失败', payload.code);
        }
      },
    },
    options.signal,
  );

  if (unconfigured) {
    return fetchContinuePlanChat(options.params);
  }

  if (options.signal?.aborted) {
    throw new ContinuePlanChatStreamError('已停止生成', 'aborted');
  }

  if (!reply.trim()) {
    throw new ContinuePlanChatStreamError('追问回复为空', 'empty_reply');
  }

  if (!finished) {
    throw new ContinuePlanChatStreamError('流式连接意外结束', 'incomplete');
  }

  return { reply: reply.trim() };
}
