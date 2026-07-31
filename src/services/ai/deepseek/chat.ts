import type { DeepSeekChatCompletionResponse, DeepSeekChatMessage } from '@/types/api/deepseek';
import { createDeepSeekHttp } from '@/services/ai/deepseek/client';
import { DeepSeekApiError, parseDeepSeekError } from '@/services/ai/deepseek/errors';

export type DeepSeekChatOptions = {
  messages: DeepSeekChatMessage[];
  temperature?: number;
  maxTokens?: number;
  /** 要求模型输出 JSON 对象（DeepSeek OpenAI 兼容） */
  jsonMode?: boolean;
};

const CHAT_COMPLETIONS_PATH = '/chat/completions';

export async function createDeepSeekChatCompletion({
  messages,
  temperature = 0.7,
  maxTokens = 2048,
  jsonMode = false,
}: DeepSeekChatOptions): Promise<string> {
  const { client, config } = createDeepSeekHttp();

  try {
    const { data } = await client.post<DeepSeekChatCompletionResponse>(CHAT_COMPLETIONS_PATH, {
      model: config.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
      ...(jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
    });

    const content = data.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new DeepSeekApiError('DeepSeek 返回了空回复');
    }

    return content;
  } catch (error) {
    throw parseDeepSeekError(error);
  }
}
