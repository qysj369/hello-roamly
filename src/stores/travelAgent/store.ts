import { create } from 'zustand';
import { runTravelAgentTurn } from '@/lib/agent/runTravelAgentTurn';
import { executeTravelAgentTool, type TravelAgentToolName } from '@/lib/agent/travelAgentTools';
import type { MatchingPlanHint } from '@/lib/agent/recommendMatchingPlans';
import {
  createTravelAgentSessionId,
  popDistinctPlanSnapshot,
  pushPlanSnapshot,
  readTravelAgentSession,
  searchPlansLookEqual,
  writeTravelAgentSession,
  type PlanSnapshot,
  type TravelAgentMessage,
} from '@/lib/agent/travelAgentSession';
import { searchPlanHeaderLine } from '@/lib/home/searchPlanShareCopy';
import { buildAgentWelcome } from '@/lib/agent/travelAgentCopy';
import {
  readTravelPreferenceMemory,
  resetTravelPreferenceMemory,
  type SessionPreferenceOverride,
} from '@/lib/agent/travelPreferenceMemory';
import type { SearchExtractParams } from '@/lib/home/extractSearchParams';
import { isSnailFlightPageActive, matchSnailFlightButler } from '@/lib/snail-flight/butlerCommands';
import { useSnailFlightCaptionStore } from '@/lib/snail-flight/captionPackStore';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type { TravelAgentMessage };

type TravelAgentState = {
  open: boolean;
  busy: boolean;
  messages: TravelAgentMessage[];
  plan: SearchStructuredPlan | null;
  revision: number;
  pendingExtract: SearchExtractParams | null;
  recommended: MatchingPlanHint[];
  sessionId: string;
  snapshots: PlanSnapshot[];
  override: SessionPreferenceOverride | null;
  posterOpen: boolean;
  shareOpen: boolean;
  remixTitle: string | null;
  openChat: () => void;
  closeChat: () => void;
  adoptPlan: (plan: SearchStructuredPlan | null) => void;
  startRemix: (plan: SearchStructuredPlan, title: string) => void;
  send: (text: string) => Promise<void>;
  noteLocal: (userText: string, assistantText: string) => void;
  runTool: (tool: TravelAgentToolName) => Promise<void>;
  rollback: () => void;
  resetPreference: () => void;
  closePoster: () => void;
  closeShare: () => void;
};

