import { useCallback, useMemo, useState } from 'react';
import type { AiChatContext } from '@/types/domain/aiChat';
import {
  BUDGET_RANGE_LIMITS,
  type AiTravelParams,
  type TravelInterest,
  type TravelPace,
} from '@/types/domain/aiTravelParams';

function parseBudgetHint(budget?: string): Pick<AiTravelParams, 'budgetMin' | 'budgetMax'> {
  const parsed = Number.parseInt(budget ?? '', 10);
  if (Number.isNaN(parsed)) {
    return { budgetMin: 1500, budgetMax: 3500 };
  }
  const max = Math.min(BUDGET_RANGE_LIMITS.max, Math.max(BUDGET_RANGE_LIMITS.min, parsed));
  const min = Math.max(BUDGET_RANGE_LIMITS.min, Math.floor(max * 0.6));
  return { budgetMin: min, budgetMax: max };
}

export function createDefaultTravelParams(context?: AiChatContext): AiTravelParams {
  const budget = parseBudgetHint(context?.budget);
  return {
    ...budget,
    days: context?.days ?? 3,
    interests: ['food', 'culture'],
    pace: 'balanced',
  };
}

type UseAiTravelParamsOptions = {
  initialContext?: AiChatContext;
};

export function useAiTravelParams({ initialContext }: UseAiTravelParamsOptions = {}) {
  const [params, setParams] = useState<AiTravelParams>(() => createDefaultTravelParams(initialContext));

  const setBudgetMin = useCallback((budgetMin: number) => {
    setParams((prev) => {
      const nextMin = Math.min(budgetMin, prev.budgetMax - BUDGET_RANGE_LIMITS.step);
      return { ...prev, budgetMin: Math.max(BUDGET_RANGE_LIMITS.min, nextMin) };
    });
  }, []);

  const setBudgetMax = useCallback((budgetMax: number) => {
    setParams((prev) => {
      const nextMax = Math.max(budgetMax, prev.budgetMin + BUDGET_RANGE_LIMITS.step);
      return { ...prev, budgetMax: Math.min(BUDGET_RANGE_LIMITS.max, nextMax) };
    });
  }, []);

  const setDays = useCallback((days: number) => {
    setParams((prev) => ({ ...prev, days }));
  }, []);

  const setPace = useCallback((pace: TravelPace) => {
    setParams((prev) => ({ ...prev, pace }));
  }, []);

  const toggleInterest = useCallback((interest: TravelInterest) => {
    setParams((prev) => {
      const exists = prev.interests.includes(interest);
      const interests = exists
        ? prev.interests.filter((item) => item !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  }, []);

  const resetParams = useCallback(() => {
    setParams(createDefaultTravelParams(initialContext));
  }, [initialContext]);

  const chatContext = useMemo(
    (): AiChatContext => ({
      ...initialContext,
      days: params.days,
      budget: String(params.budgetMax),
      travelParams: params,
    }),
    [initialContext, params],
  );

  return {
    params,
    chatContext,
    setBudgetMin,
    setBudgetMax,
    setDays,
    setPace,
    toggleInterest,
    resetParams,
  };
}
