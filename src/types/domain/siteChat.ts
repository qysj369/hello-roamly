import type { UserId } from '@/types/domain/user/userId';

/** 站内私信消息 */
export type SiteChatMessage = {
  id: string;
  conversationId: string;
  senderId: UserId;
  text: string;
  /** ISO 8601 */
  createdAt: string;
};

/** 单聊会话（conversationId = 对方 userId） */
export type SiteChatConversation = {
  id: string;
  peerUserId: UserId;
  peerUsername: string;
  peerAvatar?: string;
  lastMessagePreview?: string;
  /** ISO 8601 */
  updatedAt: string;
  unreadCount: number;
};

export type SiteChatPeerMeta = {
  peerUserId: UserId;
  peerUsername: string;
  peerAvatar?: string;
};
