import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteChatComposer from '@/components/features/messages/SiteChatComposer';
import { TRAVEL_BUDDY_BRAND } from '@/lib/config/travelBuddy';
import { useBuddyMessageThread } from '@/hooks/travelBuddy/useBuddyMessageThread';
import { messagesInboxPath } from '@/router/messagesPaths';
import { userProfilePath } from '@/router/paths';
import type { SiteChatConversation } from '@/types/domain/siteChat';
import { AvatarImage } from '@/components/ui';
import { formatChatTime } from '@/utils/siteChat';
import { cn } from '@/utils/cn';

export type BuddyChatThreadProps = {
  conversation: SiteChatConversation;
  buddyPostId: string;
  showSafetyNotice?: boolean;
  contextLabel?: string;
  draftMessage?: string;
  showBackLink?: boolean;
  className?: string;
};

export default function BuddyChatThread({
  conversation,
  buddyPostId,
  showSafetyNotice = true,
  contextLabel,
  draftMessage,
  showBackLink = false,
  className,
}: BuddyChatThreadProps) {
  const { messages, send, selfUserId } = useBuddyMessageThread({
    buddyPostId,
    peerUserId: conversation.peerUserId,
    enabled: true,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [draftSent, setDraftSent] = useState(false);

  useEffect(() => {
    if (!draftMessage || draftSent || messages.length > 0) {
      return;
    }
    setDraftSent(true);
    void send(draftMessage);
  }, [draftMessage, draftSent, messages.length, send]);

  const handleSend = useCallback(
    async (text: string) => {
      setSubmitError(null);
      setIsSending(true);
      try {
        await send(text);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : '发送失败');
      } finally {
        setIsSending(false);
      }
    },
    [send],
  );

  return (
    <div className={cn('flex min-h-[20rem] flex-1 flex-col bg-slate-50/50', className)}>
      <header className="flex items-center gap-3 border-b border-slate-200/80 bg-white px-4 py-3">
        {showBackLink && (
          <Link
            to={messagesInboxPath()}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 sm:hidden"
          >
            ← 会话
          </Link>
        )}
        {conversation.peerAvatar ? (
          <AvatarImage
            src={conversation.peerAvatar}
            displayName={conversation.peerUsername}
            size={40}
            className="h-10 w-10"
          />
        ) : (
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700"
            aria-hidden
          >
            {conversation.peerUsername.slice(0, 1)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-slate-900">
            {conversation.peerUsername}
          </h2>
          {contextLabel && <p className="truncate text-xs text-emerald-700">{contextLabel}</p>}
          <Link
            to={userProfilePath(conversation.peerUserId)}
            className="text-xs text-brand-600 hover:underline"
          >
            查看主页
          </Link>
        </div>
      </header>

      {showSafetyNotice && (
        <div
          className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs leading-relaxed text-amber-900"
          role="note"
        >
          {TRAVEL_BUDDY_BRAND.safetyNotice}
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-center text-xs text-slate-500">发送第一条消息，开始初步沟通</p>
        )}
        {messages.map((message) => {
          const isSelf = message.fromUserId === selfUserId;
          return (
            <div
              key={message.id}
              className={cn('flex', isSelf ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                  isSelf
                    ? 'rounded-br-md bg-emerald-600 text-white'
                    : 'rounded-bl-md border border-slate-200 bg-white text-slate-800',
                )}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <p
                  className={cn(
                    'mt-1 text-[10px]',
                    isSelf ? 'text-emerald-100' : 'text-slate-400',
                  )}
                >
                  {formatChatTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <SiteChatComposer onSend={handleSend} isSending={isSending} submitError={submitError} />
    </div>
  );
}
