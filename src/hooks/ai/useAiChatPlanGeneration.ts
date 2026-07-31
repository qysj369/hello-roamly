import { useCallback } from 'react';
import type { AiTravelParams } from '@/types/domain/aiTravelParams';
import type { AiChatContext, AiChatMessage } from '@/types/domain/aiChat';
import { useGenerateTravelPlan } from '@/hooks/ai/useGenerateTravelPlan';
import {
  buildTravelPlanPromptFromParams,
  mapAiTravelParamsToOptions,
} from '@/utils/mapTravelOptions';
import { extractDestinationFromPrompt } from '@/utils/extractTravelIntent';

type UseAiChatPlanGenerationOptions = {
  messages: AiChatMessage[];
  travelParams: AiTravelParams;
  chatContext: AiChatContext;
};

/** 从对话上下文构建行程生成请求（与 UI 分离） */
export function useAiChatPlanGeneration({
  messages,
  travelParams,
  chatContext,
}: UseAiChatPlanGenerationOptions) {
  const planGeneration = useGenerateTravelPlan();

  const canGenerateFromContext = Boolean(
    messages.some((message) => message.role === 'user') || chatContext.dream?.trim(),
  );

  const generateFromContext = useCallback((cfg: { openDialog?: boolean } = {}) => {
    planGeneration.clearError();
    const lastUser = [...messages].reverse().find((message) => message.role === 'user');
    const dreamText = chatContext.dream?.trim();
    const destination =
      chatContext.destination?.trim() ||
      (lastUser ? extractDestinationFromPrompt(lastUser.content) : undefined) ||
      (dreamText ? extractDestinationFromPrompt(dreamText) : undefined);

    let prompt =
      lastUser?.content.trim() ||
      dreamText ||
      buildTravelPlanPromptFromParams(travelParams, destination);

    if (planGeneration.lastPlan?.title) {
      prompt = `基于「${planGeneration.lastPlan.title}」调整：${prompt}`;
    }

    const options = mapAiTravelParamsToOptions(travelParams, { destination });
    return planGeneration.generate(prompt, options, cfg);
  }, [chatContext.destination, chatContext.dream, messages, planGeneration, travelParams]);

  return {
    ...planGeneration,
    canGenerateFromContext,
    generateFromContext,
  };
}
