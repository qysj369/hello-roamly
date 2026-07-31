import type { AiChatContext } from '@/types/domain/aiChat';

export type AiChatStreamTurn = {
  role: 'user' | 'assistant';
  content: string;
};

/** POST /api/ai/chat-stream */
export type AiChatStreamRequest = {
  messages: AiChatStreamTurn[];
  context?: AiChatContext;
};

export type AiChatStreamDeltaEvent = {
  text: string;
};

export type AiChatStreamErrorEvent = {
  message: string;
  code?: string;
};
