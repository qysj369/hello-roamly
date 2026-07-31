import { useCallback, useRef, useState } from 'react';
import { generateTravelPlan } from '@/services/ai';
import { useGeneratedPlansStore } from '@/stores/generatedPlans/store';
import type { TravelPlan } from '@/types/domain/travelPlan';
import type { TravelOptions } from '@/types/domain/travelOptions';
import { toErrorMessage } from '@/utils/toErrorMessage';

export type GenerateTravelPlanStatus = 'idle' | 'loading' | 'success' | 'error';

type LastRequest = {
  prompt: string;
  options: TravelOptions;
};

/** 计划生成：与 useAiChat 相同 requestId 模式；成功写入 Zustand 供首页/个人页复用 */
export function useGenerateTravelPlan() {
  const addPlan = useGeneratedPlansStore((state) => state.addPlan);
  const [status, setStatus] = useState<GenerateTravelPlanStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastPlan, setLastPlan] = useState<TravelPlan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const requestIdRef = useRef(0);
  const lastRequestRef = useRef<LastRequest | null>(null);

  const isGenerating = status === 'loading';

  const generate = useCallback(async (
    prompt: string,
    options: TravelOptions = {},
    cfg: { openDialog?: boolean } = {},
  ) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setStatus('error');
      setError('请填写旅行需求或目的地');
      return null;
    }

    lastRequestRef.current = { prompt: trimmedPrompt, options };
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setStatus('loading');
    setError(null);

    try {
      const plan = await generateTravelPlan(trimmedPrompt, options);
      if (requestIdRef.current !== requestId) {
        return null;
      }
      addPlan(plan);
      setLastPlan(plan);
      if (cfg.openDialog !== false) {
        setDialogOpen(true);
      }
      setStatus('success');
      return plan;
    } catch (err) {
      if (requestIdRef.current !== requestId) {
        return null;
      }
      setStatus('error');
      setError(toErrorMessage(err, '生成计划失败，请稍后再试'));
      return null;
    }
  }, [addPlan]);

  const retry = useCallback(async () => {
    const last = lastRequestRef.current;
    if (!last) {
      setError('没有可重试的请求');
      return null;
    }
    return generate(last.prompt, last.options);
  }, [generate]);

  const cancel = useCallback(() => {
    requestIdRef.current += 1; //  bump 后 in-flight 结果会被丢弃
    setStatus('idle');
    setError(null);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    if (status === 'error') {
      setStatus('idle');
    }
  }, [status]);

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    setStatus('idle');
    setError(null);
    setLastPlan(null);
    setDialogOpen(false);
    lastRequestRef.current = null;
  }, []);

  return {
    generate,
    retry,
    cancel,
    reset,
    status,
    isGenerating,
    error,
    lastPlan,
    dialogOpen,
    closeDialog,
    clearError,
  };
}
