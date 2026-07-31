import { useCallback, useRef } from 'react';
import {
  createAdvisorSessionId,
  syncAdvisorSessionCreate,
  syncAdvisorSessionUpdate,
} from '@/lib/ai/advisorSessionSync';
import type { AiChatContext, AiChatMessage } from '@/types/domain/aiChat';

type UseAdvisorSessionOptions = {
  context?: AiChatContext;
  /** 外部注入的已有 sessionId（恢复会话时） */
  initialSessionId?: string;
};

/**
 * 顾问会话：创建/更新 user_ai_sessions，与规划历史打通。
 */
export function useAdvisorSession({ context, initialSessionId }: UseAdvisorSessionOptions = {}) {
  const sessionIdRef = useRef<string | null>(initialSessionId ?? context?.sessionId ?? null);
  const initialQueryRef = useRef<string | null>(null);
  const createdRef = useRef(Boolean(initialSessionId ?? context?.sessionId));

  const ensureSessionId = useCallback((): string => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = createAdvisorSessionId();
    }
    return sessionIdRef.current;
  }, []);

  const syncAfterTurn = useCallback(
    async (messages: AiChatMessage[]) => {
      const userMessages = messages.filter(
        (message) => message.role === 'user' && message.content.trim(),
      );
      if (userMessages.length === 0) {
        return;
      }

      const firstUserText = userMessages[0]!.content.trim();
      if (!initialQueryRef.current) {
        initialQueryRef.current = firstUserText;
      }

      const sessionId = ensureSessionId();

      try {
        if (!createdRef.current) {
          await syncAdvisorSessionCreate(
            sessionId,
            initialQueryRef.current,
            messages,
            context,
          );
          createdRef.current = true;
        } else {
          await syncAdvisorSessionUpdate(
            sessionId,
            initialQueryRef.current,
            messages,
            context,
          );
        }
      } catch {
        /* 离线或演示模式：本地 store 已在 sync 内更新，服务端失败不阻断聊天 */
      }
    },
    [context, ensureSessionId],
  );

  const resetSession = useCallback(() => {
    sessionIdRef.current = null;
    initialQueryRef.current = null;
    createdRef.current = false;
  }, []);

  const adoptSession = useCallback((sessionId: string, initialQuery: string) => {
    sessionIdRef.current = sessionId;
    initialQueryRef.current = initialQuery;
    createdRef.current = true;
  }, []);

  const getSessionId = useCallback((): string => ensureSessionId(), [ensureSessionId]);

  return {
    sessionId: sessionIdRef.current,
    getSessionId,
    syncAfterTurn,
    resetSession,
    adoptSession,
  };
}
