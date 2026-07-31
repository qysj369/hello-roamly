/**
 * AI 服务层统一入口
 *
 * - 已配置 `VITE_DEEPSEEK_API_KEY` 时调用 DeepSeek Chat Completions
 * - 未配置时回退本地演示回复（`generateMockChatReply`）
 *
 * 实现细节见 `services/ai/` 目录
 */

export { generateChatReply, getAiProvider } from '@/services/ai/chat';
export type { AiProvider } from '@/services/ai/chat';
export { streamChatReply } from '@/services/ai/streamChat';
export { AiChatStreamError } from '@/services/ai/api/streamChatFromApi';

export { generateDeepSeekChatReply } from '@/services/ai/generateDeepSeekChatReply';
export { generateMockChatReply } from '@/services/ai/generateMockChatReply';
export { generateTravelPlan } from '@/services/ai/generateTravelPlan';
export { generateMockTravelPlan } from '@/services/ai/generateMockTravelPlan';

export { buildTravelAdvisorSystemPrompt } from '@/services/ai/prompts/travelAdvisorSystem';
export { mapToDeepSeekMessages } from '@/services/ai/mapMessages';

export {
  createDeepSeekChatCompletion,
  DeepSeekApiError,
  parseDeepSeekError,
} from '@/services/ai/deepseek';

export type { DeepSeekChatOptions } from '@/services/ai/deepseek';
