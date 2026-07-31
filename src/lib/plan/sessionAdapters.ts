import type { UserAiSessionRecord } from '@/types/api/userAiSessions';
import type { UserPlanRecord } from '@/types/api/userPlans';
import type { DiscoverSavedPlanItem } from '@/types/domain/discover';
import type { PlanHistoryEntry } from '@/types/domain/planHistory';
import type { PlanConversationTurn } from '@/lib/plan/planConversation';
import { buildPlanHistorySummary } from '@/lib/plan/planHistoryStorage';

export function historyItemsToTurns(
  history: UserAiSessionRecord['fullHistory'],
): PlanConversationTurn[] {
  return history.map((item, index) => ({
    id: `hist-${index}`,
    role: item.role,
    content: item.content,
  }));
}

export function turnsToHistoryItems(
  turns: PlanConversationTurn[],
): UserAiSessionRecord['fullHistory'] {
  return turns.map(({ role, content }) => ({ role, content }));
}

export function sessionToHistoryEntry(session: UserAiSessionRecord): PlanHistoryEntry {
  return {
    sessionId: session.id,
    trigger: session.trigger,
    locationName: session.location.name,
    summary: buildPlanHistorySummary(session.location.name, session.initialQuery),
    initialQuery: session.initialQuery,
    lng: session.location.lng,
    lat: session.location.lat,
    conversationTurns: historyItemsToTurns(session.fullHistory),
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

/** 兼容现有「我的方案」UI 组件 */
export function sessionToLegacyPlanRecord(session: UserAiSessionRecord): UserPlanRecord {
  const title =
    session.title?.trim() ||
    (session.location.name ? `${session.location.name}穷游方案` : '我的穷游方案');

  return {
    id: session.id,
    userId: session.userId,
    title,
    content: {
      planId: session.id,
      locationName: session.location.name,
      lng: session.location.lng,
      lat: session.location.lat,
      initialQuery: session.initialQuery || undefined,
      fullHistory: session.fullHistory,
    },
    isPublic: session.isPublic,
    isSaved: session.isSaved,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export function sessionToDiscoverItem(session: UserAiSessionRecord): DiscoverSavedPlanItem {
  const title =
    session.title?.trim() ||
    (session.location.name ? `${session.location.name}穷游方案` : '我的穷游方案');

  return {
    kind: 'savedPlan',
    id: `saved-plan-${session.id}`,
    userPlanId: session.id,
    title,
    locationName: session.location.name,
    authorId: session.userId,
    updatedAt: session.updatedAt,
  };
}

export function legacyPlanRecordToSession(record: UserPlanRecord): UserAiSessionRecord {
  return {
    id: record.id,
    userId: record.userId,
    title: record.title,
    location: {
      name: record.content.locationName,
      lng: record.content.lng,
      lat: record.content.lat,
    },
    initialQuery: record.content.initialQuery ?? '',
    trigger: 'map_click',
    fullHistory: record.content.fullHistory,
    isSaved: record.isSaved ?? true,
    isPublic: record.isPublic,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
