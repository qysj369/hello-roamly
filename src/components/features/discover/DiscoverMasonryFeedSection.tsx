import { Info } from 'lucide-react';
import { memo, useMemo, useState, type Ref } from 'react';
import {
  DiscoverPinterestMasonry,
  DiscoverSortToggle,
} from '@/components/features/discover';
import DiscoverRecommendExplainDialog from '@/components/features/discover/DiscoverRecommendExplainDialog';
import { useInfiniteDiscoverFeed } from '@/hooks/discover/useInfiniteDiscoverFeed';
import type { DiscoverFilters, DiscoverSortMode } from '@/types/domain/discover';
import { getDiscoverPopularUsers } from '@/utils/discoverGrid';
import { areDiscoverFiltersEqual } from '@/utils/react/memoComparators';

export type DiscoverMasonryFeedSectionProps = {
  filters: DiscoverFilters;
  sortMode: DiscoverSortMode;
  hasActiveFilters: boolean;
  interestSummary: string;
  onSortModeChange: (mode: DiscoverSortMode) => void;
  feedSectionRef: Ref<HTMLDivElement>;
  hotDestinations?: string[];
  onSuggestDestination?: (destination: string) => void;
  onRelaxFilters?: (filters: DiscoverFilters) => void;
};

function DiscoverMasonryFeedSection({
  filters,
  sortMode,
  hasActiveFilters,
  interestSummary,
  onSortModeChange,
  feedSectionRef,
  hotDestinations = [],
  onSuggestDestination,
  onRelaxFilters,
}: DiscoverMasonryFeedSectionProps) {
  const [explainOpen, setExplainOpen] = useState(false);
  const {
    items,
    total,
    hasMore,
    isLoadingMore,
    isInitialLoading,
    sentinelRef,
  } = useInfiniteDiscoverFeed(filters, sortMode);

  const popularUsers = useMemo(
    () => getDiscoverPopularUsers(filters, sortMode),
    [filters, sortMode],
  );

  return (
    <>
      <div
        ref={feedSectionRef}
        className="scroll-mt-[5.5rem] flex flex-wrap items-end justify-between gap-3"
      >
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900 sm:text-sm">
            {hasActiveFilters ? '筛选结果' : '全部内容'}
          </h2>
          <p className="mt-1 text-sm text-slate-500 sm:mt-0.5 sm:text-xs">
            {hasActiveFilters
              ? filters.destination
                ? `「${filters.destination}」· 共 ${total} 条 · 点卡片阅读`
                : filters.q.trim()
                  ? `「${filters.q.trim()}」· 共 ${total} 条 · 点卡片阅读`
                  : `共 ${total} 条 · 点卡片阅读`
              : sortMode === 'recommend'
                ? `按 ${interestSummary} 等兴趣推荐 · 共 ${total} 条`
                : `按最新发布 · 共 ${total} 条`}
          </p>
          {!hasActiveFilters && sortMode === 'recommend' ? (
            <button
              type="button"
              onClick={() => setExplainOpen(true)}
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#2c6b58] hover:underline"
            >
              <Info className="h-3 w-3" aria-hidden />
              了解推荐逻辑
            </button>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <DiscoverSortToggle value={sortMode} onChange={onSortModeChange} />
        </div>
      </div>

      <DiscoverPinterestMasonry
        items={items}
        users={popularUsers}
        filters={filters}
        sortMode={sortMode}
        sentinelRef={sentinelRef}
        isLoadingMore={isLoadingMore}
        isInitialLoading={isInitialLoading}
        hasMore={hasMore}
        hotDestinations={hotDestinations}
        onSuggestDestination={onSuggestDestination}
        onRelaxFilters={onRelaxFilters}
      />

      <DiscoverRecommendExplainDialog open={explainOpen} onClose={() => setExplainOpen(false)} />
    </>
  );
}

export default memo(
  DiscoverMasonryFeedSection,
  (prev, next) =>
    areDiscoverFiltersEqual(prev.filters, next.filters) &&
    prev.sortMode === next.sortMode &&
    prev.hasActiveFilters === next.hasActiveFilters &&
    prev.interestSummary === next.interestSummary &&
    prev.onSortModeChange === next.onSortModeChange &&
    prev.feedSectionRef === next.feedSectionRef &&
    prev.hotDestinations === next.hotDestinations &&
    prev.onSuggestDestination === next.onSuggestDestination &&
    prev.onRelaxFilters === next.onRelaxFilters,
);
