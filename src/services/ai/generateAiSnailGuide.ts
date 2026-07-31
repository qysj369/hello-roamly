import { assertAiServiceReady, getAiProvider } from '@/lib/config/ai';
import { isProductionAppMode } from '@/lib/config/appMode';
import { fetchAiSnailGuideFromApi, GenerateGuideApiError } from '@/services/ai/api/generateGuide';
import { createDeepSeekChatCompletion } from '@/services/ai/deepseek';
import { runAiSnailGuideGeneration } from '@/services/ai/runAiSnailGuideGeneration';
import type { AiSnailGuideParams, AiSnailGuideResult } from '@/types/domain/aiSnailGuide';

async function completeViaDeepSeek(input: {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}): Promise<string> {
  return createDeepSeekChatCompletion({
    messages: input.messages,
    temperature: input.temperature,
    maxTokens: input.maxTokens,
    jsonMode: input.jsonMode,
  });
}

async function generateViaClientFallback(params: AiSnailGuideParams): Promise<AiSnailGuideResult> {
  if (isProductionAppMode()) {
    assertAiServiceReady();
  } else if (getAiProvider() === 'mock') {
    return runAiSnailGuideGeneration(params, null, { forceMock: true });
  }

  return runAiSnailGuideGeneration(params, completeViaDeepSeek);
}

/**
 * AI蜗牛：优先走 /api/ai/generate-guide；不可用时回退浏览器直连 / 演示模式
 */
export async function generateAiSnailGuide(
  params: AiSnailGuideParams,
): Promise<AiSnailGuideResult> {
  try {
    return await fetchAiSnailGuideFromApi(params);
  } catch (error) {
    const shouldFallback =
      error instanceof GenerateGuideApiError &&
      (error.status === 404 || error.status === 502 || error.status === 503);

    if (!shouldFallback && error instanceof GenerateGuideApiError && error.status && error.status < 500) {
      throw error;
    }

    return generateViaClientFallback(params);
  }
}
