import { useEffect, useState } from 'react';

import { estimateTravelPlanSeconds } from '@/services/ai/travelPlanGenerationLimits';

function buildProgressMessage(elapsedSec: number, days: number): string {
  const estimate = estimateTravelPlanSeconds(days);

  if (elapsedSec < 4) {
    return '正在分析偏好与预算…';
  }
  if (elapsedSec < 12) {
    return '正在编排每日行程…';
  }
  if (elapsedSec < estimate) {
    return `正在生成 ${days} 天行程卡片…`;
  }
  return `行程较长，请稍候…（已等待 ${elapsedSec}s，预计约 ${estimate}s）`;
}

/** 生成行程时的动态进度文案 */
export function usePlanGenerationProgress(active: boolean, days: number) {
  const [message, setMessage] = useState<string | null>(null);
  const [estimateSeconds, setEstimateSeconds] = useState(estimateTravelPlanSeconds(days));

  useEffect(() => {
    if (!active) {
      setMessage(null);
      return;
    }

    const safeDays = Math.max(1, days);
    const estimate = estimateTravelPlanSeconds(safeDays);
    setEstimateSeconds(estimate);

    const startedAt = Date.now();
    setMessage(buildProgressMessage(0, safeDays));

    const timer = window.setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - startedAt) / 1000);
      setMessage(buildProgressMessage(elapsedSec, safeDays));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [active, days]);

  return { message, estimateSeconds };
}
