import { useCallback, useEffect, useRef } from 'react';
import type { AiChatMessage } from '@/types/domain/aiChat';

/** 对话区滚动、消息锚点与选中态（与展示组件解耦） */
export function useAiChatScrollSync(messages: AiChatMessage[], isLoading: boolean) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const registerMessageRef = useCallback((id: string, node: HTMLDivElement | null) => {
    if (node) {
      messageRefs.current.set(id, node);
    } else {
      messageRefs.current.delete(id);
    }
  }, []);

  const scrollToMessage = useCallback((messageId: string, reduceMotion: boolean) => {
    const node = messageRefs.current.get(messageId);
    const container = scrollRef.current;
    if (!node || !container) {
      return;
    }
    const top = node.offsetTop - container.offsetTop - 8;
    container.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
  }, []);

  const selectedMessageId = messages.at(-1)?.id ?? null;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  return {
    scrollRef,
    selectedMessageId,
    registerMessageRef,
    scrollToMessage,
  };
}
