import { useCallback, useEffect, useState } from 'react';
import { assertContentAllowed, ContentModerationRejectedError } from '@/lib/moderation';
import { Link } from 'react-router-dom';
import SiteChatComposer from '@/components/features/messages/SiteChatComposer';
import SiteChatMessageList from '@/components/features/messages/SiteChatMessageList';
import { TRAVEL_BUDDY_BRAND } from '@/lib/config/travelBuddy';
import type { SiteChatConversation, SiteChatMessage } from '@/types/domain/siteChat';
import { useSiteChatStore } from '@/stores/siteChat/store';
import { messagesInboxPath } from '@/router/messagesPaths';
import { userProfilePath } from '@/router/paths';
import { AvatarImage } from '@/components/ui';
import { cn } from '@/utils/cn';

const EMPTY_CHAT_MESSAGES: SiteChatMessage[] = [];

export type SiteChatThreadProps = {
  conversation: SiteChatConversation;
  showBackLink?: boolean;
  showSafetyNotice?: boolean;
  initialDraft?: string;
  className?: string;
};

export default function SiteChatThread({
  conversation,
  showBackLink = false,
  showSafetyNotice = false,
  initialDraft,
  className,
}: SiteChatThreadProps) {
  const messages = useSiteChatStore(
    (state) => state.messagesByConversation[conversation.id] ?? EMPTY_CHAT_MESSAGES,
  );
  const sendMessage = useSiteChatStore((state) => state.sendMessage);
  const markRead = useSiteChatStore((state) => state.markConversationRead);

  useEffect(() => {
    markRead(conversation.id);
  }, [conversation.id, markRead]);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSend = useCallback(
    async (text: string) => {
      setSubmitError(null);
      setIsSending(true);
      try {
        await assertContentAllowed({
          scene: 'site_chat',
          text,
          bizId: conversation.id,
        });
        sendMessage(conversation.id, text);
      } catch (error) {
        if (error instanceof ContentModerationRejectedError) {
          setSubmitError(error.message);
          return;
        }
        setSubmitError(error instanceof Error ? error.message : '发送失败');
      } finally {
        setIsSending(false);
      }
    },
    [conversation.id, sendMessage],
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

      <SiteChatMessageList messages={messages} peerUsername={conversation.peerUsername} />
      <SiteChatComposer
        onSend={handleSend}
        isSending={isSending}
        submitError={submitError}
        initialDraft={initialDraft}
      />
    </div>
  );
}
