import { assertAiServiceReady, getAiProvider, type AiProvider } from '@/lib/config/ai';
import { isProductionAppMode } from '@/lib/config/appMode';
import { generateDeepSeekChatReply } from '@/services/ai/generateDeepSeekChatReply';
import { generateMockChatReply } from '@/services/ai/generateMockChatReply';
import type { AiChatContext, AiChatMessage } from '@/types/domain/aiChat';

export type { AiProvider };

export { getAiProvider };

/**
 * 统一 AI 对话入口：已配置 DeepSeek 时走真实 API，否则使用本地演示回复
 */
export async function generateChatReply(
  messages: AiChatMessage[],
  context?: AiChatContext,
): Promise<string> {
  if (isProductionAppMode()) {
    assertAiServiceReady();
    return generateDeepSeekChatReply(messages, context);
  }

  if (getAiProvider() === 'deepseek') {
    return generateDeepSeekChatReply(messages, context);
  }

  return generateMockChatReply(messages, context);
}
