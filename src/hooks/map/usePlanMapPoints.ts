import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryKeys } from '@/lib/query/keys';
import { geocodeTravelPlan } from '@/lib/map/geocodeTravelPlan';
import { buildPlanMapPoints } from '@/lib/map/planMapPoints';
import { hasMapService } from '@/lib/map/provider';
import { useGeneratedPlansStore } from '@/stores/generatedPlans/store';
import type { TravelPlan } from '@/types/domain/travelPlan';

export const planMapPointsQueryKey = (planId: string) =>
  [...queryKeys.plans.mapPoints(planId), 'geo-v9'] as const;

type PlanMapPointsResult = {
  points: ReturnType<typeof buildPlanMapPoints>;
  enrichedPlan: TravelPlan;
  geocodedCount: number;
};

async function fetchPlanMapPoints(plan: TravelPlan): Promise<PlanMapPointsResult> {
  const enrichedPlan = await geocodeTravelPlan(plan);
  const points = buildPlanMapPoints(enrichedPlan);
  const geocodedCount = points.filter((point) => point.geocoded).length;
  return { points, enrichedPlan, geocodedCount };
}

/** 解析行程地图点位（含高德 / Mapbox Geocoding） */
export function usePlanMapPoints(plan: TravelPlan | undefined) {
  const addPlan = useGeneratedPlansStore((state) => state.addPlan);
  const mapReady = hasMapService();

  const query = useQuery({
    queryKey: planMapPointsQueryKey(plan?.id ?? ''),
    queryFn: () => fetchPlanMapPoints(plan!),
    enabled: Boolean(plan && mapReady),
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const fallbackPoints = plan ? buildPlanMapPoints(plan) : [];

  // 地理编码会写回 activity.coordinates；持久化到 generated store 避免详情页重复请求
  useEffect(() => {
    if (!query.data?.enrichedPlan) {
      return;
    }
    addPlan(query.data.enrichedPlan);
  }, [addPlan, query.data?.enrichedPlan]);

  return {
    points: query.data?.points ?? fallbackPoints,
    geocodedCount: query.data?.geocodedCount ?? 0,
    isGeocoding: query.isFetching,
    isGeocodingInitial: query.isLoading && !query.data,
    geocodeError: query.isError ? '地点解析失败，已使用估算位置' : null,
    hasMapService: mapReady,
  };
}
