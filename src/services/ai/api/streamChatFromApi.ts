import type {
  AiChatStreamDeltaEvent,
  AiChatStreamErrorEvent,
  AiChatStreamRequest,
} from '@/types/api/aiChatStream';
import { AI_API } from '@/services/ai/paths';
import { parseSseStream } from '@/services/ai/api/parseSseStream';

export class AiChatStreamError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AiChatStreamError';
    this.code = code;
  }
}

export type StreamChatFromApiOptions = {
  request: AiChatStreamRequest;
  signal?: AbortSignal;
  onDelta: (text: string) => void;
};

/**
 * POST /api/ai/chat-stream — 消费服务端 SSE。
 * @returns true 表示流式完成；false 表示服务端未配置（可回退 mock）
 */
export async function streamChatFromApi({
  request,
  signal,
  onDelta,
}: StreamChatFromApiOptions): Promise<'done' | 'unconfigured'> {
  const response = await fetch(AI_API.chatStream, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(request),
    signal,
  });

  const contentType = response.headers.get('Content-Type') ?? '';

  if (response.status === 503 || response.status === 501) {
    return 'unconfigured';
  }

  if (!response.ok && !contentType.includes('text/event-stream')) {
    let message = `流式对话失败 (${response.status})`;
    try {
      const json = (await response.json()) as { error?: string };
      if (json.error) {
        message = json.error;
      }
    } catch {
      /* ignore */
    }
    throw new AiChatStreamError(message, 'http_error');
  }

  if (!response.body) {
    throw new AiChatStreamError('未收到流式响应', 'no_body');
  }

  let finished = false;
  let unconfigured = false;

  await parseSseStream(
    response.body,
    {
      onEvent: (event, data) => {
        if (event === 'delta') {
          const payload = data as AiChatStreamDeltaEvent;
          if (payload.text) {
            onDelta(payload.text);
          }
          return;
        }
        if (event === 'done') {
          finished = true;
          return;
        }
        if (event === 'error') {
          const payload = data as AiChatStreamErrorEvent;
          if (payload.code === 'deepseek_unconfigured') {
            unconfigured = true;
            return;
          }
          throw new AiChatStreamError(payload.message ?? '流式回复失败', payload.code);
        }
      },
    },
    signal,
  );

  if (unconfigured) {
    return 'unconfigured';
  }

  if (!finished && !signal?.aborted) {
    throw new AiChatStreamError('流式连接意外结束', 'incomplete');
  }

  return 'done';
}
