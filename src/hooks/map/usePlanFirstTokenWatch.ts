import { useEffect, useState } from 'react';

/** 首字超过该时间仍未出现，视为偏慢（提示用户可停止/重试） */
export const PLAN_FIRST_TOKEN_SLOW_MS = 12_000;

type UsePlanFirstTokenWatchOptions = {
  /** 是否正在等待规划输出 */
  active: boolean;
  /** 是否已有可读正文（首字已到） */
  hasContent: boolean;
  slowAfterMs?: number;
};

/** 规划流式：监测「长时间无首字」 */
export function usePlanFirstTokenWatch({
  active,
  hasContent,
  slowAfterMs = PLAN_FIRST_TOKEN_SLOW_MS,
}: UsePlanFirstTokenWatchOptions): { waitingTooLong: boolean } {
  const [waitingTooLong, setWaitingTooLong] = useState(false);

  useEffect(() => {
    if (!active || hasContent) {
      setWaitingTooLong(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setWaitingTooLong(true);
    }, slowAfterMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [active, hasContent, slowAfterMs]);

  return { waitingTooLong };
}
