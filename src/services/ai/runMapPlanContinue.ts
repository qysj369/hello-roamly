import type { DeepSeekChatMessage } from '@/types/api/deepseek';
import type { PlanChatHistoryItem } from '@/types/api/planContinueChat';
import {
  buildFollowUpIntentHint,
  detectFollowUpIntent,
} from '@/lib/plan/detectFollowUpIntent';
import { validatePlanBudget } from '@/lib/plan/planBudgetValidator';
import { scrubPlanDisplayMarkup } from '@/lib/home/scrubPlanDisplayMarkup';
import { sanitizePlanContentForDisplay } from '@/lib/plan/sanitizePlanContent';
import {
  buildMapPlanContinueSystemPrompt,
  buildMapPlanFollowUpUserPrompt,
} from '@/services/ai/prompts/mapPlanGeneration';
import type { AiSnailGuideCompleter } from '@/services/ai/runAiSnailGuideGeneration';
import { DeepSeekUnconfiguredError } from '@/services/ai/runMapPlanGeneration';

export type MapPlanContinueParams = {
  planId: string;
  message: string;
  fullHistory: PlanChatHistoryItem[];
  locationName: string;
  lng?: number;
  lat?: number;
};

export type MapPlanContinueResult = {
  reply: string;
};

export function buildMapPlanContinueMessages(
  params: MapPlanContinueParams,
): DeepSeekChatMessage[] {
  const trimmed = params.message.trim();
  if (!trimmed) {
    throw new Error('追问内容不能为空');
  }

  const locationName = params.locationName.trim() || '目的地';
  const intent = detectFollowUpIntent(trimmed);
  const intentHint = buildFollowUpIntentHint(intent, locationName);
  const contextMessages = params.fullHistory.map((item) => ({
    role: item.role,
    content: item.content,
  }));

  return [
    { role: 'system', content: buildMapPlanContinueSystemPrompt() },
    ...contextMessages,
    {
      role: 'user',
      content: buildMapPlanFollowUpUserPrompt(trimmed, locationName, intentHint),
    },
  ];
}

export function finalizeMapPlanContinueReply(raw: string): string {
  return attachBudgetFootnote(scrubPlanDisplayMarkup(sanitizePlanContentForDisplay(raw.trim())));
}

export async function runMapPlanContinue(
  params: MapPlanContinueParams,
  completer: AiSnailGuideCompleter | null,
): Promise<MapPlanContinueResult> {
  const trimmed = params.message.trim();
  if (!trimmed) {
    throw new Error('追问内容不能为空');
  }

  if (!completer) {
    throw new DeepSeekUnconfiguredError();
  }

  const reply = await completer({
    messages: buildMapPlanContinueMessages(params),
    temperature: 0.55,
    maxTokens: 1800,
    jsonMode: false,
  });

  return {
    reply: finalizeMapPlanContinueReply(reply),
  };
}

function attachBudgetFootnote(content: string): string {
  const validation = validatePlanBudget(content);
  if (!validation.footnote) {
    return content;
  }
  if (content.includes('预算校验')) {
    return content;
  }
  return `${content.trim()}\n\n${validation.footnote}`;
}
