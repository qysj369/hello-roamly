import type { PlanChatHistoryItem } from '@/types/api/planContinueChat';

export type PlanConversationTurn = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function createPlanSessionId(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createPlanMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function toPlanChatHistory(turns: PlanConversationTurn[]): PlanChatHistoryItem[] {
  return turns.map(({ role, content }) => ({ role, content }));
}

export function buildSavedPlanContent(params: {
  planId: string;
  locationName: string;
  lng: number;
  lat: number;
  initialQuery?: string;
  turns: PlanConversationTurn[];
}) {
  return {
    planId: params.planId,
    locationName: params.locationName,
    lng: params.lng,
    lat: params.lat,
    initialQuery: params.initialQuery,
    fullHistory: toPlanChatHistory(params.turns),
  };
}

export function buildCopyTextFromTurns(turns: PlanConversationTurn[]): string {
  return turns.map((turn) => turn.content).join('\n\n---\n\n');
}
