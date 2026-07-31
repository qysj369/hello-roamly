import type { PlanHistoryTrigger } from '@/types/domain/planHistory';
import type { PlanConversationTurn } from '@/lib/plan/planConversation';
import { createUserAiSession, updateUserAiSession } from '@/services/user/api/userAiSessions';
import { turnsToHistoryItems } from '@/lib/plan/sessionAdapters';

type PersistSessionCreateParams = {
  sessionId: string;
  trigger: PlanHistoryTrigger;
  locationName: string;
  lng: number;
  lat: number;
  initialQuery: string;
  conversationTurns: PlanConversationTurn[];
};

/** 创建 AI 会话（地图/搜索/卡片触发） */
export async function persistUserAiSessionCreate(
  params: PersistSessionCreateParams,
): Promise<void> {
  await createUserAiSession({
    id: params.sessionId,
    trigger: params.trigger,
    initialQuery: params.initialQuery,
    location: {
      name: params.locationName,
      lng: params.lng,
      lat: params.lat,
    },
    fullHistory: turnsToHistoryItems(params.conversationTurns),
  });
}

type PersistSessionUpdateParams = {
  sessionId: string;
  conversationTurns: PlanConversationTurn[];
  initialQuery?: string;
  locationName?: string;
  lng?: number;
  lat?: number;
};

/** 同步会话对话历史（追问后） */
export async function persistUserAiSessionHistory(
  params: PersistSessionUpdateParams,
): Promise<void> {
  await updateUserAiSession(params.sessionId, {
    fullHistory: turnsToHistoryItems(params.conversationTurns),
    ...(params.initialQuery !== undefined ? { initialQuery: params.initialQuery } : {}),
    ...(params.locationName !== undefined &&
    params.lng !== undefined &&
    params.lat !== undefined
      ? {
          location: {
            name: params.locationName,
            lng: params.lng,
            lat: params.lat,
          },
        }
      : {}),
  });
}

/** 标记会话为已保存方案 */
export async function persistUserAiSessionSave(
  sessionId: string,
  params: {
    title: string;
    isPublic: boolean;
    conversationTurns: PlanConversationTurn[];
    locationName: string;
    lng: number;
    lat: number;
    initialQuery: string;
  },
): Promise<void> {
  await updateUserAiSession(sessionId, {
    title: params.title.trim(),
    isSaved: true,
    isPublic: params.isPublic,
    fullHistory: turnsToHistoryItems(params.conversationTurns),
    initialQuery: params.initialQuery,
    location: {
      name: params.locationName,
      lng: params.lng,
      lat: params.lat,
    },
  });
}
