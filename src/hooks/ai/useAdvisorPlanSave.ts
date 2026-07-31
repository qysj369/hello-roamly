import { useCallback, useState } from 'react';
import { chatMessagesToTurns } from '@/lib/ai/advisorSessionSync';
import { persistUserAiSessionSave } from '@/lib/plan/persistUserAiSession';
import { queryClient } from '@/lib/query/client';
import type { AiChatContext, AiChatMessage } from '@/types/domain/aiChat';
import { toErrorMessage } from '@/utils/toErrorMessage';

type UseAdvisorPlanSaveOptions = {
  messages: AiChatMessage[];
  context?: AiChatContext;
  getSessionId: () => string;
  ensureSessionPersisted: () => Promise<void>;
  defaultTitle: string;
};

export function useAdvisorPlanSave({
  messages,
  context,
  getSessionId,
  ensureSessionPersisted,
  defaultTitle,
}: UseAdvisorPlanSaveOptions) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const openSaveDialog = useCallback(() => {
    setSaveError(null);
    setSaveSuccess(false);
    setSaveOpen(true);
  }, []);

  const closeSaveDialog = useCallback(() => {
    if (!saveLoading) {
      setSaveOpen(false);
    }
  }, [saveLoading]);

  const savePlan = useCallback(
    async (title: string, isPublic: boolean) => {
      setSaveLoading(true);
      setSaveError(null);
      setSaveSuccess(false);

      try {
        await ensureSessionPersisted();
        const sessionId = getSessionId();
        const turns = chatMessagesToTurns(messages);
        const locationName =
          context?.destination?.trim() ||
          context?.origin?.name?.trim() ||
          context?.location?.name?.trim() ||
          'AI 顾问';
        const lng = context?.location?.lng ?? context?.origin?.lng ?? 0;
        const lat = context?.location?.lat ?? context?.origin?.lat ?? 0;
        const initialQuery =
          messages.find((message) => message.role === 'user')?.content.trim() || title.trim();

        await persistUserAiSessionSave(sessionId, {
          title: title.trim(),
          isPublic,
          conversationTurns: turns,
          locationName,
          lng,
          lat,
          initialQuery,
        });

        setSaveSuccess(true);
        setSaveOpen(false);
        void queryClient.invalidateQueries({ queryKey: ['user-plans'] });
        void queryClient.invalidateQueries({ queryKey: ['user-ai-sessions'] });
      } catch (err) {
        setSaveError(toErrorMessage(err, '保存失败，请稍后再试'));
        throw err;
      } finally {
        setSaveLoading(false);
      }
    },
    [context, ensureSessionPersisted, getSessionId, messages],
  );

  return {
    saveOpen,
    saveLoading,
    saveError,
    saveSuccess,
    defaultTitle,
    openSaveDialog,
    closeSaveDialog,
    savePlan,
    clearSaveError: () => setSaveError(null),
  };
}
