/** 流式正文写入 UI 的节流间隔（减轻抖动与 Markdown 重排） */
export const PLAN_STREAM_FLUSH_MS = 200;

export function createThrottledFlusher(flush: () => void, intervalMs = PLAN_STREAM_FLUSH_MS) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const schedule = () => {
    if (timer !== null) {
      return;
    }
    timer = setTimeout(() => {
      timer = null;
      flush();
    }, intervalMs);
  };

  const flushNow = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    flush();
  };

  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return { schedule, flushNow, cancel };
}