function uid(): string {
  return `agent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const cached = typeof window !== 'undefined' ? readTravelAgentSession() : null;

const WELCOME = buildAgentWelcome(
  typeof window !== 'undefined' ? readTravelPreferenceMemory() : undefined,
  cached?.plan ?? null,
);

function persist(state: Pick<TravelAgentState, 'sessionId' | 'messages' | 'plan' | 'snapshots'>): void {
  writeTravelAgentSession({
    sessionId: state.sessionId,
    messages: state.messages,
    plan: state.plan,
    snapshots: state.snapshots,
    updatedAt: Date.now(),
  });
}

export const useTravelAgentStore = create<TravelAgentState>((set, get) => ({
  open: false,
  busy: false,
  messages: cached?.messages?.length ? cached.messages : [{ id: 'welcome', role: 'assistant', text: WELCOME }],
  plan: cached?.plan ?? null,
  revision: 0,
  pendingExtract: null,
  recommended: [],
  sessionId: cached?.sessionId || createTravelAgentSessionId(),
  snapshots: cached?.snapshots ?? [],
  override: null,
  posterOpen: false,
  shareOpen: false,
  remixTitle: null,

  openChat: () =>
    set((state) => {
      const welcome = buildAgentWelcome(readTravelPreferenceMemory(), state.plan);
      const messages =
        state.messages[0]?.id === 'welcome'
          ? [{ ...state.messages[0], text: welcome }, ...state.messages.slice(1)]
          : state.messages;
      return { open: true, messages };
    }),
  closeChat: () =>
    set((state) => {
      const spiralPage =
        typeof document !== 'undefined' &&
        document.documentElement.classList.contains('spiral-home-active');
      const messages =
        spiralPage && state.messages.length > 40 ? state.messages.slice(-40) : state.messages;
      if (messages !== state.messages) persist({ ...state, messages });
      return { open: false, posterOpen: false, shareOpen: false, messages };
    }),
  noteLocal: (userText, assistantText) =>
    set((state) => {
      const user = userText.trim();
      const assistant = assistantText.trim();
      if (!user || !assistant) return state;
      const next = {
        ...state,
        open: true,
        messages: [
          ...state.messages,
          { id: uid(), role: 'user' as const, text: user },
          { id: uid(), role: 'assistant' as const, text: assistant },
        ],
      };
      persist(next);
      return next;
    }),
  closePoster: () => set({ posterOpen: false }),
  closeShare: () => set({ shareOpen: false }),

  adoptPlan: (plan) =>
    set((state) => {
      if (plan === state.plan) return state;
      if (plan && state.plan && searchPlansLookEqual(plan, state.plan)) {
        const next = { ...state, plan };
        persist(next);
        return next;
      }
      // 首页完整新生成不入 undo 栈，避免旧会话的「上一版行程」盖住真正改过的版本
      const next = { ...state, plan, snapshots: [], revision: state.revision + 1 };
      persist(next);
      return next;
    }),

  startRemix: (plan, title) =>
    set((state) => {
      const next = {
        ...state,
        open: true,
        plan,
        revision: state.revision + 1,
        remixTitle: title,
        recommended: [] as MatchingPlanHint[],
        snapshots: pushPlanSnapshot(state.snapshots, state.plan, title),
        messages: [
          ...state.messages,
          {
            id: uid(),
            role: 'assistant' as const,
            text: `已接过《${title}》。说「改成亲子」「下雨怎么走」「人多怎么走」或「发给朋友」，我替你做完。`,
          },
        ],
      };
      persist(next);
      return next;
    }),

  send: async (text) => {
    const trimmed = text.trim();
    if (!trimmed || get().busy) return;
    if (isSnailFlightPageActive()) {
      const hit = matchSnailFlightButler(trimmed, useSnailFlightCaptionStore.getState().progress);
      if (hit) {
        if (hit.packId) {
          useSnailFlightCaptionStore.getState().setPack(hit.packId);
        }
        set((state) => {
          const next = {
            ...state,
            open: true,
            busy: false,
            messages: [
              ...state.messages,
              { id: uid(), role: 'user' as const, text: trimmed },
              { id: uid(), role: 'assistant' as const, text: hit.message },
            ],
          };
          persist(next);
          return next;
        });
        return;
      }
    }
    set((state) => ({
      open: true,
      busy: true,
      messages: [...state.messages, { id: uid(), role: 'user', text: trimmed }],
    }));

    try {
      const result = await runTravelAgentTurn({
        text: trimmed,
        plan: get().plan,
        pendingExtract: get().pendingExtract,
        override: get().override,
      });

      if (result.kind === 'rollback') {
        get().rollback();
        return;
      }

      if (result.kind === 'reset_preference') {
        get().resetPreference();
        set((state) => {
          const next = {
            ...state,
            busy: false,
            messages: [...state.messages, { id: uid(), role: 'assistant' as const, text: result.message }],
          };
          persist(next);
          return next;
        });
        return;
      }

      if (result.kind === 'need_fields') {
        set((state) => {
          const next = {
            ...state,
            busy: false,
            pendingExtract: result.params,
            messages: [...state.messages, { id: uid(), role: 'assistant' as const, text: result.message }],
          };
          persist(next);
          return next;
        });
        return;
      }

      if (result.kind === 'error' || result.kind === 'ask') {
        set((state) => {
          const next = {
            ...state,
            busy: false,
            pendingExtract: result.kind === 'ask' ? null : state.pendingExtract,
            messages: [...state.messages, { id: uid(), role: 'assistant' as const, text: result.message }],
          };
          persist(next);
          return next;
        });
        return;
      }

      if (result.kind === 'tool') {
        await get().runTool(result.tool);
        return;
      }

      set((state) => {
        const unchanged = Boolean(state.plan && searchPlansLookEqual(state.plan, result.plan));
        const next = {
          ...state,
          busy: false,
          pendingExtract: null,
          plan: result.plan,
          revision: unchanged ? state.revision : state.revision + 1,
          recommended: result.recommended,
          override: result.skipLongTerm
            ? { ...state.override, peopleType: result.plan.baseInfo.peopleType }
            : state.override,
          snapshots: unchanged
            ? state.snapshots
            : pushPlanSnapshot(
                state.snapshots,
                state.plan,
                state.plan ? searchPlanHeaderLine(state.plan) : trimmed,
              ),
          messages: [...state.messages, { id: uid(), role: 'assistant' as const, text: result.message }],
        };
        persist(next);
        return next;
      });
    } catch {
      set((state) => ({
        busy: false,
        messages: [
          ...state.messages,
          {
            id: uid(),
            role: 'assistant',
            text:
              typeof document !== 'undefined' &&
              document.documentElement.classList.contains('spiral-home-active')
                ? '这一程没连上，请稍后再试一句；也可以先说目的地和天数。'
                : '这一轮没处理完，请再试一句。',
          },
        ],
      }));
    }
  },

  rollback: () =>
    set((state) => {
      const popped = popDistinctPlanSnapshot(state.snapshots, state.plan);
      if (!popped) {
        return {
          ...state,
          busy: false,
          open: true,
          messages: [...state.messages, { id: uid(), role: 'assistant', text: '没有上一版可回退。' }],
        };
      }
      const next = {
        ...state,
        busy: false,
        open: true,
        plan: popped.plan,
        snapshots: popped.snapshots,
        revision: state.revision + 1,
        messages: [
          ...state.messages,
          {
            id: uid(),
            role: 'assistant' as const,
            text: `已回退到：${searchPlanHeaderLine(popped.plan)}。`,
          },
        ],
      };
      persist(next);
      return next;
    }),

  resetPreference: () => {
    resetTravelPreferenceMemory();
    set({ override: null });
  },

  runTool: async (tool) => {
    const { plan, sessionId } = get();
    if (!plan) {
      set((state) => ({
        busy: false,
        messages: [...state.messages, { id: uid(), role: 'assistant', text: '还没有行程，先生成一份再操作。' }],
      }));
      return;
    }
    set({ busy: true, open: true });
    try {
      const result = await executeTravelAgentTool(tool, plan, sessionId);
      set((state) => {
        const prev = state.plan;
        const changed = Boolean(result.plan && prev && !searchPlansLookEqual(prev, result.plan));
        const next = {
          ...state,
          busy: false,
          sessionId: result.sessionId ?? state.sessionId,
          posterOpen: result.openPoster ? true : state.posterOpen,
          shareOpen: result.openShare ? true : state.shareOpen,
          plan: result.plan ?? state.plan,
          revision: changed ? state.revision + 1 : state.revision,
          snapshots:
            result.plan && prev && !searchPlansLookEqual(prev, result.plan)
              ? pushPlanSnapshot(state.snapshots, prev, searchPlanHeaderLine(prev))
              : state.snapshots,
          messages: [...state.messages, { id: uid(), role: 'assistant' as const, text: result.message }],
        };
        persist(next);
        return next;
      });
    } catch {
      set((state) => ({
        busy: false,
        messages: [...state.messages, { id: uid(), role: 'assistant', text: '站内操作没完成，请稍后再试。' }],
      }));
    }
  },
}));
