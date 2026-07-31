import { findUserById } from '@/data/findUserById';
import { messagesThreadPath } from '@/router/messagesPaths';
import { useSiteChatStore } from '@/stores/siteChat/store';
import type { TravelBuddyPost } from '@/types/domain/travelBuddy';
import type { MessagesPageState } from '@/types/router-state';
import { buildTravelBuddyInterestMessage } from '@/utils/travelBuddy';

export function openTravelBuddyInterestChat(
  post: TravelBuddyPost,
  navigate: (path: string, options?: { state?: MessagesPageState }) => void,
): void {
  const author = findUserById(post.userId);
  if (!author) {
    return;
  }

  const store = useSiteChatStore.getState();
  store.hydrate();
  store.openConversation({
    peerUserId: author.id,
    peerUsername: author.username,
    peerAvatar: author.avatar,
  });

  navigate(messagesThreadPath(author.id), {
    state: {
      buddyPostId: post.id,
      showSafetyNotice: true,
      draftMessage: buildTravelBuddyInterestMessage(post),
      contextLabel: `${post.destination} · 伸出触角`,
    },
  });
}
