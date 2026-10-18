import { create } from 'zustand';
import {
  createPlanMessageId,
  createPlanSessionId,
  type PlanConversationTurn,
} from '@/lib/plan/planConversation';
import { buildPlanHistorySummary } from '@/lib/plan/planHistoryStorage';
import { sanitizeLocationLabelForDisplay } from '@/lib/map/resolveAmapPlaceName';
import { scrubPlanDisplayMarkup } from '@/lib/home/scrubPlanDisplayMarkup';
import { sanitizePlanContentForDisplay } from '@/lib/plan/sanitizePlanContent';
import {
  persistUserAiSessionCreate,
  persistUserAiSessionHistory,
} from '@/lib/plan/persistUserAiSession';
import { queryClient } from '@/lib/query/client';
import { usePlanHistoryStore } from '@/stores/planHistory/store';
import type { PlanHistoryEntry, PlanHistoryTrigger } from '@/types/domain/planHistory';

function invalidatePlanHistoryQueries(): void {
  void queryClient.invalidateQueries({ queryKey: ['user-ai-sessions'] });
}

type OpenPlanResultParams = {
  trigger: PlanHistoryTrigger;
  locationName: string;
  content: string;
  lng: number;
  lat: number;
  initialQuery: string;
};

type PlanStreamSessionParams = {
  trigger: PlanHistoryTrigger;
  locationName: string;
  lng: number;
  lat: number;
  initialQuery: string;
};

type GlobalMapPlanningState = {
  resultOpen: boolean;
  planStreaming: boolean;
  /** 服务端 SSE status 文案（优先于本地轮播） */
  planStreamStatus: string | null;
  resultLocation: string | null;
  resultContent: string | null;
  planSessionId: string | null;
  initialQuery: string | null;
  conversationTurns: PlanConversationTurn[];
  coords: { lng: number; lat: number };
  followUpLoading: boolean;
  followUpError: string | null;
  saveLoading: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  beginPlanStreamSession: (params: PlanStreamSessionParams) => void;
  appendPlanStreamDelta: (text: string) => void;
  replacePlanStreamContent: (content: string) => void;
  setPlanStreamStatus: (message: string | null) => void;
  openPlanResult: (params: OpenPlanResultParams) => void;
  finishPlanStream: (params: OpenPlanResultParams) => void;
  restoreFromHistory: (entry: PlanHistoryEntry) => void;
  closeResult: () => void;
  /** 新搜索：清空上一轮方案正文与会话，避免旧测试内容污染 */
  resetLivePlanSession: () => void;
  setConversationTurns: (
    turns:
      | PlanConversationTurn[]
      | ((current: PlanConversationTurn[]) => PlanConversationTurn[]),
  ) => void;
  setResultContent: (content: string) => void;
  setFollowUpLoading: (value: boolean) => void;
  setFollowUpError: (value: string | null) => void;
  beginFollowUpStream: () => void;
  finishFollowUpStream: (content: string) => void;
  setSaveLoading: (value: boolean) => void;
  setSaveError: (value: string | null) => void;
  setSaveSuccess: (value: boolean) => void;
  syncHistorySnapshot: () => void;
};

function lastAssistantContent(turns: PlanConversationTurn[]): string | null {
  for (let index = turns.length - 1; index >= 0; index -= 1) {
    const turn = turns[index];
    if (turn?.role === 'assistant') {
      return turn.content;
    }
  }
  return turns[0]?.content ?? null;
}

function buildHistoryEntryFromState(
  state: GlobalMapPlanningState,
  trigger: PlanHistoryTrigger,
  createdAt?: string,
): PlanHistoryEntry | null {
  if (!state.planSessionId || !state.resultLocation) {
    return null;
  }
  const now = new Date().toISOString();
  return {
    sessionId: state.planSessionId,
    trigger,
    locationName: state.resultLocation,
    summary: buildPlanHistorySummary(state.resultLocation, state.initialQuery ?? ''),
    initialQuery: state.initialQuery ?? '',
    lng: state.coords.lng,
    lat: state.coords.lat,
    conversationTurns: state.conversationTurns,
    createdAt: createdAt ?? now,
    updatedAt: now,
  };
}

