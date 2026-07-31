import DiscoverSearchFilters from '@/components/features/discover/DiscoverSearchFilters';
import { useDebouncedValue } from '@/hooks/browser/useDebouncedValue';
import { DISCOVER_FEED_DEBOUNCE_MS } from '@/hooks/discover/useDiscoverFeed';
import type { DiscoverFilters } from '@/types/domain/discover';
import type { TravelInterest } from '@/types/domain/aiTravelParams';
import type { DiscoverContentType, DiscoverTimeRange } from '@/types/domain/discover';

type DiscoverSearchFiltersSectionProps = {
  filters: DiscoverFilters;
  advancedFilterCount: number;
  hasActiveFilters: boolean;
  resultTotal: number;
  onSearchChange: (input: string) => void;
  onTravelTypeChange: (travelType: TravelInterest | '') => void;
  onTimeRangeChange: (timeRange: DiscoverTimeRange) => void;
  onContentTypeChange: (contentType: DiscoverContentType) => void;
  onReset: () => void;
  onJumpToFeed: () => void;
};

/** 发现页筛选条：状态由 DiscoverPage 统一管理 */
export default function DiscoverSearchFiltersSection({
  filters,
  advancedFilterCount,
  hasActiveFilters,
  resultTotal,
  onSearchChange,
  onTravelTypeChange,
  onTimeRangeChange,
  onContentTypeChange,
  onReset,
  onJumpToFeed,
}: DiscoverSearchFiltersSectionProps) {
  const debouncedQuery = useDebouncedValue(filters.q, DISCOVER_FEED_DEBOUNCE_MS);
  const debouncedDestination = useDebouncedValue(filters.destination, DISCOVER_FEED_DEBOUNCE_MS);
  const isDebouncing =
    filters.q !== debouncedQuery || filters.destination !== debouncedDestination;

  return (
    <DiscoverSearchFilters
      filters={filters}
      advancedFilterCount={advancedFilterCount}
      hasActiveFilters={hasActiveFilters}
      resultTotal={resultTotal}
      isDebouncing={isDebouncing}
      onSearchChange={onSearchChange}
      onTravelTypeChange={onTravelTypeChange}
      onTimeRangeChange={onTimeRangeChange}
      onContentTypeChange={onContentTypeChange}
      onReset={onReset}
      onJumpToFeed={onJumpToFeed}
    />
  );
}
