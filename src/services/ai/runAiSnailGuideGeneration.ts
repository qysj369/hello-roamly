import { generateMockAiSnailGuide } from '@/services/ai/generateMockAiSnailGuide';
import { parseAiSnailGuideFromAiResponse } from '@/services/ai/parseAiSnailGuide';
import {
  buildAiSnailSystemPrompt,
  buildAiSnailUserPrompt,
  getAiSnailBudgetLabel,
  getAiSnailInterestLabels,
} from '@/services/ai/prompts/aiSnailGuide';
import type { AiSnailGuideParams, AiSnailGuideResult } from '@/types/domain/aiSnailGuide';

export type AiSnailChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AiSnailGuideCompleter = (input: {
  messages: AiSnailChatMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}) => Promise<string>;

function validateParams(params: AiSnailGuideParams): void {
  if (!params.destination.trim()) {
    throw new Error('请填写目的地');
  }
  if (!Number.isFinite(params.days) || params.days < 1) {
    throw new Error('请填写有效的旅行天数');
  }
  if (params.preferences.length === 0) {
    throw new Error('请至少选择一项旅行偏好');
  }
}

/** 共享生成逻辑：供浏览器直连与 /api/ai/generate-guide 复用 */
export async function runAiSnailGuideGeneration(
  params: AiSnailGuideParams,
  complete: AiSnailGuideCompleter | null,
  options?: { forceMock?: boolean },
): Promise<AiSnailGuideResult> {
  validateParams(params);

  const destination = params.destination.trim();
  const meta = {
    destination,
    days: params.days,
    budgetLabel: getAiSnailBudgetLabel(params),
    interests: getAiSnailInterestLabels(params),
    id: `snail-${Date.now()}`,
  };

  if (options?.forceMock || !complete) {
    return generateMockAiSnailGuide(params);
  }

  const raw = await complete({
    messages: [
      { role: 'system', content: buildAiSnailSystemPrompt() },
      { role: 'user', content: buildAiSnailUserPrompt(params) },
    ],
    temperature: 0.45,
    maxTokens: 3200,
    jsonMode: true,
  });

  return parseAiSnailGuideFromAiResponse(raw, meta);
}
