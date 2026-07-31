import type { PlanConversationTurn } from '@/lib/plan/planConversation';

/** AI 规划历史的触发来源 */
export type PlanHistoryTrigger = 'map_click' | 'card_click' | 'search' | 'advisor';

export type PlanHistoryEntry = {
  sessionId: string;
  trigger: PlanHistoryTrigger;
  locationName: string;
  /** 列表展示摘要，如「达州市 | 预算100元」 */
  summary: string;
  initialQuery: string;
  lng: number;
  lat: number;
  conversationTurns: PlanConversationTurn[];
  createdAt: string;
  updatedAt: string;
};
