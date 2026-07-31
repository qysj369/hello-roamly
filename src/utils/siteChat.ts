import type { TravelBuddyMatchCandidate } from '@/types/domain/travelBuddyMatch';
import type { SiteChatPeerMeta } from '@/types/domain/siteChat';
import { useSiteChatStore } from '@/stores/siteChat/store';

export function peerMetaFromMatchCandidate(
  candidate: TravelBuddyMatchCandidate,
): SiteChatPeerMeta {
  return {
    peerUserId: candidate.userId,
    peerUsername: candidate.username,
    peerAvatar: candidate.avatar,
  };
}

export function buildBuddyWelcomeMessage(candidate: TravelBuddyMatchCandidate): string {
  const parts = [
    `你好！我看到我们在 ${candidate.seekingDestination} 的行程匹配度有 ${candidate.matchScore}%。`,
    `我计划 ${candidate.seekingDays} 天，预算约 ${candidate.seekingBudgetLabel}。`,
  ];
  if (candidate.seekingMessage) {
    parts.push(candidate.seekingMessage);
  }
  parts.push('有兴趣一起结伴吗？');
  return parts.join(' ');
}

/** 打开或创建会话，可选插入对方首条欢迎语 */
export function ensureBuddyConversation(
  peer: SiteChatPeerMeta,
  welcomeMessage?: string,
): string {
  const store = useSiteChatStore.getState();
  store.hydrate();
  const conversationId = store.openConversation(peer);

  if (welcomeMessage && !store.hasMessages(conversationId)) {
    store.appendMessage({
      conversationId,
      senderId: peer.peerUserId,
      text: welcomeMessage,
    });
  }

  return conversationId;
}

export function formatChatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
