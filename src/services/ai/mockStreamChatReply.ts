import type { AiChatContext, AiChatMessage } from '@/types/domain/aiChat';
import { generateMockChatReply } from '@/services/ai/generateMockChatReply';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** 演示模式：将完整 mock 回复切成流式 delta，模拟首字快出 */
export async function mockStreamChatReply(
  messages: AiChatMessage[],
  context: AiChatContext | undefined,
  options: {
    signal?: AbortSignal;
    onDelta: (text: string) => void;
  },
): Promise<void> {
  const full = await generateMockChatReply(messages, context);
  const chunkSize = 3;
  const pauseMs = 28;

  for (let i = 0; i < full.length; i += chunkSize) {
    if (options.signal?.aborted) {
      return;
    }
    options.onDelta(full.slice(i, i + chunkSize));
    await delay(pauseMs);
  }
}
