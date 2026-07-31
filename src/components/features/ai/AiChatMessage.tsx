import { motion, useReducedMotion } from 'framer-motion';
import { memo } from 'react';
import { User } from 'lucide-react';
import AiChatMarkdown from '@/components/features/ai/AiChatMarkdown';
import AiChatMessageActions from '@/components/features/ai/AiChatMessageActions';
import { AI_CHAT_WELCOME_MESSAGE_ID } from '@/hooks/ai/useAiChat';
import type { AiChatMessage as AiChatMessageType } from '@/types/domain/aiChat';
import { cn } from '@/utils/cn';

type AiChatMessageActionProps = {
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

type AiChatMessageProps = {
  message: AiChatMessageType;
  onUseExamplePrompt?: (text: string) => void;
  showActions?: boolean;
  actionProps?: AiChatMessageActionProps;
};

function AiChatMessage({ message, onUseExamplePrompt, showActions, actionProps }: AiChatMessageProps) {
  const reduceMotion = useReducedMotion();
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isWelcomeSeed = message.id === AI_CHAT_WELCOME_MESSAGE_ID;

  return (
    <motion.article
      className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.22 }}
      aria-label={isUser ? '你的消息' : 'AI 回复'}
    >
      <span
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-2 ring-white',
          isUser
            ? 'bg-slate-700 text-white shadow-sm'
            : 'bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-md shadow-violet-500/25',
        )}
        aria-hidden
      >
        {isUser ? <User className="h-4 w-4" /> : <span className="text-sm leading-none">🐌</span>}
      </span>

      <div
        className={cn(
          'min-w-0',
          isAssistant && !isWelcomeSeed ? 'max-w-[min(100%,40rem)]' : 'max-w-[min(100%,28rem)]',
          isUser ? 'items-end' : 'items-start',
          'flex flex-col',
        )}
      >
        {!isWelcomeSeed ? (
          <span
            className={cn(
              'mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider',
              isUser ? 'text-slate-400' : 'text-violet-600',
            )}
          >
            {isUser ? '你' : 'AI 顾问'}
          </span>
        ) : null}

        <div
          className={cn(
            'w-full shadow-sm',
            isWelcomeSeed
              ? 'rounded-xl border border-dashed border-brand-200/80 bg-brand-50/40 px-3 py-2 text-sm text-slate-600'
              : 'rounded-2xl px-3.5 py-2.5',
            isUser
              ? 'rounded-tr-md bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-brand-500/15'
              : !isWelcomeSeed &&
                  'rounded-tl-md border border-slate-200/90 bg-white text-slate-800 ring-1 ring-slate-100',
            isAssistant && !isWelcomeSeed && 'border-l-[3px] border-l-violet-400',
          )}
        >
          {isAssistant ? (
            <>
              {message.content ? (
                isWelcomeSeed ? (
                  <div className="leading-relaxed">
                    <AiChatMarkdown content={message.content} />
                  </div>
                ) : (
                  <AiChatMarkdown content={message.content} onUseExamplePrompt={onUseExamplePrompt} />
                )
              ) : message.status === 'streaming' ? (
                <span className="inline-flex items-center gap-1 text-slate-400" aria-hidden>
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400 [animation-delay:300ms]" />
                </span>
              ) : null}
              {message.status === 'streaming' && message.content ? (
                <span
                  className="ml-0.5 inline-block h-[1.1em] w-0.5 animate-pulse bg-brand-500 align-text-bottom"
                  aria-hidden
                />
              ) : null}
            </>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          )}
        </div>

        {showActions && actionProps && isAssistant && !isWelcomeSeed && message.status !== 'streaming' && message.content.trim() ? (
          <AiChatMessageActions {...actionProps} />
        ) : null}
      </div>
    </motion.article>
  );
}

export default memo(AiChatMessage);
