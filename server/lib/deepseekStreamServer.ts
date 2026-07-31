import type { DeepSeekChatMessage } from '@/types/api/deepseek';
import type { ServerEnv } from './deepseekServer';

const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_MODEL = 'deepseek-chat';

function readKey(env: ServerEnv): string | undefined {
  const key = env.DEEPSEEK_API_KEY ?? env.VITE_DEEPSEEK_API_KEY;
  return key?.trim() || undefined;
}

export function isServerDeepSeekStreamConfigured(env: ServerEnv): boolean {
  return Boolean(readKey(env));
}

export type StreamDeepSeekOptions = {
  env: ServerEnv;
  messages: DeepSeekChatMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
  onDelta: (text: string) => void;
};

/** 解析 DeepSeek OpenAI 兼容 SSE，逐段回调 delta 文本 */
async function consumeDeepSeekSseBody(
  body: ReadableStream<Uint8Array>,
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        return;
      }

      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) {
          continue;
        }
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === '[DONE]') {
          continue;
        }

        try {
          const json = JSON.parse(payload) as {
            choices?: { delta?: { content?: string | null } }[];
          };
          const text = json.choices?.[0]?.delta?.content;
          if (text) {
            onDelta(text);
          }
        } catch {
          /* 忽略非 JSON 行 */
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/** 服务端流式调用 DeepSeek Chat Completions */
export async function streamDeepSeekChatCompletion({
  env,
  messages,
  temperature = 0.7,
  maxTokens = 2048,
  signal,
  onDelta,
}: StreamDeepSeekOptions): Promise<void> {
  const apiKey = readKey(env);
  if (!apiKey) {
    throw new Error('DeepSeek 未配置：请设置 DEEPSEEK_API_KEY 或 VITE_DEEPSEEK_API_KEY');
  }

  const baseURL = (env.DEEPSEEK_BASE_URL ?? env.VITE_DEEPSEEK_BASE_URL ?? DEFAULT_BASE_URL).trim();
  const model = (env.DEEPSEEK_MODEL ?? env.VITE_DEEPSEEK_MODEL ?? DEFAULT_MODEL).trim();
  const url = `${baseURL.replace(/\/$/, '')}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    let detail = `DeepSeek 请求失败 (${response.status})`;
    try {
      const errJson = (await response.json()) as { error?: { message?: string } };
      if (errJson.error?.message) {
        detail = errJson.error.message;
      }
    } catch {
      /* use default */
    }
    throw new Error(detail);
  }

  if (!response.body) {
    throw new Error('DeepSeek 未返回流式正文');
  }

  await consumeDeepSeekSseBody(response.body, onDelta, signal);
}
