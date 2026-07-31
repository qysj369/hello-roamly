import { create } from 'zustand';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import type {
  SiteChatConversation,
  SiteChatMessage,
  SiteChatPeerMeta,
} from '@/types/domain/siteChat';

const STORAGE_KEY = 'hello-roamly:site-chat';
// TODO: 私信改 WebSocket + REST 同步，localStorage 仅缓存最近会话
const SELF_USER_ID = DEMO_CURRENT_USER_ID;

type StoredSiteChat = {
  conversations: SiteChatConversation[];
  messages: SiteChatMessage[];
};

function readStorage(): StoredSiteChat {
  if (typeof window === 'undefined') {
    return { conversations: [], messages: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { conversations: [], messages: [] };
    }
    const parsed = JSON.parse(raw) as Partial<StoredSiteChat>;
    return {
      conversations: Array.isArray(parsed.conversations) ? parsed.conversations : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    };
  } catch {
    return { conversations: [], messages: [] };
  }
}

function writeStorage(conversations: SiteChatConversation[], messages: SiteChatMessage[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversations, messages }));
}

function toRecord<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

function groupMessages(messages: SiteChatMessage[]): Record<string, SiteChatMessage[]> {
  const grouped: Record<string, SiteChatMessage[]> = {};
  for (const message of messages) {
    const list = grouped[message.conversationId] ?? [];
    list.push(message);
    grouped[message.conversationId] = list;
  }
  for (const id of Object.keys(grouped)) {
    grouped[id]!.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }
  return grouped;
}

type SiteChatState = {
  conversations: Record<string, SiteChatConversation>;
  messagesByConversation: Record<string, SiteChatMessage[]>;
  hydrated: boolean;
  hydrate: () => void;
  openConversation: (peer: SiteChatPeerMeta) => string;
  sendMessage: (conversationId: string, text: string) => void;
  appendMessage: (message: Omit<SiteChatMessage, 'id' | 'createdAt'> & { id?: string }) => void;
  markConversationRead: (conversationId: string) => void;
  getSortedConversations: () => SiteChatConversation[];
  getMessages: (conversationId: string) => SiteChatMessage[];
  hasMessages: (conversationId: string) => boolean;
  getTotalUnread: () => number;
};

export const useSiteChatStore = create<SiteChatState>((set, get) => ({
  conversations: {},
  messagesByConversation: {},
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) {
      return;
    }
    const stored = readStorage();
    set({
      conversations: toRecord(stored.conversations),
      messagesByConversation: groupMessages(stored.messages),
      hydrated: true,
    });
  },

  openConversation: (peer) => {
    const conversationId = peer.peerUserId;
    const existing = get().conversations[conversationId];
    if (existing) {
      if (
        existing.peerUsername !== peer.peerUsername ||
        existing.peerAvatar !== peer.peerAvatar
      ) {
        set((state) => {
          const conversations = {
            ...state.conversations,
            [conversationId]: {
              ...existing,
              peerUsername: peer.peerUsername,
              peerAvatar: peer.peerAvatar,
            },
          };
          writeStorage(
            Object.values(conversations),
            Object.values(state.messagesByConversation).flat(),
          );
          return { conversations };
        });
      }
      return conversationId;
    }

    const now = new Date().toISOString();
    const conversation: SiteChatConversation = {
      id: conversationId,
      peerUserId: peer.peerUserId,
      peerUsername: peer.peerUsername,
      peerAvatar: peer.peerAvatar,
      updatedAt: now,
      unreadCount: 0,
    };

    set((state) => {
      const conversations = { ...state.conversations, [conversationId]: conversation };
      writeStorage(
        Object.values(conversations),
        Object.values(state.messagesByConversation).flat(),
      );
      return { conversations };
    });

    return conversationId;
  },

  appendMessage: (payload) => {
    const message: SiteChatMessage = {
      id: payload.id ?? `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      conversationId: payload.conversationId,
      senderId: payload.senderId,
      text: payload.text.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!message.text) {
      return;
    }

    set((state) => {
      const prevMessages = state.messagesByConversation[payload.conversationId] ?? [];
      const messagesByConversation = {
        ...state.messagesByConversation,
        [payload.conversationId]: [...prevMessages, message],
      };

      const conversation = state.conversations[payload.conversationId];
      const isFromPeer = payload.senderId !== SELF_USER_ID;
      const updatedConversation: SiteChatConversation = conversation
        ? {
            ...conversation,
            lastMessagePreview: message.text,
            updatedAt: message.createdAt,
            unreadCount: isFromPeer ? conversation.unreadCount + 1 : conversation.unreadCount,
          }
        : {
            id: payload.conversationId,
            peerUserId: payload.senderId,
            peerUsername: '旅伴',
            lastMessagePreview: message.text,
            updatedAt: message.createdAt,
            unreadCount: isFromPeer ? 1 : 0,
          };

      const conversations = {
        ...state.conversations,
        [payload.conversationId]: updatedConversation,
      };

      writeStorage(Object.values(conversations), Object.values(messagesByConversation).flat());

      return { conversations, messagesByConversation };
    });
  },

  sendMessage: (conversationId, text) => {
    get().appendMessage({
      conversationId,
      senderId: SELF_USER_ID,
      text,
    });

    const conversation = get().conversations[conversationId];
    if (!conversation) {
      return;
    }

    window.setTimeout(() => {
      get().appendMessage({
        conversationId,
        senderId: conversation.peerUserId,
        text: `收到啦！我是 ${conversation.peerUsername}，这是演示站内私信，消息已保存在本地。`,
      });
    }, 700);
  },

  markConversationRead: (conversationId) => {
    const conversation = get().conversations[conversationId];
    if (!conversation || conversation.unreadCount === 0) {
      return;
    }

    set((state) => {
      const conversations = {
        ...state.conversations,
        [conversationId]: { ...conversation, unreadCount: 0 },
      };
      writeStorage(
        Object.values(conversations),
        Object.values(state.messagesByConversation).flat(),
      );
      return { conversations };
    });
  },

  getSortedConversations: () =>
    Object.values(get().conversations).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    ),

  getMessages: (conversationId) => get().messagesByConversation[conversationId] ?? [],

  hasMessages: (conversationId) => (get().messagesByConversation[conversationId]?.length ?? 0) > 0,

  getTotalUnread: () =>
    Object.values(get().conversations).reduce((sum, item) => sum + item.unreadCount, 0),
}));

export function getSiteChatSelfUserId(): string {
  return SELF_USER_ID;
}

export function isSelfChatMessage(senderId: string): boolean {
  return senderId === SELF_USER_ID;
}
