import { memo, useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import {
  DISCOVER_CONTENT_TYPES,
  DISCOVER_TIME_RANGES,
  DISCOVER_TRAVEL_TYPES,
} from '@/data/discoverOptions';
import DiscoverFilterChips from '@/components/features/discover/DiscoverFilterChips';
import type { DiscoverFilters } from '@/types/domain/discover';
import type { TravelInterest } from '@/types/domain/aiTravelParams';
import type { DiscoverContentType, DiscoverTimeRange } from '@/types/domain/discover';
import { PAGE_CONTAINER_PADDING_MATCHED } from '@/lib/layout/pageLayout';
import { getDiscoverSearchDisplayValue } from '@/utils/discoverSearchInput';
import { cn } from '@/utils/cn';
import { areDiscoverFiltersEqual } from '@/utils/react/memoComparators';

export type DiscoverSearchFiltersProps = {
  filters: DiscoverFilters;
  advancedFilterCount: number;
  hasActiveFilters: boolean;
  resultTotal: number;
  isDebouncing?: boolean;
  onSearchChange: (input: string) => void;
  onTravelTypeChange: (travelType: TravelInterest | '') => void;
  onTimeRangeChange: (timeRange: DiscoverTimeRange) => void;
  onContentTypeChange: (contentType: DiscoverContentType) => void;
  onReset: () => void;
  onJumpToFeed?: () => void;
  className?: string;
};

function DiscoverSearchFilters({
  filters,
  advancedFilterCount,
  hasActiveFilters,
  resultTotal,
  isDebouncing = false,
  onSearchChange,
  onTravelTypeChange,
  onTimeRangeChange,
  onContentTypeChange,
  onReset,
  onJumpToFeed,
  className,
}: DiscoverSearchFiltersProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [queryDraft, setQueryDraft] = useState(() => getDiscoverSearchDisplayValue(filters));
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (!isComposingRef.current) {
      setQueryDraft(getDiscoverSearchDisplayValue(filters));
    }
  }, [filters.destination, filters.q]);

  return (
    <section
      className={cn(
        'sticky top-[var(--app-header-offset)] z-30 border-b border-slate-200/90 bg-slate-50/95 py-4 backdrop-blur-md sm:static sm:rounded-2xl sm:border sm:bg-white sm:shadow-sm',
        PAGE_CONTAINER_PADDING_MATCHED,
        className,
      )}
      aria-label="发现页搜索与筛选"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">发现</h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-xs">
            搜关键词，或点下方城市/标签 · 瀑布流立刻更新
          </p>
        </div>
      </div>

      <label className="relative mt-4 block">
        <span className="sr-only">搜索目的地、关键词或标签</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          value={queryDraft}
          onChange={(event) => {
            const next = event.target.value;
            setQueryDraft(next);
            if (!isComposingRef.current) {
              onSearchChange(next);
            }
          }}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionEnd={(event) => {
            isComposingRef.current = false;
            const next = event.currentTarget.value;
            setQueryDraft(next);
            onSearchChange(next);
          }}
          placeholder="搜索目的地、美食、路线…"
          className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-base shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 sm:py-2.5 sm:text-sm"
        />
        {isDebouncing && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
            筛选中…
          </span>
        )}
      </label>

      {hasActiveFilters ? (
        <div
          className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-violet-100 bg-violet-50/80 px-3 py-2"
          aria-live="polite"
          aria-atomic="true"
        >
          {isDebouncing ? (
            <p className="text-xs font-medium text-violet-700">筛选中…</p>
          ) : resultTotal > 0 ? (
            <>
              <p className="text-xs font-medium text-violet-900">
                找到 <span className="font-bold tabular-nums">{resultTotal}</span> 条相关内容
              </p>
              {onJumpToFeed ? (
                <button
                  type="button"
                  onClick={onJumpToFeed}
                  className="inline-flex items-center gap-0.5 text-xs font-semibold text-violet-700 hover:underline"
                >
                  往下看
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : null}
            </>
          ) : (
            <p className="text-xs font-medium text-violet-800">暂无匹配内容，试试换关键词或点下方城市</p>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setFiltersExpanded((open) => !open)}
        className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg px-1 text-sm font-semibold text-violet-700 sm:min-h-0 sm:text-xs"
        aria-expanded={filtersExpanded}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
        更多筛选
        {advancedFilterCount > 0 && (
          <span className="rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {advancedFilterCount}
          </span>
        )}
      </button>

      {filtersExpanded && (
        <div className="mt-3 space-y-3 rounded-xl border border-slate-200/80 bg-white/80 p-3">
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onReset}
                className="text-xs font-semibold text-violet-700 hover:underline"
              >
                重置全部筛选
              </button>
            </div>
          )}
          <DiscoverFilterChips
            label="旅行类型"
            value={filters.travelType}
            options={DISCOVER_TRAVEL_TYPES}
            onChange={onTravelTypeChange}
          />
          <DiscoverFilterChips
            label="发布时间"
            value={filters.timeRange}
            options={DISCOVER_TIME_RANGES}
            onChange={onTimeRangeChange}
          />
          <DiscoverFilterChips
            label="内容类型"
            value={filters.contentType}
            options={DISCOVER_CONTENT_TYPES}
            onChange={onContentTypeChange}
          />
        </div>
      )}
    </section>
  );
}

export default memo(
  DiscoverSearchFilters,
  (prev, next) =>
    areDiscoverFiltersEqual(prev.filters, next.filters) &&
    prev.advancedFilterCount === next.advancedFilterCount &&
    prev.hasActiveFilters === next.hasActiveFilters &&
    prev.resultTotal === next.resultTotal &&
    prev.isDebouncing === next.isDebouncing &&
    prev.className === next.className &&
    prev.onSearchChange === next.onSearchChange &&
    prev.onTravelTypeChange === next.onTravelTypeChange &&
    prev.onTimeRangeChange === next.onTimeRangeChange &&
    prev.onContentTypeChange === next.onContentTypeChange &&
    prev.onReset === next.onReset &&
    prev.onJumpToFeed === next.onJumpToFeed,
);
