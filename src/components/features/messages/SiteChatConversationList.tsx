import { MessageCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { SiteChatConversation } from '@/types/domain/siteChat';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { messagesThreadPath } from '@/router/messagesPaths';
import { formatChatTime } from '@/utils/siteChat';
import { AvatarImage } from '@/components/ui';
import { cn } from '@/utils/cn';

export type SiteChatConversationListProps = {
  conversations: SiteChatConversation[];
  activePeerId?: string;
  className?: string;
};

export default function SiteChatConversationList({
  conversations,
  activePeerId,
  className,
}: SiteChatConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center px-4 py-12 text-center',
          className,
        )}
      >
        <MessageCircle className="h-10 w-10 text-slate-300" aria-hidden />
        <p className="mt-3 text-sm font-medium text-slate-700">{SNAIL_GLOBAL_COPY.emptyState}</p>
        <p className="mt-1 text-xs text-slate-500">在旅伴匹配中向蜗友发起聊天吧</p>      </div>
    );
  }

  return (
    <ul className={cn('divide-y divide-slate-100', className)} aria-label="会话列表">
      {conversations.map((conversation) => {
        const isActive = conversation.id === activePeerId;

        return (
          <li key={conversation.id}>
            <NavLink
              to={messagesThreadPath(conversation.peerUserId)}
              className={({ isActive: routeActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 transition',
                  (isActive || routeActive) && 'bg-violet-50/80',
                  !isActive && !routeActive && 'hover:bg-slate-50',
                )
              }
            >
              {conversation.peerAvatar ? (
                <AvatarImage
                  src={conversation.peerAvatar}
                  displayName={conversation.peerUsername}
                  size={44}
                  className="h-11 w-11 shrink-0"
                />
              ) : (
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700"
                  aria-hidden
                >
                  {conversation.peerUsername.slice(0, 1)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {conversation.peerUsername}
                  </p>
                  {conversation.updatedAt && (
                    <time
                      className="shrink-0 text-[10px] text-slate-400"
                      dateTime={conversation.updatedAt}
                    >
                      {formatChatTime(conversation.updatedAt)}
                    </time>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                  {conversation.lastMessagePreview ?? '开始聊天'}
                </p>
              </div>
              {conversation.unreadCount > 0 && (
                <span className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white">
                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                </span>
              )}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}
