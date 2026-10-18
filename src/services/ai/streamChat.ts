import { getAiProvider } from '@/lib/config/ai';
import { isProductionAppMode } from '@/lib/config/appMode';
import { AiChatStreamError, streamChatFromApi } from '@/services/ai/api/streamChatFromApi';
import { mockStreamChatReply } from '@/services/ai/mockStreamChatReply';
import type { AiChatContext, AiChatMessage } from '@/types/domain/aiChat';
import type { AiChatStreamTurn } from '@/types/api/aiChatStream';

export type StreamChatReplyOptions = {
  messages: AiChatMessage[];
  context?: AiChatContext;
  signal?: AbortSignal;
  onDelta: (text: string) => void;
};

function toStreamTurns(messages: AiChatMessage[]): AiChatStreamTurn[] {
  return messages
    .filter(
      (message) =>
        (message.role === 'user' || message.role === 'assistant') &&
        message.content.trim().length > 0,
    )
    .map((message) => ({
      role: message.role as 'user' | 'assistant',
      content: message.content.trim(),
    }));
}

/**
 * 流式顾问对话：优先服务端 SSE；未配置 Key 时回退演示流式。
 */
export async function streamChatReply({
  messages,
  context,
  signal,
  onDelta,
}: StreamChatReplyOptions): Promise<void> {
  const turns = toStreamTurns(messages);
  if (turns.length === 0) {
    throw new AiChatStreamError('没有可发送的对话内容', 'empty_messages');
  }

  try {
    const result = await streamChatFromApi({
      request: { messages: turns, context },
      signal,
      onDelta,
    });

    if (result === 'done') {
      return;
    }
  } catch (error) {
    if (signal?.aborted) {
      return;
    }
    if (error instanceof AiChatStreamError && error.code !== 'deepseek_unconfigured') {
      throw error;
    }
    if (!(error instanceof AiChatStreamError)) {
      const message = error instanceof Error ? error.message : '流式对话失败';
      if (!/fetch|network|Failed to fetch/i.test(message)) {
        throw error;
      }
    }
  }

  if (isProductionAppMode()) {
    throw new AiChatStreamError(
      '上线模式需要配置服务端 DeepSeek Key（DEEPSEEK_API_KEY）',
      'deepseek_unconfigured',
    );
  }

  if (getAiProvider() === 'mock') {
    await mockStreamChatReply(messages, context, { signal, onDelta });
    return;
  }

  throw new AiChatStreamError('流式对话不可用，请检查服务端 API 配置', 'unavailable');
}
