import type { TravelPlan } from '@/types/domain/travelPlan';
import type { DiscoverFilters } from '@/types/domain/discover';

/** 列表项 memo：同一 plan 引用且展示类 props 未变则跳过重渲染 */
export function areEqualByPlanRef(
  prev: { plan: TravelPlan; className?: string },
  next: { plan: TravelPlan; className?: string },
): boolean {
  return prev.plan === next.plan && prev.className === next.className;
}

export function areTravelPlanCardPropsEqual(
  prev: {
    plan: TravelPlan;
    className?: string;
    duplicateLabel?: string;
    showAction?: boolean;
    showInteractions?: boolean;
  },
  next: {
    plan: TravelPlan;
    className?: string;
    duplicateLabel?: string;
    showAction?: boolean;
    showInteractions?: boolean;
  },
): boolean {
  return (
    prev.plan === next.plan &&
    prev.className === next.className &&
    prev.duplicateLabel === next.duplicateLabel &&
    prev.showAction === next.showAction &&
    prev.showInteractions === next.showInteractions
  );
}

export function areDiscoverFiltersEqual(a: DiscoverFilters, b: DiscoverFilters): boolean {
  return (
    a.q === b.q &&
    a.destination === b.destination &&
    a.travelType === b.travelType &&
    a.timeRange === b.timeRange &&
    a.contentType === b.contentType
  );
}