function commitPlanResult(
  set: (
    partial:
      | Partial<GlobalMapPlanningState>
      | ((state: GlobalMapPlanningState) => Partial<GlobalMapPlanningState>),
  ) => void,
  get: () => GlobalMapPlanningState,
  params: OpenPlanResultParams,
  options: { planStreaming: boolean; persistHistory: boolean; sessionId?: string },
) {
  const sessionId = options.sessionId ?? createPlanSessionId();
  const now = new Date().toISOString();
  const displayLocation = sanitizeLocationLabelForDisplay(params.locationName);
  const sanitizedContent = scrubPlanDisplayMarkup(sanitizePlanContentForDisplay(params.content));
  const state = get();
  const userTurns = state.conversationTurns.filter((turn) => turn.role === 'user');
  const turns: PlanConversationTurn[] = [
    ...(userTurns.length > 0
      ? userTurns
      : params.initialQuery.trim()
        ? [{ id: createPlanMessageId(), role: 'user', content: params.initialQuery }]
        : []),
    { id: createPlanMessageId(), role: 'assistant', content: sanitizedContent },
  ];
  const entry: PlanHistoryEntry = {
    sessionId,
    trigger: params.trigger,
    locationName: displayLocation,
    summary: buildPlanHistorySummary(params.locationName, params.initialQuery),
    initialQuery: params.initialQuery,
    lng: params.lng,
    lat: params.lat,
    conversationTurns: turns,
    createdAt: now,
    updatedAt: now,
  };

  if (options.persistHistory) {
    usePlanHistoryStore.getState().upsert(entry);
    void persistUserAiSessionCreate({
      sessionId,
      trigger: params.trigger,
      locationName: displayLocation,
      lng: params.lng,
      lat: params.lat,
      initialQuery: params.initialQuery,
      conversationTurns: turns,
    }).catch(() => {
      /* 离线时保留本地历史 */
    });
  }

  set({
    resultOpen: true,
    planStreaming: options.planStreaming,
    planStreamStatus: options.planStreaming ? get().planStreamStatus : null,
    planSessionId: sessionId,
    initialQuery: params.initialQuery,
    conversationTurns: turns,
    followUpError: null,
    saveError: null,
    saveSuccess: false,
    resultLocation: displayLocation,
    resultContent: sanitizedContent,
    coords: { lng: params.lng, lat: params.lat },
  });
}

