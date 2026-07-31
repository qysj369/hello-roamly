import { useEffect, useRef } from 'react';
import type { SiteChatMessage } from '@/types/domain/siteChat';
import { isSelfChatMessage } from '@/stores/siteChat/store';
import { formatChatTime } from '@/utils/siteChat';
import { cn } from '@/utils/cn';

export type SiteChatMessageListProps = {
  messages: SiteChatMessage[];
  peerUsername: string;
  className?: string;
};

export default function SiteChatMessageList({
  messages,
  peerUsername,
  className,
}: SiteChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <p
        className={cn(
          'flex flex-1 items-center justify-center px-4 text-center text-sm text-slate-500',
          className,
        )}
      >
        还没有消息，发一句打个招呼吧
      </p>
    );
  }

  return (
    <ul className={cn('flex-1 space-y-3 overflow-y-auto px-4 py-4', className)} aria-live="polite">
      {messages.map((message) => {
        const isSelf = isSelfChatMessage(message.senderId);

        return (
          <li key={message.id} className={cn('flex', isSelf ? 'justify-end' : 'justify-start')}>
            <div className="max-w-[85%]">
              {!isSelf && (
                <p className="mb-0.5 text-[10px] font-medium text-slate-500">{peerUsername}</p>
              )}
              <div
                className={cn(
                  'rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm',
                  isSelf
                    ? 'rounded-br-md bg-violet-600 text-white'
                    : 'rounded-bl-md border border-slate-200/80 bg-white text-slate-800',
                )}
              >
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
              </div>
              <time
                className={cn(
                  'mt-0.5 block text-[10px]',
                  isSelf ? 'text-right text-slate-400' : 'text-slate-400',
                )}
                dateTime={message.createdAt}
              >
                {formatChatTime(message.createdAt)}
              </time>
            </div>
          </li>
        );
      })}
      <div ref={endRef} aria-hidden />
    </ul>
  );
}
