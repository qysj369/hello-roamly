import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdvisorPlanSave } from '@/hooks/ai/useAdvisorPlanSave';
import { useAdvisorSession } from '@/hooks/ai/useAdvisorSession';
import { useAiChat } from '@/hooks/ai/useAiChat';
import { useAiChatPlanGeneration } from '@/hooks/ai/useAiChatPlanGeneration';
import { useAiChatScrollSync } from '@/hooks/ai/useAiChatScrollSync';
import { useAiTravelParams } from '@/hooks/ai/useAiTravelParams';
import type { AiProviderDisplay } from '@/lib/config/ai';
import {
  friendlyHomeMapPlanError,
  launchHomeMapQiongYouPlan,
  stripHoloPlanHandoffMeta,
} from '@/lib/home/launchHomeMapQiongYouPlan';
import { parseTravelSearchIntent } from '@/lib/map/planQueryBuilder';
import type { AiChatContext, AiChatMessage } from '@/types/domain/aiChat';
import { travelPlanDetailPath } from '@/router/paths';
import {
  formatAdvisorConversationForShare,
  shareAdvisorContent,
} from '@/utils/shareAdvisorConversation';
import { formatTravelPlanItineraryText } from '@/utils/formatTravelPlanItineraryText';

type UseAiChatInterfaceControllerOptions = {
  context?: AiChatContext;
  seedAssistant?: string;
  autoPrompt?: string;
  /** Capsule 注入首条输入时不展示用户气泡 */
  hideAutoPromptBubble?: boolean;
  initialMessages?: AiChatMessage[];
  restoredSessionId?: string;
  restoredInitialQuery?: string;
  paramsOpen?: boolean;
  onParamsOpenChange?: (open: boolean) => void;
};