export const useGlobalMapPlanningStore = create<GlobalMapPlanningState>((set, get) => ({
  resultOpen: false,
  planStreaming: false,
  planStreamStatus: null,
  resultLocation: null,
  resultContent: null,
  planSessionId: null,
  initialQuery: null,
  conversationTurns: [],
  coords: { lng: 0, lat: 0 },
  followUpLoading: false,
  followUpError: null,
  saveLoading: false,
  saveError: null,
  saveSuccess: false,

  beginPlanStreamSession: (params) => {
    const sessionId = createPlanSessionId();
    const displayLocation = sanitizeLocationLabelForDisplay(params.locationName);
    set({
      resultOpen: true,
      planStreaming: true,
      planStreamStatus: null,
      planSessionId: sessionId,
      initialQuery: params.initialQuery,
      resultLocation: displayLocation,
      resultContent: '',
      conversationTurns: [
        { id: createPlanMessageId(), role: 'user', content: params.initialQuery },
        { id: createPlanMessageId(), role: 'assistant', content: '' },
      ],
      coords: { lng: params.lng, lat: params.lat },
      followUpError: null,
      saveError: null,
      saveSuccess: false,
    });
  },

  appendPlanStreamDelta: (text) => {
    if (!text) {
      return;
    }
    set((state) => {
      if (!state.resultOpen) {
        return state;
      }
      const nextContent = (state.resultContent ?? '') + text;
      const turns = state.conversationTurns.map((turn, index, all) =>
        index === all.length - 1 && turn.role === 'assistant'
          ? { ...turn, content: nextContent }
          : turn,
      );
      return {
        planStreaming: true,
        resultContent: nextContent,
        conversationTurns: turns,
      };
    });
  },

  setPlanStreamStatus: (message) => set({ planStreamStatus: message }),

  replacePlanStreamContent: (content) => {
    set((state) => {
      if (!state.resultOpen) {
        return state;
      }
      const turns = state.conversationTurns.map((turn, index, all) =>
        index === all.length - 1 && turn.role === 'assistant'
          ? { ...turn, content }
          : turn,
      );
      return {
        resultContent: content,
        conversationTurns: turns,
      };
    });
  },

  openPlanResult: (params) => {
    commitPlanResult(set, get, params, { planStreaming: false, persistHistory: true });
  },

  finishPlanStream: (params) => {
    const sessionId = get().planSessionId ?? createPlanSessionId();
    commitPlanResult(set, get, params, {
      planStreaming: false,
      persistHistory: true,
      sessionId,
    });
  },

  restoreFromHistory: (entry) => {
    set({
      resultOpen: true,
      planStreaming: false,
      planSessionId: entry.sessionId,
      initialQuery: entry.initialQuery,
      conversationTurns: entry.conversationTurns,
      resultLocation: entry.locationName,
      resultContent: lastAssistantContent(entry.conversationTurns),
      coords: { lng: entry.lng, lat: entry.lat },
      followUpError: null,
      saveError: null,
      saveSuccess: false,
    });
  },

  closeResult: () => {
    set({
      resultOpen: false,
      planStreaming: false,
      planStreamStatus: null,
      planSessionId: null,
      conversationTurns: [],
      followUpError: null,
      saveError: null,
      saveSuccess: false,
    });
  },

  resetLivePlanSession: () => {
    set({
      resultOpen: false,
      planStreaming: false,
      planStreamStatus: null,
      resultLocation: null,
      resultContent: null,
      planSessionId: null,
      initialQuery: null,
      conversationTurns: [],
      followUpLoading: false,
      followUpError: null,
      saveLoading: false,
      saveError: null,
      saveSuccess: false,
    });
  },

  setConversationTurns: (turns) => {
    set((state) => ({
      conversationTurns: typeof turns === 'function' ? turns(state.conversationTurns) : turns,
    }));
  },

  setResultContent: (content) => set({ resultContent: content }),

  setFollowUpLoading: (value) => set({ followUpLoading: value }),

  setFollowUpError: (value) => set({ followUpError: value }),

  beginFollowUpStream: () => {
    set({
      planStreaming: true,
      planStreamStatus: '正在根据追问调整方案…',
      resultContent: '',
    });
    set((state) => ({
      conversationTurns: [
        ...state.conversationTurns,
        { id: createPlanMessageId(), role: 'assistant', content: '' },
      ],
    }));
  },

  finishFollowUpStream: (content) => {
    const sanitized = scrubPlanDisplayMarkup(sanitizePlanContentForDisplay(content));
    set((state) => {
      const turns = state.conversationTurns.map((turn, index, all) =>
        index === all.length - 1 && turn.role === 'assistant'
          ? { ...turn, content: sanitized }
          : turn,
      );
      return {
        planStreaming: false,
        planStreamStatus: null,
        resultContent: sanitized,
        conversationTurns: turns,
      };
    });
  },

  setSaveLoading: (value) => set({ saveLoading: value }),

  setSaveError: (value) => set({ saveError: value }),

  setSaveSuccess: (value) => set({ saveSuccess: value }),

  syncHistorySnapshot: () => {
    const state = get();
    if (!state.planSessionId) {
      return;
    }
    const existing = usePlanHistoryStore
      .getState()
      .entries.find((entry) => entry.sessionId === state.planSessionId);
    const entry = buildHistoryEntryFromState(
      state,
      existing?.trigger ?? 'map_click',
      existing?.createdAt,
    );
    if (entry) {
      usePlanHistoryStore.getState().upsert(entry);
      invalidatePlanHistoryQueries();
    }
    void persistUserAiSessionHistory({
      sessionId: state.planSessionId,
      conversationTurns: state.conversationTurns,
      initialQuery: state.initialQuery ?? undefined,
      locationName: state.resultLocation ?? undefined,
      lng: state.coords.lng,
      lat: state.coords.lat,
    }).catch(() => {
      /* 离线时仅保留本地快照 */
    });
  },
}));
