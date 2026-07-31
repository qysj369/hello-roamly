import { assertAiServiceReady, getAiProvider } from '@/lib/config/ai';
import { isProductionAppMode } from '@/lib/config/appMode';
import {
  fetchTravelPlanFromApi,
  GenerateTravelPlanApiError,
} from '@/services/ai/api/generateTravelPlanApi';
import { createDeepSeekChatCompletion } from '@/services/ai/deepseek';
import { generateMockTravelPlan } from '@/services/ai/generateMockTravelPlan';
import { runTravelPlanGeneration } from '@/services/ai/runTravelPlanGeneration';
import type { EnrichedTravelPlan } from '@/types/domain/travelPlan';
import type { TravelOptions } from '@/types/domain/travelOptions';

async function generateViaClientFallback(
  prompt: string,
  options: TravelOptions,
): Promise<EnrichedTravelPlan> {
  if (isProductionAppMode()) {
    assertAiServiceReady();
  } else if (getAiProvider() === 'mock') {
    return generateMockTravelPlan(prompt, options);
  }

  return runTravelPlanGeneration(prompt, options, createDeepSeekChatCompletion);
}

/**
 * 根据用户 prompt 与旅行选项生成完整 TravelPlan
 * - 优先走 /api/ai/generate-travel-plan（服务端 DeepSeek，更快更稳）
 * - 不可用时回退浏览器直连 / 演示模式
 */
export async function generateTravelPlan(
  prompt: string,
  options: TravelOptions = {},
): Promise<EnrichedTravelPlan> {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    throw new Error('请提供旅行需求描述');
  }

  try {
    return await fetchTravelPlanFromApi(trimmedPrompt, options);
  } catch (error) {
    const shouldFallback =
      error instanceof GenerateTravelPlanApiError &&
      (error.status === 403 ||
        error.status === 404 ||
        error.status === 502 ||
        error.status === 503);

    if (!shouldFallback && error instanceof GenerateTravelPlanApiError && error.status && error.status < 500) {
      throw error;
    }

    return generateViaClientFallback(trimmedPrompt, options);
  }
}
