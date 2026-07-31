import { motion, useReducedMotion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import type { AiChatMessage } from '@/types/domain/aiChat';
import { AI_CHAT_WELCOME_MESSAGE_ID } from '@/hooks/ai/useAiChat';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { motionTransition, staggerContainer, staggerItem } from '@/lib/motion';
import { cn } from '@/utils/cn';
import { formatRelativeZh } from '@/utils/date';

type AIChatHistoryPanelProps = {
  messages: AiChatMessage[];
  isLoading: boolean;
  selectedMessageId: string | null;
  onSelectMessage: (messageId: string) => void;
  className?: string;
};

function getRoleLabel(role: AiChatMessage['role']): string {
  if (role === 'user') {
    return '你';
  }
  if (role === 'assistant') {
    return 'AI';
  }
  return '系统';
}

function previewText(content: string, max = 72): string {
  const oneLine = content.replace(/\s+/g, ' ').trim();
  if (oneLine.length <= max) {
    return oneLine;
  }
  return `${oneLine.slice(0, max)}…`;
}

export default function AIChatHistoryPanel({
  messages,
  isLoading,
  selectedMessageId,
  onSelectMessage,
  className,
}: AIChatHistoryPanelProps) {
  const reduceMotion = useReducedMotion();
  const visibleMessages = messages.filter(
    (m) => m.role !== 'system' && m.id !== AI_CHAT_WELCOME_MESSAGE_ID,
  );
  const hasUserTurns = messages.some((m) => m.role === 'user');

  return (
    <aside
      className={cn(
        'flex min-h-0 flex-col bg-slate-100/60',
        'border-slate-200/90 lg:border-r',
        className,
      )}
      aria-label="对话历史"
    >
      <div className="shrink-0 border-b border-slate-200/80 bg-white/80 px-3 py-2.5">
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">History</p>
        <h3 className="text-sm font-semibold text-slate-900">对话记录</h3>
        <p className="mt-0.5 text-[10px] text-slate-500">共 {visibleMessages.length} 条</p>
      </div>

      <motion.ol
        className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        transition={motionTransition(reduceMotion)}
      >
        {visibleMessages.length === 0 && (
          <li className="rounded-xl px-3 py-4 text-center text-xs leading-relaxed text-slate-500">
            {hasUserTurns ? SNAIL_GLOBAL_COPY.emptyState : '发送第一条消息后，记录会出现在这里'}
          </li>
        )}

        {visibleMessages.map((message) => {
          const isUser = message.role === 'user';
          const isSelected = selectedMessageId === message.id;

          return (
            <motion.li key={message.id} variants={staggerItem}>
              <button
                type="button"
                onClick={() => onSelectMessage(message.id)}
                className={cn(
                  'w-full rounded-xl border px-2.5 py-2 text-left transition',
                  'hover:border-brand-200 hover:bg-white',
                  isSelected
                    ? 'border-brand-300 bg-white shadow-sm ring-1 ring-brand-500/20'
                    : 'border-transparent bg-white/70',
                )}
                aria-current={isSelected ? 'true' : undefined}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                      isUser
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-gradient-to-br from-brand-500 to-violet-600 text-white',
                    )}
                    aria-hidden
                  >
                    {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-wide',
                      isUser ? 'text-slate-600' : 'text-brand-700',
                    )}
                  >
                    {getRoleLabel(message.role)}
                  </span>
                  <time
                    className="ml-auto font-mono text-[9px] text-slate-400"
                    dateTime={message.createdAt}
                  >
                    {formatRelativeZh(message.createdAt)}
                  </time>
                </div>
                <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-slate-700">
                  {previewText(message.content)}
                </p>
              </button>
            </motion.li>
          );
        })}

        {isLoading && (
          <li className="rounded-xl border border-dashed border-brand-200/80 bg-brand-50/50 px-2.5 py-2 text-xs text-brand-700">
            AI 正在回复…
          </li>
        )}
      </motion.ol>
    </aside>
  );
}
