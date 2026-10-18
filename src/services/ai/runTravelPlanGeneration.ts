import { assembleTravelPlan } from '@/services/ai/assembleTravelPlan';
import { parseTravelPlanFromAiResponse } from '@/services/ai/parseTravelPlan';
import {
  buildTravelPlanSystemPrompt,
  buildTravelPlanUserPrompt,
} from '@/services/ai/prompts/travelPlanGeneration';
import { resolveTravelPlanMaxTokens } from '@/services/ai/travelPlanGenerationLimits';
import type { EnrichedTravelPlan } from '@/types/domain/travelPlan';
import type { TravelOptions } from '@/types/domain/travelOptions';
import { DEFAULT_TRAVEL_OPTIONS } from '@/types/domain/travelOptions';

export type TravelPlanCompleter = (input: {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}) => Promise<string>;

/** 共享：顾问页 / 服务端 API 生成结构化行程 */
export async function runTravelPlanGeneration(
  prompt: string,
  options: TravelOptions,
  completer: TravelPlanCompleter,
): Promise<EnrichedTravelPlan> {
  const trimmedPrompt = prompt.trim();
  const days = options.days ?? DEFAULT_TRAVEL_OPTIONS.days;

  const raw = await completer({
    messages: [
      { role: 'system', content: buildTravelPlanSystemPrompt() },
      { role: 'user', content: buildTravelPlanUserPrompt(trimmedPrompt, options) },
    ],
    temperature: 0.3,
    maxTokens: resolveTravelPlanMaxTokens(days),
    jsonMode: true,
  });

  const parsed = parseTravelPlanFromAiResponse(raw);
  return assembleTravelPlan(parsed, options, trimmedPrompt);
}
