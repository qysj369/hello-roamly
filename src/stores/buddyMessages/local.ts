import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import {
  readBuddyMessagesFromStorage,
  writeBuddyMessagesToStorage,
} from '@/stores/buddyMessages/storage';
import type { BuddyMessage } from '@/types/domain/travelBuddy';
import type { UserId } from '@/types/domain/user/userId';

function newMessageId(): string {
  return `bmsg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isThreadMessage(
  message: BuddyMessage,
  buddyPostId: string,
  selfUserId: string,
  peerUserId: string,
): boolean {
  if (message.buddyPostId !== buddyPostId) {
    return false;
  }
  const set = new Set([message.fromUserId, message.toUserId]);
  return set.has(selfUserId) && set.has(peerUserId);
}

export function listBuddyMessagesLocal(params: {
  buddyPostId: string;
  peerUserId: UserId;
  since?: string;
  selfUserId?: string;
}): BuddyMessage[] {
  const selfUserId = params.selfUserId ?? DEMO_CURRENT_USER_ID;
  let items = readBuddyMessagesFromStorage().filter((message) =>
    isThreadMessage(message, params.buddyPostId, selfUserId, params.peerUserId),
  );

  if (params.since) {
    const sinceMs = new Date(params.since).getTime();
    items = items.filter((message) => new Date(message.createdAt).getTime() > sinceMs);
  }

  items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const updated = readBuddyMessagesFromStorage().map((message) => {
    if (
      isThreadMessage(message, params.buddyPostId, selfUserId, params.peerUserId) &&
      message.toUserId === selfUserId &&
      !message.isRead
    ) {
      return { ...message, isRead: true };
    }
    return message;
  });
  writeBuddyMessagesToStorage(updated);

  return items;
}

export function sendBuddyMessageLocal(params: {
  buddyPostId: string;
  toUserId: UserId;
  content: string;
  fromUserId?: string;
}): BuddyMessage {
  const message: BuddyMessage = {
    id: newMessageId(),
    buddyPostId: params.buddyPostId,
    fromUserId: params.fromUserId ?? DEMO_CURRENT_USER_ID,
    toUserId: params.toUserId,
    content: params.content.trim(),
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  const items = [...readBuddyMessagesFromStorage(), message];
  writeBuddyMessagesToStorage(items);
  return message;
}
