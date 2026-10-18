import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { RefObject } from 'react';
import AiChatMessageBubble from '@/components/features/ai/AiChatMessage';
import { AI_CHAT_WELCOME_MESSAGE_ID } from '@/hooks/ai/useAiChat';
import type { AiChatMessage as AiChatMessageModel } from '@/types/domain/aiChat';
import { cn } from '@/utils/cn';

type MessageActionProps = {
  canGenerate: boolean;
  canViewMap: boolean;
  canSave: boolean;
  canShare: boolean;
  isBusy: boolean;
  isGeneratingPlan: boolean;
  hasPlan: boolean;
  shareFeedback?: 'idle' | 'success' | 'error';
  onGeneratePlan: () => void;
  onViewMap: () => void;
  onSavePlan: () => void;
  onSharePlan: () => void;
};

type AIChatMessageStreamProps = {
  variant?: 'default' | 'capsule';
  scrollRef: RefObject<HTMLDivElement>;
  messages: AiChatMessageModel[];
  isLoading: boolean;
  isStreaming?: boolean;
  isSessionRestoring?: boolean;
  selectedMessageId: string | null;
  registerMessageRef: (id: string, node: HTMLDivElement | null) => void;
  onUseExamplePrompt?: (text: string) => void;
  messageActionProps?: MessageActionProps;
};

export default function AIChatMessageStream({
  variant = 'default',
  scrollRef,
  messages,
  isLoading,
  isStreaming = false,
  isSessionRestoring = false,
  selectedMessageId,
  registerMessageRef,
  onUseExamplePrompt,
  messageActionProps,
}: AIChatMessageStreamProps) {
  const reduceMotion = useReducedMotion();
  const lastMessage = messages.at(-1);
  const lastActionableAssistantId = [...messages]
    .reverse()
    .find(
      (message) =>
        message.role === 'assistant' &&
        message.id !== AI_CHAT_WELCOME_MESSAGE_ID &&
        message.status !== 'streaming' &&
        message.content.trim(),
    )?.id;
  const showThinkingDots =
    isLoading && !isStreaming && !(lastMessage?.status === 'streaming' && lastMessage.content);

  const showEmptyHint = messages.length === 0 && !isLoading && !isSessionRestoring;

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4 [-webkit-overflow-scrolling:touch]"
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {isSessionRestoring ? (
        <div
          className={cn(
            'flex min-h-[12rem] flex-col items-center justify-center gap-3 px-4 py-8 text-center',
            variant === 'capsule' && 'capsule-ai-empty',
          )}
          role="status"
          aria-label="正在恢复会话"
        >
          <span className="flex gap-1" aria-hidden>
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:120ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:240ms]" />
          </span>
          <p className="text-sm text-slate-500">正在恢复会话…</p>
        </div>
      ) : null}

      {showEmptyHint ? (
        <div
          className={cn(
            'flex min-h-[12rem] flex-col items-center justify-center px-4 py-8 text-center',
            variant === 'capsule' && 'capsule-ai-empty',
          )}
        >
          {variant === 'capsule' ? (
            <>
              <p className="capsule-ai-empty__glyph" aria-hidden>
                ◉
              </p>
              <p className="mt-3 text-sm font-medium text-slate-800">Capsule 链路已建立</p>
              <p className="mt-1 text-xs text-slate-500">注入时间、心情、预算，我来构建路线</p>
            </>
          ) : (
            <>
              <p className="text-2xl" aria-hidden>
                🐌
              </p>
              <p className="mt-3 text-sm font-medium text-slate-800">想问什么，直接在下面输入</p>
              <p className="mt-1 text-xs text-slate-500">例如：济南 3 天 1500 · 银川 周末漫行</p>
            </>
          )}
        </div>
      ) : null}

      {messages
        .filter((message) => !message.hidden)
        .map((message) => (
        <div
          key={message.id}
          ref={(node) => registerMessageRef(message.id, node)}
          className={cn(
            'scroll-mt-3 rounded-xl transition-shadow',
            selectedMessageId === message.id && 'ring-2 ring-brand-400/40 ring-offset-2',
          )}
        >
          <AiChatMessageBubble
            message={message}
            onUseExamplePrompt={onUseExamplePrompt}
            showActions={Boolean(messageActionProps && message.id === lastActionableAssistantId)}
            actionProps={messageActionProps}
          />
        </div>
      ))}

      <AnimatePresence>
        {showThinkingDots && (
          <motion.div
            className="flex items-center gap-2 pl-10 text-xs text-slate-500"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="flex gap-1" aria-hidden>
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400 [animation-delay:240ms]" />
            </span>
            AI 正在思考…
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
