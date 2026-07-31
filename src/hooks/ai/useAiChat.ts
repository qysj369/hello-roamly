import { useCallback, useId, useRef, useState } from 'react';
import {
  assertContentAllowed,
  ContentModerationRejectedError,
} from '@/lib/moderation';
import { getAiProviderDisplay, type AiProviderDisplay } from '@/lib/config/ai';
import { BRAND_NAME } from '@/lib/config/brandCopy';
import { streamChatReply } from '@/services/ai';
import { AiChatStreamError } from '@/services/ai/api/streamChatFromApi';
import type { AiChatContext, AiChatMessage } from '@/types/domain/aiChat';
import { toErrorMessage } from '@/utils/toErrorMessage';

export const AI_CHAT_WELCOME_MESSAGE_ID = 'welcome-seed';

const SEED_ASSISTANT = `你好，我是 **${BRAND_NAME} 旅行顾问**。在下方输入框直接说目的地、天数和预算即可；也可点底部快捷问题一键提问。`;

function createMessage(
  role: AiChatMessage['role'],
  content: string,
  status: AiChatMessage['status'] = 'complete',
  id?: string,
): AiChatMessage {
  return {
    id: id ?? `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
    status,
  };
}

type UseAiChatOptions = {
  /** 首页/计划页注入的目的地、预算等，会拼进 mock 回复上下文 */
  context?: AiChatContext;
  /** 首条助手气泡 Markdown；默认旅行顾问欢迎语 */
  seedAssistant?: string;
  /** 恢复历史会话时的初始消息列表 */
  initialMessages?: AiChatMessage[];
  /** 每轮对话完成后回调（用于持久化） */
  onConversationUpdate?: (messages: AiChatMessage[]) => void;
};

/**
 * AI 旅行顾问对话：流式增量渲染、中断、重试。
 */
export function useAiChat({
  context,
  seedAssistant,
  initialMessages,
  onConversationUpdate,
}: UseAiChatOptions = {}) {
  const reactId = useId();
  const resolvedSeed = seedAssistant === undefined ? SEED_ASSISTANT : seedAssistant;
  const [messages, setMessages] = useState<AiChatMessage[]>(() => {
    if (initialMessages && initialMessages.length > 0) {
      return initialMessages;
    }
    if (!resolvedSeed.trim()) {
      return [];
    }
    return [createMessage('assistant', resolvedSeed, 'complete', AI_CHAT_WELCOME_MESSAGE_ID)];
  });
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const patchAssistant = useCallback((assistantId: string, patch: Partial<AiChatMessage>) => {
    setMessages((prev) => {
      const next = prev.map((message) =>
        message.id === assistantId ? { ...message, ...patch } : message,
      );
      messagesRef.current = next;
      return next;
    });
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => {
      const next = prev.filter((message) => message.id !== messageId);
      messagesRef.current = next;
      return next;
    });
  }, []);

  const runStream = useCallback(
    async (history: AiChatMessage[], requestId: number, assistantId: string) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      try {
        await streamChatReply({
          messages: history,
          context,
          signal: controller.signal,
          onDelta: (chunk) => {
            if (requestIdRef.current !== requestId) {
              return;
            }
            setMessages((prev) => {
              const next = prev.map((message) =>
                message.id === assistantId
                  ? { ...message, content: message.content + chunk }
                  : message,
              );
              messagesRef.current = next;
              return next;
            });
          },
        });

        if (requestIdRef.current !== requestId) {
          return;
        }

        patchAssistant(assistantId, { status: 'complete' });
        onConversationUpdate?.(messagesRef.current);
      } catch (err) {
        if (requestIdRef.current !== requestId) {
          return;
        }

        if (controller.signal.aborted) {
          const partial = messagesRef.current.find((message) => message.id === assistantId);
          if (!partial?.content.trim()) {
            removeMessage(assistantId);
          } else {
            patchAssistant(assistantId, { status: 'complete' });
          }
          return;
        }

        removeMessage(assistantId);
        if (err instanceof AiChatStreamError) {
          setError(err.message);
        } else {
          setError(toErrorMessage(err, '回复失败，请稍后重试', 'chat'));
        }
      } finally {
        if (requestIdRef.current === requestId) {
          abortRef.current = null;
          setIsStreaming(false);
          setIsLoading(false);
        }
      }
    },
    [context, onConversationUpdate, patchAssistant, removeMessage],
  );

  const sendMessage = useCallback(
    async (rawText: string, options?: { hideUserBubble?: boolean }) => {
      const text = rawText.trim();
      if (!text || isLoading) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await assertContentAllowed({ scene: 'ai_chat', text });
      } catch (err) {
        setIsLoading(false);
        if (err instanceof ContentModerationRejectedError) {
          setError(err.message);
          return;
        }
        setError(toErrorMessage(err, '内容审核失败', 'chat'));
        return;
      }

      const userMessage = createMessage('user', text);
      if (options?.hideUserBubble) {
        userMessage.hidden = true;
      }
      const assistantPlaceholder = createMessage('assistant', '', 'streaming');
      const nextMessages = [...messagesRef.current, userMessage, assistantPlaceholder];
      messagesRef.current = nextMessages;
      setMessages(nextMessages);

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      await runStream(nextMessages, requestId, assistantPlaceholder.id);
    },
    [isLoading, runStream],
  );

  const retryLastMessage = useCallback(async () => {
    if (isLoading) {
      return;
    }

    let currentMessages = messagesRef.current;
    const last = currentMessages[currentMessages.length - 1];
    if (!last) {
      return;
    }

    if (last.role === 'assistant') {
      currentMessages = currentMessages.slice(0, -1);
      messagesRef.current = currentMessages;
      setMessages(currentMessages);
    }

    const lastUser = currentMessages[currentMessages.length - 1];
    if (!lastUser || lastUser.role !== 'user') {
      return;
    }

    setIsLoading(true);
    setError(null);

    const assistantPlaceholder = createMessage('assistant', '', 'streaming');
    const withAssistant = [...currentMessages, assistantPlaceholder];
    messagesRef.current = withAssistant;
    setMessages(withAssistant);

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    await runStream(withAssistant, requestId, assistantPlaceholder.id);
  }, [isLoading, runStream]);

  const abortStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetChat = useCallback(() => {
    abortRef.current?.abort();
    requestIdRef.current += 1;
    const seed = resolvedSeed.trim()
      ? [createMessage('assistant', resolvedSeed, 'complete', AI_CHAT_WELCOME_MESSAGE_ID)]
      : [];
    messagesRef.current = seed;
    setMessages(seed);
    setIsLoading(false);
    setIsStreaming(false);
    setError(null);
  }, [resolvedSeed]);

  const provider: AiProviderDisplay = getAiProviderDisplay();

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    provider,
    sendMessage,
    retryLastMessage,
    abortStream,
    clearError,
    resetChat,
    composerId: `ai-chat-input-${reactId}`,
  };
};
