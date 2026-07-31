import { useMemo } from 'react';
import { buildTravelPlanJsonLd } from '@/lib/seo/jsonLd/travelPlanJsonLd';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { useJsonLd } from '@/hooks/browser/useJsonLd';

/** 旅行计划详情页结构化数据（TouristTrip + 行程 ItemList） */
export function useTravelPlanJsonLd(plan: TravelPlan | undefined, planId: string | undefined) {
  const jsonLd = useMemo(() => {
    if (!plan || !planId?.trim()) {
      return null;
    }
    return buildTravelPlanJsonLd(plan, planId.trim());
  }, [plan, planId]);

  useJsonLd('travel-plan', jsonLd);
}
