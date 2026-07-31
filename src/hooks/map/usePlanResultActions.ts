import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  createPlanMessageId,
  toPlanChatHistory,
  type PlanConversationTurn,
} from '@/lib/plan/planConversation';
import {
  finalizeMapPlanContent,
  isMapPlanDeliverable,
} from '@/lib/plan/mapPlanCompleteness';
import { persistUserAiSessionSave } from '@/lib/plan/persistUserAiSession';
import { streamContinuePlanChat } from '@/services/ai/api/streamContinuePlanChat';
import { requestPlanCancel } from '@/stores/globalMapPlanning/planCancelBridge';
import { useGlobalMapPlanningStore } from '@/stores/globalMapPlanning/store';
import { toErrorMessage } from '@/utils/toErrorMessage';

/** 全局方案结果页：追问、保存、关闭 */
export function usePlanResultActions() {
  const queryClient = useQueryClient();

  const closeResult = useCallback(() => {
    const state = useGlobalMapPlanningStore.getState();
    if (state.planStreaming) {
      // 优先走首页规划 hook 的停止（会 abort + closeResult）
      if (requestPlanCancel()) {
        return;
      }
    }
    state.closeResult();
  }, []);

  const sendFollowUp = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      const {
        planSessionId,
        resultLocation,
        conversationTurns,
        coords,
        followUpLoading,
        setConversationTurns,
        setFollowUpLoading,
        setFollowUpError,
        beginFollowUpStream,
        appendPlanStreamDelta,
        finishFollowUpStream,
        syncHistorySnapshot,
      } = useGlobalMapPlanningStore.getState();

      if (!trimmed || !planSessionId || !resultLocation || followUpLoading) {
        return;
      }

      const historyBefore = conversationTurns;
      const userTurn: PlanConversationTurn = {
        id: createPlanMessageId(),
        role: 'user',
        content: trimmed,
      };

      setFollowUpLoading(true);
      setFollowUpError(null);
      setConversationTurns((current) => [...current, userTurn]);
      beginFollowUpStream();

      try {
        const result = await streamContinuePlanChat({
          params: {
            planId: planSessionId,
            message: trimmed,
            fullHistory: toPlanChatHistory(historyBefore),
            locationName: resultLocation,
            lng: coords.lng,
            lat: coords.lat,
          },
          onDelta: (text) => {
            appendPlanStreamDelta(text);
          },
        });

        finishFollowUpStream(result.reply);
        syncHistorySnapshot();
      } catch (err) {
        setFollowUpError(toErrorMessage(err, '追问失败，请稍后再试'));
        const restoredContent = lastAssistantFromTurns(historyBefore);
        setConversationTurns(historyBefore);
        useGlobalMapPlanningStore.setState({
          planStreaming: false,
          planStreamStatus: null,
          resultContent: restoredContent,
        });
      } finally {
        setFollowUpLoading(false);
      }
    },
    [],
  );

  const savePlan = useCallback(
    async (title: string, isPublic: boolean) => {
      const state = useGlobalMapPlanningStore.getState();
      if (!state.planSessionId || !state.resultLocation) {
        throw new Error('暂无方案可保存');
      }

      const rawContent =
        state.resultContent?.trim() || lastAssistantFromTurns(state.conversationTurns) || '';
      if (!isMapPlanDeliverable(rawContent)) {
        throw new Error('行程还在生成，稍后再保存');
      }

      // 流式中途保存：本地补齐蜗牛/避坑，保证落库内容完整可读
      const finalized = finalizeMapPlanContent(
        rawContent,
        state.resultLocation,
        null,
        state.initialQuery,
      );
      const conversationTurns = withFinalAssistantContent(state.conversationTurns, finalized);

      state.setSaveLoading(true);
      state.setSaveError(null);
      state.setSaveSuccess(false);

      try {
        useGlobalMapPlanningStore.setState({
          resultContent: finalized,
          conversationTurns,
        });
        await persistUserAiSessionSave(state.planSessionId, {
          title: title.trim(),
          isPublic,
          conversationTurns,
          locationName: state.resultLocation,
          lng: state.coords.lng,
          lat: state.coords.lat,
          initialQuery: state.initialQuery ?? '',
        });
        state.setSaveSuccess(true);
        void queryClient.invalidateQueries({ queryKey: ['user-plans'] });
        void queryClient.invalidateQueries({ queryKey: ['user-ai-sessions'] });
        void queryClient.invalidateQueries({ queryKey: ['discover', 'feed'] });
      } catch (err) {
        const message = toErrorMessage(err, '保存失败，请稍后再试');
        state.setSaveError(message);
        throw err;
      } finally {
        state.setSaveLoading(false);
      }
    },
    [queryClient],
  );

  return {
    sendFollowUp,
    savePlan,
    closeResult,
  };
}

function lastAssistantFromTurns(turns: PlanConversationTurn[]): string | null {
  for (let index = turns.length - 1; index >= 0; index -= 1) {
    const turn = turns[index];
    if (turn?.role === 'assistant') {
      return turn.content;
    }
  }
  return null;
}

function withFinalAssistantContent(
  turns: PlanConversationTurn[],
  content: string,
): PlanConversationTurn[] {
  if (turns.length === 0) {
    return [{ id: createPlanMessageId(), role: 'assistant', content }];
  }
  let replaced = false;
  const next = turns.map((turn, index, all) => {
    if (index === all.length - 1 && turn.role === 'assistant') {
      replaced = true;
      return { ...turn, content };
    }
    return turn;
  });
  if (replaced) {
    return next;
  }
  return [...next, { id: createPlanMessageId(), role: 'assistant', content }];
}
