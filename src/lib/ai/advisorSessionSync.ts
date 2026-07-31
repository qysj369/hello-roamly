import { createPlanMessageId, createPlanSessionId } from '@/lib/plan/planConversation';
import { buildPlanHistorySummary } from '@/lib/plan/planHistoryStorage';
import {
  persistUserAiSessionCreate,
  persistUserAiSessionHistory,
} from '@/lib/plan/persistUserAiSession';
import { queryClient } from '@/lib/query/client';
import { usePlanHistoryStore } from '@/stores/planHistory/store';
import type { AiChatContext, AiChatMessage } from '@/types/domain/aiChat';
import type { PlanHistoryEntry } from '@/types/domain/planHistory';
import type { PlanConversationTurn } from '@/lib/plan/planConversation';

function invalidatePlanHistoryQueries(): void {
  void queryClient.invalidateQueries({ queryKey: ['user-ai-sessions'] });
}

export function chatMessagesToTurns(messages: AiChatMessage[]): PlanConversationTurn[] {
  return messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .filter((message) => message.content.trim().length > 0)
    .map((message) => ({
      id: message.id || createPlanMessageId(),
      role: message.role as 'user' | 'assistant',
      content: message.content,
    }));
}

function resolveLocation(context?: AiChatContext): { name: string; lng: number; lat: number } {
  if (context?.origin) {
    return context.origin;
  }
  if (context?.location) {
    return context.location;
  }
  const name = context?.destination?.trim() || 'AI 顾问';
  return { name, lng: 0, lat: 0 };
}

function buildAdvisorHistoryEntry(
  sessionId: string,
  initialQuery: string,
  turns: PlanConversationTurn[],
  context?: AiChatContext,
): PlanHistoryEntry {
  const location = resolveLocation(context);
  const now = new Date().toISOString();
  return {
    sessionId,
    trigger: 'advisor',
    locationName: location.name,
    summary: buildPlanHistorySummary(location.name, initialQuery),
    initialQuery,
    lng: location.lng,
    lat: location.lat,
    conversationTurns: turns,
    createdAt: now,
    updatedAt: now,
  };
}

/** 顾问首条用户消息后创建会话 */
export async function syncAdvisorSessionCreate(
  sessionId: string,
  initialQuery: string,
  messages: AiChatMessage[],
  context?: AiChatContext,
): Promise<void> {
  const turns = chatMessagesToTurns(messages);
  const location = resolveLocation(context);

  await persistUserAiSessionCreate({
    sessionId,
    trigger: 'advisor',
    locationName: location.name,
    lng: location.lng,
    lat: location.lat,
    initialQuery,
    conversationTurns: turns,
  });

  const entry = buildAdvisorHistoryEntry(sessionId, initialQuery, turns, context);
  usePlanHistoryStore.getState().upsert(entry);
  invalidatePlanHistoryQueries();
}

/** 顾问每轮对话结束后同步 */
export async function syncAdvisorSessionUpdate(
  sessionId: string,
  initialQuery: string,
  messages: AiChatMessage[],
  context?: AiChatContext,
): Promise<void> {
  const turns = chatMessagesToTurns(messages);
  const location = resolveLocation(context);

  await persistUserAiSessionHistory({
    sessionId,
    conversationTurns: turns,
    initialQuery,
    locationName: location.name,
    lng: location.lng,
    lat: location.lat,
  });

  const entry = buildAdvisorHistoryEntry(sessionId, initialQuery, turns, context);
  usePlanHistoryStore.getState().upsert({
    ...entry,
    updatedAt: new Date().toISOString(),
  });
  invalidatePlanHistoryQueries();
}

export function createAdvisorSessionId(): string {
  return createPlanSessionId().replace(/^plan-/, 'advisor-');
}

/** 从服务端 fullHistory 还原为聊天消息 */
export function turnsToChatMessages(turns: PlanConversationTurn[]): AiChatMessage[] {
  return turns.map((turn) => ({
    id: turn.id,
    role: turn.role,
    content: turn.content,
    createdAt: new Date().toISOString(),
    status: 'complete' as const,
  }));
}

/** 将 plan 方案摘要截断后注入顾问上下文 */
export function buildPlanExcerpt(content: string, maxChars = 1200): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxChars) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxChars)}…`;
}

export function historyItemsToAdvisorMessages(
  history: { role: 'user' | 'assistant'; content: string }[],
): AiChatMessage[] {
  return history.map((item, index) => ({
    id: `hist-${index}`,
    role: item.role,
    content: item.content,
    createdAt: new Date().toISOString(),
    status: 'complete' as const,
  }));
}