/** AI 顾问页：状态编排（聊天、参数、行程生成、布局） */
export function useAiChatInterfaceController({
  context,
  seedAssistant,
  autoPrompt,
  hideAutoPromptBubble = false,
  initialMessages,
  restoredSessionId,
  restoredInitialQuery,
  paramsOpen: controlledParamsOpen,
  onParamsOpenChange,
}: UseAiChatInterfaceControllerOptions) {
  const navigate = useNavigate();
  const autoSentRef = useRef(false);
  const [internalParamsOpen, setInternalParamsOpen] = useState(false);
  const paramsOpen = controlledParamsOpen ?? internalParamsOpen;
  const setParamsOpen = onParamsOpenChange ?? setInternalParamsOpen;
  const [homeMapPlanError, setHomeMapPlanError] = useState<string | null>(null);

  const advisorSession = useAdvisorSession({
    context,
    initialSessionId: restoredSessionId ?? context?.sessionId,
  });

  useEffect(() => {
    if (restoredSessionId && restoredInitialQuery) {
      advisorSession.adoptSession(restoredSessionId, restoredInitialQuery);
    }
  }, [advisorSession, restoredInitialQuery, restoredSessionId]);

  const travelParamsState = useAiTravelParams({ initialContext: context });
  const chat = useAiChat({
    context: travelParamsState.chatContext,
    seedAssistant,
    initialMessages,
    onConversationUpdate: (messages) => {
      void advisorSession.syncAfterTurn(messages);
    },
  });
  const scroll = useAiChatScrollSync(chat.messages, chat.isLoading);
  const plan = useAiChatPlanGeneration({
    messages: chat.messages,
    travelParams: travelParamsState.params,
    chatContext: travelParamsState.chatContext,
  });

  const isBusy = chat.isLoading || plan.isGenerating;
  const aiBlocked = chat.provider === 'unconfigured';
  const [shareFeedback, setShareFeedback] = useState<'idle' | 'success' | 'error'>('idle');
  const [shareFallbackOpen, setShareFallbackOpen] = useState(false);
  const [shareFallbackText, setShareFallbackText] = useState('');

  const saveDefaultTitle = useMemo(
    () => plan.lastPlan?.title?.trim() || travelParamsState.chatContext.destination?.trim() || '我的漫行方案',
    [plan.lastPlan?.title, travelParamsState.chatContext.destination],
  );

  const ensureSessionPersisted = useCallback(async () => {
    await advisorSession.syncAfterTurn(chat.messages);
  }, [advisorSession, chat.messages]);

  const planSave = useAdvisorPlanSave({
    messages: chat.messages,
    context: travelParamsState.chatContext,
    getSessionId: advisorSession.getSessionId,
    ensureSessionPersisted,
    defaultTitle: saveDefaultTitle,
  });

  const runHomeMapQiongYouPlan = useCallback(
    async (prompt: string) => {
      setHomeMapPlanError(null);
      plan.clearError();
      const fullPrompt = prompt.trim();
      const cleanPrompt = stripHoloPlanHandoffMeta(fullPrompt) || fullPrompt;
      const destinationHint =
        context?.destination?.trim() ||
        parseTravelSearchIntent(cleanPrompt).destinationHint ||
        null;
      /** 须保留 handoff 内【用户已确认】等段，供 clarify lock / 漂移防护解析 */
      const result = await launchHomeMapQiongYouPlan({
        query: fullPrompt,
        originName: context?.origin?.name,
        destinationHint,
      });
      if (!result.ok) {
        setHomeMapPlanError(result.error);
        return false;
      }
      return true;
    },
    [context?.destination, context?.origin?.name, plan],
  );

  useEffect(() => {
    const prompt = autoPrompt?.trim();
    if (!prompt || autoSentRef.current) {
      return undefined;
    }

    /** 首页搜索 / 城市·灵感 CTA：旧版地图穷游四区块（非顾问行程卡片） */
    const fromHomePlanHandoff =
      context?.source === 'home_map' &&
      Boolean(context.destination?.trim() || context.dream?.trim());

    // 勿在排定时就把 autoSent 置 true：依赖项抖动会清掉定时器，导致永远不生成
    const timer = window.setTimeout(() => {
      if (autoSentRef.current) return;
      autoSentRef.current = true;
      if (fromHomePlanHandoff) {
        void runHomeMapQiongYouPlan(prompt).catch((error) => {
          setHomeMapPlanError(friendlyHomeMapPlanError(error));
        });
        return;
      }
      chat
        .sendMessage(prompt, hideAutoPromptBubble ? { hideUserBubble: true } : undefined)
        .catch(() => undefined);
    }, 280);
    return () => {
      window.clearTimeout(timer);
    };
  }, [
    autoPrompt,
    chat.sendMessage,
    context?.destination,
    context?.dream,
    context?.source,
    hideAutoPromptBubble,
    runHomeMapQiongYouPlan,
  ]);

  const handleReset = useCallback(() => {
    chat.resetChat();
    travelParamsState.resetParams();
    setHomeMapPlanError(null);
    plan.clearError();
    advisorSession.resetSession();
  }, [advisorSession, chat, plan, travelParamsState]);

  const handleGeneratePlan = useCallback(() => {
    const prompt =
      autoPrompt?.trim() ||
      context?.dream?.trim() ||
      context?.destination?.trim() ||
      '';
    if (context?.source === 'home_map' && prompt) {
      void runHomeMapQiongYouPlan(prompt).catch((error) => {
        setHomeMapPlanError(friendlyHomeMapPlanError(error));
      });
      return;
    }
    if (!prompt) {
      setHomeMapPlanError('请先输入目的地与出行信息，再生成漫行攻略');
      return;
    }
    plan.generateFromContext().catch(() => undefined);
  }, [autoPrompt, context?.destination, context?.dream, context?.source, plan, runHomeMapQiongYouPlan]);

  const confirmPlanDialog = useCallback(() => {
    if (plan.lastPlan) {
      navigate(travelPlanDetailPath(plan.lastPlan.id));
    }
    plan.closeDialog();
  }, [navigate, plan]);

  const handleViewMap = useCallback(async () => {
    if (plan.lastPlan) {
      navigate(travelPlanDetailPath(plan.lastPlan.id));
      return;
    }
    const generated = await plan.generateFromContext({ openDialog: false });
    if (generated) {
      navigate(travelPlanDetailPath(generated.id));
    }
  }, [navigate, plan]);

  const handleSharePlan = useCallback(() => {
    const text = plan.lastPlan
      ? formatTravelPlanItineraryText(plan.lastPlan)
      : formatAdvisorConversationForShare(chat.messages).trim();

    if (!text) {
      setShareFeedback('error');
      window.setTimeout(() => setShareFeedback('idle'), 5000);
      return;
    }

    void shareAdvisorContent(chat.messages, plan.lastPlan).then((result) => {
      if (result === 'copied' || result === 'shared') {
        setShareFeedback('success');
        setShareFallbackOpen(false);
        window.setTimeout(() => setShareFeedback('idle'), 5000);
        return;
      }
      if (result === 'cancelled') {
        return;
      }
      setShareFeedback('error');
      setShareFallbackText(text);
      setShareFallbackOpen(true);
    });
  }, [chat.messages, plan.lastPlan]);

  const hasUserTurn = chat.messages.some((message) => message.role === 'user');

  const actionAvailability = useMemo(
    () => ({
      canSave: hasUserTurn,
      canShare: true,
      hasPlan: Boolean(plan.lastPlan),
      // 查看地图仅在已生成行程后展示，避免与「生成行程」重复
      canViewMap: Boolean(plan.lastPlan),
    }),
    [hasUserTurn, plan.lastPlan],
  );

  const planForUi = useMemo(
    () => ({
      ...plan,
      error: homeMapPlanError ?? plan.error,
      clearError: () => {
        setHomeMapPlanError(null);
        plan.clearError();
      },
      retry: async () => {
        if (context?.source === 'home_map') {
          const prompt =
            autoPrompt?.trim() ||
            context.destination?.trim() ||
            context.dream?.trim() ||
            '';
          if (!prompt) {
            setHomeMapPlanError('请先输入目的地与出行信息，再生成漫行攻略');
            return null;
          }
          const ok = await runHomeMapQiongYouPlan(prompt);
          return ok ? true : null;
        }
        return plan.retry();
      },
    }),
    [autoPrompt, context?.destination, context?.dream, context?.source, homeMapPlanError, plan, runHomeMapQiongYouPlan],
  );

  return {
    context,
    paramsOpen,
    setParamsOpen,
    travelParams: travelParamsState,
    chat,
    scroll,
    plan: planForUi,
    isBusy,
    aiBlocked,
    handleReset,
    handleGeneratePlan,
    handleViewMap,
    handleSharePlan,
    shareFeedback,
    shareFallbackOpen,
    shareFallbackText,
    setShareFallbackOpen,
    actionAvailability,
    planSave,
    confirmPlanDialog,
    provider: chat.provider as AiProviderDisplay,
  };
}
