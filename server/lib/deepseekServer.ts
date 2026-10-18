import type { AiSnailChatMessage, AiSnailGuideCompleter } from '@/services/ai/runAiSnailGuideGeneration';
import axios from 'axios';

const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_MODEL = 'deepseek-chat';

export type ServerEnv = Record<string, string | undefined>;

function readKey(env: ServerEnv): string | undefined {
  const key = env.DEEPSEEK_API_KEY ?? env.VITE_DEEPSEEK_API_KEY;
  return key?.trim() || undefined;
}

export function isServerDeepSeekConfigured(env: ServerEnv): boolean {
  return Boolean(readKey(env));
}

export function createServerDeepSeekCompleter(env: ServerEnv): AiSnailGuideCompleter | null {
  const apiKey = readKey(env);
  if (!apiKey) {
    return null;
  }

  const baseURL = (env.DEEPSEEK_BASE_URL ?? env.VITE_DEEPSEEK_BASE_URL ?? DEFAULT_BASE_URL).trim();
  const model = (env.DEEPSEEK_MODEL ?? env.VITE_DEEPSEEK_MODEL ?? DEFAULT_MODEL).trim();

  const client = axios.create({
    baseURL,
    timeout: 180_000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return async ({ messages, temperature = 0.45, maxTokens = 3200, jsonMode = true }) => {
    const { data } = await client.post<{
      choices?: { message?: { content?: string | null } }[];
    }>('/chat/completions', {
      model,
      messages: messages as AiSnailChatMessage[],
      temperature,
      max_tokens: maxTokens,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
    });

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('DeepSeek 返回了空回复');
    }
    return content;
  };
}
