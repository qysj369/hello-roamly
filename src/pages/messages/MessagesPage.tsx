import { MessageCircle } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import BuddyChatThread from '@/components/features/travelBuddy/BuddyChatThread';
import SiteChatConversationList from '@/components/features/messages/SiteChatConversationList';
import SiteChatThread from '@/components/features/messages/SiteChatThread';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import { findUserById } from '@/data/findUserById';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { chatThreadPageSeo, messagesPageSeo } from '@/lib/seo';
import { paths } from '@/router/paths';
import { useSiteChatStore } from '@/stores/siteChat/store';
import type { SiteChatConversation } from '@/types/domain/siteChat';
import type { MessagesPageState } from '@/types/router-state';
import { cn } from '@/utils/cn';
import '@/styles/holo-inner.css';

export default function MessagesPage() {
  const { peerUserId } = useParams<{ peerUserId?: string }>();
  const location = useLocation();
  const routeState = (location.state as MessagesPageState | null) ?? null;
  const hydrate = useSiteChatStore((state) => state.hydrate);
  const openConversation = useSiteChatStore((state) => state.openConversation);
  const storedConversation = useSiteChatStore((state) =>
    peerUserId ? state.conversations[peerUserId] : undefined,
  );
  const conversationMap = useSiteChatStore((state) => state.conversations);
  const conversations = useMemo(
    () =>
      Object.values(conversationMap).sort(
        (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      ),
    [conversationMap],
  );

  const peerUser = peerUserId ? findUserById(peerUserId) : undefined;

  const activeConversation = useMemo((): SiteChatConversation | undefined => {
    if (storedConversation) {
      return storedConversation;
    }
    if (!peerUser) {
      return undefined;
    }
    return {
      id: peerUser.id,
      peerUserId: peerUser.id,
      peerUsername: peerUser.username,
      peerAvatar: peerUser.avatar,
      updatedAt: new Date().toISOString(),
      unreadCount: 0,
    };
  }, [peerUser, storedConversation]);

  const pageSeo = useMemo(
    () =>
      activeConversation && peerUserId
        ? chatThreadPageSeo(activeConversation.peerUsername, peerUserId)
        : messagesPageSeo(),
    [activeConversation, peerUserId],
  );

  usePageSeo(pageSeo);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!peerUser) {
      return;
    }
    openConversation({
      peerUserId: peerUser.id,
      peerUsername: peerUser.username,
      peerAvatar: peerUser.avatar,
    });
  }, [openConversation, peerUser]);

  const useBuddyThread = Boolean(routeState?.buddyPostId && activeConversation);

  return (
    <MotionPage className="holo-messages flex flex-col gap-4">
      <MotionBlock>
        <header className="holo-messages__header flex items-center justify-between gap-2">
          <div>
            <h1 className="holo-messages__title">站内消息</h1>
            <p className="holo-messages__subtitle">
              {useBuddyThread ? '伸出触角 · 结伴初步沟通（轮询同步）' : '与蜗友的私信'}
            </p>
          </div>
          <Link to={paths.travelBuddies} className="holo-messages__link">
            伸出触角
          </Link>
        </header>
      </MotionBlock>

      <MotionBlock className="holo-messages__panel flex min-h-[28rem] flex-1 flex-col overflow-hidden sm:min-h-[32rem]">
        <div className="grid min-h-[28rem] flex-1 sm:grid-cols-[minmax(0,17rem)_1fr]">
          <aside
            className={cn(
              'holo-messages__aside border-b sm:border-b-0 sm:border-r',
              peerUserId ? 'hidden sm:block' : 'block',
            )}
          >
            <p className="holo-messages__aside-title border-b px-4 py-2.5 text-xs font-semibold">
              会话列表
            </p>
            <SiteChatConversationList conversations={conversations} activePeerId={peerUserId} />
          </aside>

          <section
            className={cn('flex min-h-[24rem] flex-1 flex-col', !peerUserId && 'hidden sm:flex')}
          >
            {activeConversation && useBuddyThread && routeState?.buddyPostId ? (
              <BuddyChatThread
                conversation={activeConversation}
                buddyPostId={routeState.buddyPostId}
                showSafetyNotice={routeState.showSafetyNotice ?? true}
                contextLabel={routeState.contextLabel}
                draftMessage={routeState.draftMessage}
                showBackLink
              />
            ) : activeConversation ? (
              <SiteChatThread
                conversation={activeConversation}
                showBackLink
                showSafetyNotice={routeState?.showSafetyNotice}
                initialDraft={routeState?.draftMessage}
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <MessageCircle className="h-12 w-12 text-slate-300" aria-hidden />
                <p className="mt-3 text-sm font-medium text-slate-700">选择会话开始聊天</p>
                <p className="mt-1 text-xs text-slate-500">
                  在左侧选择联系人，或从伸出触角点击「感兴趣」
                </p>
              </div>
            )}
          </section>
        </div>
      </MotionBlock>
    </MotionPage>
  );
}
