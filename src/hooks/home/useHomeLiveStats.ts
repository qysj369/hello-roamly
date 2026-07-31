import { useEffect, useMemo, useState } from 'react';
import { useDocumentVisible } from '@/hooks/browser/useDocumentVisible';
import { useAnimatedCounter } from '@/hooks/home/useAnimatedCounter';
import {
  clampLiveStat,
  countDemoMomentsPublishedToday,
  getHomeAiChatsSeed,
} from '@/utils/homeLiveStats';

const AI_MIN = 8;
const AI_MAX = 52;
const MOMENTS_MAX = 99;

/** 首页 Hero 动态指标：AI 服务中对话数、今日瞬间（含模拟增量） */
export function useHomeLiveStats() {
  const documentVisible = useDocumentVisible();
  const momentsSeed = useMemo(() => {
    const real = countDemoMomentsPublishedToday();
    return Math.max(real, 4);
  }, []);

  const [aiChatsTarget, setAiChatsTarget] = useState(getHomeAiChatsSeed);
  const [momentsTarget, setMomentsTarget] = useState(momentsSeed);

  const aiChats = useAnimatedCounter(aiChatsTarget);
  const momentsToday = useAnimatedCounter(momentsTarget);

  useEffect(() => {
    if (!documentVisible) {
      return undefined;
    }

    const tickAi = window.setInterval(() => {
      setAiChatsTarget((prev) => {
        const delta = Math.random() > 0.42 ? 1 : -1;
        return clampLiveStat(prev + delta, AI_MIN, AI_MAX);
      });
    }, 9000);

    const tickMoments = window.setInterval(() => {
      if (Math.random() > 0.55) {
        setMomentsTarget((prev) => clampLiveStat(prev + 1, momentsSeed, MOMENTS_MAX));
      }
    }, 14000);

    return () => {
      window.clearInterval(tickAi);
      window.clearInterval(tickMoments);
    };
  }, [documentVisible, momentsSeed]);

  return {
    aiChats,
    momentsToday,
    aiLabel: '正在服务的 AI 对话',
    momentsLabel: '今日新发布旅行瞬间',
  };
}
