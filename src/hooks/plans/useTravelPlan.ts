import { useMemo } from 'react';
import { findTravelPlanById } from '@/data/findTravelPlan';
import { useGeneratedPlansStore } from '@/stores/generatedPlans/store';

export function useTravelPlan(planId: string | undefined) {
  const generatedPlans = useGeneratedPlansStore((state) => state.plans);

  return useMemo(() => {
    if (!planId?.trim()) {
      return undefined;
    }
    return findTravelPlanById(planId.trim(), generatedPlans);
  }, [generatedPlans, planId]);
}
