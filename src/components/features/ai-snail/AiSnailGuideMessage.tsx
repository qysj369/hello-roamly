import { motion, useReducedMotion } from 'framer-motion';
import { memo } from 'react';
import { User } from 'lucide-react';
import AiChatMarkdown from '@/components/features/ai/AiChatMarkdown';
import { AI_SNAIL_ASSISTANT_NAME } from '@/types/domain/aiSnailGuide';
import type { AiChatMessage } from '@/types/domain/aiChat';
import { cn } from '@/utils/cn';

type AiSnailGuideMessageProps = {
  message: AiChatMessage;
};

function AiSnailGuideMessage({ message }: AiSnailGuideMessageProps) {
  const reduceMotion = useReducedMotion();
  const isUser = message.role === 'user';

  return (
    <motion.article
      className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.22 }}
      aria-label={isUser ? '你的消息' : `${AI_SNAIL_ASSISTANT_NAME} 回复`}
    >
      <span
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ring-2 ring-white',
          isUser
            ? 'bg-slate-700 text-white shadow-sm'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25',
        )}
        aria-hidden
      >
        {isUser ? <User className="h-4 w-4" /> : '🐌'}
      </span>

      <div className={cn('flex min-w-0 max-w-[min(100%,28rem)] flex-col', isUser && 'items-end')}>
        <span
          className={cn(
            'mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider',
            isUser ? 'text-slate-400' : 'text-emerald-700',
          )}
        >
          {isUser ? '你' : AI_SNAIL_ASSISTANT_NAME}
        </span>

        <div
          className={cn(
            'w-full rounded-2xl px-3.5 py-2.5 shadow-sm',
            isUser
              ? 'rounded-tr-md bg-gradient-to-br from-emerald-600 to-teal-700 text-white'
              : 'rounded-tl-md border border-slate-200/90 bg-white text-slate-800 ring-1 ring-slate-100 border-l-[3px] border-l-emerald-400',
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          ) : (
            <AiChatMarkdown content={message.content} className="text-sm leading-relaxed" />
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default memo(AiSnailGuideMessage);
