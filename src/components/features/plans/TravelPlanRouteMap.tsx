import { useMemo } from 'react';
import MapServicePlaceholder from '@/components/features/map/MapServicePlaceholder';
import AmapPlanRouteMap from '@/components/features/plans/AmapPlanRouteMap';
import MapboxPlanRouteMap from '@/components/features/plans/MapboxPlanRouteMap';
import { hasMapService, resolveMapProvider } from '@/lib/map/provider';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { cn } from '@/utils/cn';

export type TravelPlanRouteMapProps = {
  plan: TravelPlan;
  className?: string;
};

/** 行程路线地图：自动选择高德（优先）或 Mapbox */
export default function TravelPlanRouteMap({ plan, className }: TravelPlanRouteMapProps) {
  const provider = useMemo(() => resolveMapProvider(), []);

  if (!hasMapService() || !provider) {
    return (
      <section className={cn('mt-6 border-t border-slate-200/90 pt-6', className)}>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">行程地图</h2>
        <MapServicePlaceholder className="min-h-56" compact />
      </section>
    );
  }

  if (provider === 'amap') {
    return <AmapPlanRouteMap plan={plan} className={className} />;
  }

  return <MapboxPlanRouteMap plan={plan} className={className} />;
}
