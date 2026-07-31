import { useEffect, useState } from 'react';
import { useGlobalMapPlanningStore } from '@/stores/globalMapPlanning/store';

const PLAN_LOADING_MESSAGES = [
  '已收到需求，正在连接 AI…',
  '正在撰写简介与行程…',
  '行程出来后会接着补蜗牛提示…',
  '马上呈现完整方案…',
] as const;

/** 规划加载态：优先展示服务端阶段文案 */
export function usePlanLoadingMessage(active: boolean): string {
  const serverStatus = useGlobalMapPlanningStore((state) =>
    active ? state.planStreamStatus : null,
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setIndex(0);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => Math.min(current + 1, PLAN_LOADING_MESSAGES.length - 1));
    }, 2800);

    return () => {
      window.clearInterval(timer);
    };
  }, [active]);

  if (serverStatus?.trim()) {
    return serverStatus.trim();
  }

  return PLAN_LOADING_MESSAGES[index] ?? PLAN_LOADING_MESSAGES[0];
}
