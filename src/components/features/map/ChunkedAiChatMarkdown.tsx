import { useEffect, useMemo, useRef, useState } from 'react';
import AiChatMarkdown from '@/components/features/ai/AiChatMarkdown';

type ChunkedAiChatMarkdownProps = {
  content: string;
  className?: string;
  /** 攻略结果柔和排版 */
  soft?: boolean;
  /** 每片大约字符数（按段落边界切） */
  chunkChars?: number;
};

function splitMarkdownChunks(text: string, maxLen: number): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= maxLen) return [trimmed];

  const parts = trimmed.split(/\n{2,}/);
  const chunks: string[] = [];
  let buffer = '';

  for (const part of parts) {
    if (!buffer) {
      buffer = part;
      continue;
    }
    if (buffer.length + part.length + 2 > maxLen) {
      chunks.push(buffer);
      buffer = part;
    } else {
      buffer = `${buffer}\n\n${part}`;
    }
  }
  if (buffer) chunks.push(buffer);
  return chunks.length > 0 ? chunks : [trimmed];
}

/**
 * 长 Markdown 分片渐进渲染，减轻移动端一次解析卡顿。
 * 仅展示层优化，不改动攻略生成业务逻辑。
 */
export default function ChunkedAiChatMarkdown({
  content,
  className,
  soft = false,
  chunkChars = 900,
}: ChunkedAiChatMarkdownProps) {
  const chunks = useMemo(
    () => splitMarkdownChunks(content, chunkChars),
    [content, chunkChars],
  );
  const [visibleCount, setVisibleCount] = useState(1);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    const prevLength = prevLengthRef.current;
    prevLengthRef.current = content.length;

    // 流式追加：保持已渲染片数，避免回退造成空白闪烁
    if (content.length >= prevLength && prevLength > 0) {
      setVisibleCount((count) => Math.min(Math.max(count, 1), chunks.length));
      return;
    }
    setVisibleCount(1);
  }, [content, chunks.length]);

  useEffect(() => {
    if (visibleCount >= chunks.length) return undefined;
    const timer = window.setTimeout(() => {
      setVisibleCount((count) => Math.min(count + 1, chunks.length));
    }, 32);
    return () => window.clearTimeout(timer);
  }, [visibleCount, chunks.length]);

  if (chunks.length === 0) return null;

  if (chunks.length === 1) {
    return <AiChatMarkdown content={chunks[0]!} soft={soft} className={className} />;
  }

  return (
    <div className={className}>
      {chunks.slice(0, visibleCount).map((chunk, index) => (
        <AiChatMarkdown
          key={`md-chunk-${index}`}
          content={chunk}
          soft={soft}
          className={index === 0 ? undefined : 'mt-0'}
        />
      ))}
    </div>
  );
}
