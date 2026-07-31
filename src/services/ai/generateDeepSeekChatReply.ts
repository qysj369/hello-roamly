import { createDeepSeekChatCompletion } from '@/services/ai/deepseek';
import { mapToDeepSeekMessages } from '@/services/ai/mapMessages';
import type { AiChatContext, AiChatMessage } from '@/types/domain/aiChat';

/** 调用 DeepSeek Chat Completions 生成顾问回复 */
export async function generateDeepSeekChatReply(
  messages: AiChatMessage[],
  context?: AiChatContext,
): Promise<string> {
  const apiMessages = mapToDeepSeekMessages(messages, context);
  return createDeepSeekChatCompletion({ messages: apiMessages });
}
