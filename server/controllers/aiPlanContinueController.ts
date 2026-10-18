import type { ContinuePlanChatRequest } from '@/types/api/planContinueChat';
import { runMapPlanContinue } from '@/services/ai/runMapPlanContinue';
import { createServerDeepSeekCompleter, type ServerEnv } from '../lib/deepseekServer';

function isValidHistoryItem(item: unknown): item is ContinuePlanChatRequest['fullHistory'][number] {
  if (!item || typeof item !== 'object') {
    return false;
  }
  const record = item as Record<string, unknown>;
  return (
    (record.role === 'user' || record.role === 'assistant') &&
    typeof record.content === 'string' &&
    record.content.trim().length > 0
  );
}

export function isValidContinuePlanChatRequest(body: unknown): body is ContinuePlanChatRequest {
  if (!body || typeof body !== 'object') {
    return false;
  }
  const record = body as Record<string, unknown>;
  return (
    typeof record.planId === 'string' &&
    record.planId.trim().length > 0 &&
    typeof record.message === 'string' &&
    record.message.trim().length > 0 &&
    Array.isArray(record.fullHistory) &&
    record.fullHistory.every(isValidHistoryItem)
  );
}

export async function continueMapPlanChat(body: ContinuePlanChatRequest, env: ServerEnv) {
  const locationName =
    (typeof body.locationName === 'string' && body.locationName.trim()) || '目的地';

  const completer = createServerDeepSeekCompleter(env);
  return runMapPlanContinue(
    {
      planId: body.planId.trim(),
      message: body.message.trim(),
      fullHistory: body.fullHistory,
      locationName,
      lng: typeof body.lng === 'number' ? body.lng : undefined,
      lat: typeof body.lat === 'number' ? body.lat : undefined,
    },
    completer,
  );
}
