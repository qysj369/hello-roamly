import { BrowserSpeechQueue } from '@/lib/browser/browserSpeechQueue';
import { prepareBrowserSpeechSynthesis } from '@/lib/browser/browserSpeechSynthesis';

const STREAM_MIN_CHARS = 16;
const MAX_CHUNK_CHARS = 100;

export const ADVISOR_SPEECH_OUTPUT_HINT =
  '听不到朗读？Win+I → 系统 → 声音 → 输出，选扬声器或耳机，并确认浏览器标签未静音';

const speechQueue = new BrowserSpeechQueue();

/** 去掉 Markdown，供 TTS 朗读 */
export function stripAdvisorReplyForSpeech(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 从已朗读位置切分可播报片段（流式时只读完整句/足够长的逗号段） */
export function splitAdvisorReplySpeechDelta(
  fullPlain: string,
  spokenLength: number,
  finalize: boolean,
): { chunks: string[]; nextSpokenLength: number } {
  const delta = fullPlain.slice(spokenLength);
  if (!delta) {
    return { chunks: [], nextSpokenLength: spokenLength };
  }

  const chunks: string[] = [];
  let cursor = 0;

  while (cursor < delta.length) {
    const rest = delta.slice(cursor);
    const sentenceEnd = rest.search(/[。！？；!?.\n]/);

    if (sentenceEnd >= 0) {
      const piece = rest.slice(0, sentenceEnd + 1).trim();
      if (piece) {
        chunks.push(piece);
      }
      cursor += sentenceEnd + 1;
      continue;
    }

    if (!finalize) {
      const commaEnd = rest.search(/[，,]/);
      if (commaEnd >= 0 && commaEnd + 1 >= STREAM_MIN_CHARS) {
        const piece = rest.slice(0, commaEnd + 1).trim();
        if (piece) {
          chunks.push(piece);
        }
        cursor += commaEnd + 1;
        continue;
      }

      if (rest.length >= MAX_CHUNK_CHARS) {
        const piece = rest.slice(0, MAX_CHUNK_CHARS).trim();
        if (piece) {
          chunks.push(piece);
        }
        cursor += MAX_CHUNK_CHARS;
        continue;
      }

      break;
    }

    const tail = rest.trim();
    if (tail) {
      chunks.push(tail);
    }
    cursor = delta.length;
    break;
  }

  return {
    chunks,
    nextSpokenLength: spokenLength + cursor,
  };
}

/** 在用户开启语音对话前预热 TTS */
export function primeAdvisorReplySpeech(): void {
  void prepareBrowserSpeechSynthesis();
}

export function getAdvisorReplySpeechQueue(): BrowserSpeechQueue {
  return speechQueue;
}

/** 停止顾问回复朗读 */
export function stopAdvisorReplySpeech(): void {
  speechQueue.stop();
}

/** 流式 enqueue 新片段（不中断已在播的内容） */
export function enqueueAdvisorReplySpeech(text: string): void {
  speechQueue.enqueue(text, 0.96);
}

export function isAdvisorReplySpeechActive(): boolean {
  return speechQueue.isActive();
}
