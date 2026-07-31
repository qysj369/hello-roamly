import type { AiChatContext, AiChatMessage } from '@/types/domain/aiChat';
import type { DeepSeekChatMessage } from '@/types/api/deepseek';
import { buildTravelAdvisorSystemPrompt } from '@/services/ai/prompts/travelAdvisorSystem';

export function mapToDeepSeekMessages(
  messages: AiChatMessage[],
  context?: AiChatContext,
): DeepSeekChatMessage[] {
  const system: DeepSeekChatMessage = {
    role: 'system',
    content: buildTravelAdvisorSystemPrompt(context),
  };

  const history = messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map(
      (message): DeepSeekChatMessage => ({
        role: message.role,
        content: message.content,
      }),
    );

  return [system, ...history];
}
