import { Loader2, Sparkles, Users } from 'lucide-react';
import { memo, useMemo } from 'react';
import type { Ref, RefObject } from 'react';
import DiscoverMasonryCard from '@/components/features/discover/DiscoverMasonryCard';
import DiscoverMasonryPinSkeleton from '@/components/features/discover/DiscoverMasonryPinSkeleton';
import DiscoverPopularUserCard from '@/components/features/discover/DiscoverPopularUserCard';
import { useDiscoverMasonryColumns } from '@/hooks/discover/useDiscoverMasonryColumns';
import type { DiscoverFilters, DiscoverSortMode, RecommendedDiscoverItem } from '@/types/domain/discover';
import type { User } from '@/types/domain/user/user';
import {
  buildMasonryPinEntries,
  distributeMasonryColumns,
  filterMasonryFeedItems,
} from '@/utils/discoverMasonry';
import { shouldShowDiscoverSection } from '@/utils/discoverGrid';
import { suggestRelaxedDiscoverFilters } from '@/utils/discoverContent';
import { getDiscoverHotPicks, resolveHotPickPreview } from '@/utils/discoverHotPicks';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { cn } from '@/utils/cn';
import { areDiscoverFiltersEqual } from '@/utils/react/memoComparators';

type RecommendedUser = User & { recommendScore: number; recommendReasons: string[] };

export type DiscoverPinterestMasonryProps = {
  items: RecommendedDiscoverItem[];
  users: RecommendedUser[];
  filters: DiscoverFilters;
  sortMode: DiscoverSortMode;
  sentinelRef: RefObject<HTMLDivElement | null>;
  isLoadingMore?: boolean;
  isInitialLoading?: boolean;
  hasMore?: boolean;
  className?: string;
  hotDestinations?: string[];
  onSuggestDestination?: (destination: string) => void;
  onRelaxFilters?: (filters: DiscoverFilters) => void;
};

function DiscoverPinterestMasonry({
  items,
  users,
  filters,
  sortMode,
  sentinelRef,
  isLoadingMore = false,
  isInitialLoading = false,
  hasMore = false,
  className,
  hotDestinations = [],
  onSuggestDestination,
  onRelaxFilters,
}: DiscoverPinterestMasonryProps) {
  const columnCount = useDiscoverMasonryColumns();
  const feedItems = useMemo(
    () => filterMasonryFeedItems(items, filters.contentType),
    [items, filters.contentType],
  );
  const showUsers = shouldShowDiscoverSection(filters, 'user');
  const showMasonry =
    filters.contentType === 'all' ||
    filters.contentType === 'guide' ||
    filters.contentType === 'plan' ||
    filters.contentType === 'moment';

  const columns = useMemo(() => {
    const entries = buildMasonryPinEntries(feedItems);
    return distributeMasonryColumns(entries, columnCount);
  }, [feedItems, columnCount]);

  const isEmpty = (showMasonry ? feedItems.length : 0) + (showUsers ? users.length : 0) === 0;
  const relaxedFilters = useMemo(
    () => (isEmpty ? suggestRelaxedDiscoverFilters(filters) : null),
    [filters, isEmpty],
  );
  const fallbackPreviews = useMemo(
    () =>
      getDiscoverHotPicks(4)
        .map((item) => resolveHotPickPreview(item))
        .filter((entry): entry is NonNullable<typeof entry> => entry != null),
    [],
  );

  if (!isInitialLoading && isEmpty) {
    const destination = filters.destination.trim();
    const uncovered = destination && !hotDestinations.includes(destination);
    return (
      <div
        className={cn(
          'overflow-hidden rounded-2xl border border-dashed border-[#b7cdc4] bg-gradient-to-b from-emerald-50/80 to-[#fffef6] px-4 py-8 text-center',
          className,
        )}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-[#2c6b58]">
          <Sparkles className="h-6 w-6" aria-hidden />
        </div>
        <p className="mt-3 text-base font-semibold text-slate-800">
          {uncovered
            ? `「${destination}」的内容还在路上`
            : destination
              ? `「${destination}」下暂时没有匹配内容`
              : '这组筛选太严格啦'}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          换个目的地或标签，下面这些地方一定有惊喜
        </p>

        {fallbackPreviews.length > 0 && onSuggestDestination ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {fallbackPreviews.map((pick) => (
              <button
                key={pick.item.id}
                type="button"
                onClick={() => {
                  if (pick.destinationHint && onSuggestDestination) {
                    onSuggestDestination(pick.destinationHint);
                  }
                }}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#b7cdc4] hover:border-[#b7cdc4]"
              >
                <div className="relative aspect-[4/3] w-full">
                  <OptimizedImage
                    src={pick.coverUrl}
                    alt={pick.title}
                    fill
                    sizes="160px"
                    className="transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-2">
                  <p className="line-clamp-1 text-xs font-semibold text-slate-800">{pick.title}</p>
                  <p className="mt-0.5 text-[10px] text-[#2c6b58]">点我探索 →</p>
                </div>
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {relaxedFilters && onRelaxFilters ? (
            <button
              type="button"
              onClick={() => onRelaxFilters(relaxedFilters)}
              className="rounded-full bg-[#2c6b58] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#245a4a]"
            >
              放宽筛选，看更多内容
            </button>
          ) : null}
          {hotDestinations.length > 0 && onSuggestDestination
            ? hotDestinations.slice(0, 4).map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => onSuggestDestination(city)}
                  className="rounded-full border border-[#b7cdc4] bg-emerald-50 px-3 py-1.5 text-xs font-medium text-[#2c6b58] hover:bg-emerald-50"
                >
                  看 {city}
                </button>
              ))
            : null}
        </div>
      </div>
    );
  }

  const userSortHint =
    sortMode === 'recommend' ? '按兴趣与合拍度' : '按粉丝人气';

  const gapClass = 'gap-3 sm:gap-4 md:gap-4 lg:gap-5 xl:gap-6';

  return (
    <div className={cn('space-y-6', className)}>
      {showUsers && users.length > 0 && (
        <section aria-labelledby="discover-masonry-users-title" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3
              id="discover-masonry-users-title"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-900"
            >
              <Users className="h-4 w-4 text-[#2c6b58]" aria-hidden />
              热门旅人
            </h3>
            <span className="text-[10px] text-slate-400">{userSortHint}</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {users.map((user) => (
              <div key={user.id} className="w-[148px] shrink-0">
                <DiscoverPopularUserCard
                  user={user}
                  recommendScore={user.recommendScore}
                  recommendReasons={user.recommendReasons}
                  className="h-full p-3"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {showMasonry && (isInitialLoading || feedItems.length > 0) && (
        <div
          className={cn('flex', gapClass)}
          role="list"
          aria-label="发现瀑布流"
          aria-busy={isInitialLoading}
        >
          {Array.from({ length: columnCount }, (_, columnIndex) => (
            <div
              key={columnIndex}
              className={cn('flex min-w-0 flex-1 flex-col', gapClass)}
              role="presentation"
            >
              {isInitialLoading ? (
                <DiscoverMasonryPinSkeleton count={columnIndex === 0 ? 3 : 2} />
              ) : (
                (columns[columnIndex] ?? []).map(({ item, pinSize }) => (
                  <div key={item.id} role="listitem">
                    <DiscoverMasonryCard
                      item={item}
                      recommendScore={item.recommendScore}
                      recommendReasons={item.recommendReasons}
                      pinSize={pinSize}
                      layout="pinterest"
                    />
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}

      {showMasonry && !isInitialLoading && isLoadingMore && (
        <div className={cn('flex', gapClass)} aria-hidden>
          {Array.from({ length: columnCount }, (_, columnIndex) => (
            <div key={columnIndex} className={cn('flex min-w-0 flex-1 flex-col', gapClass)}>
              <DiscoverMasonryPinSkeleton count={1} />
            </div>
          ))}
        </div>
      )}

      {showMasonry && (
        <div className="py-2">
          <div ref={sentinelRef as Ref<HTMLDivElement>} className="h-px w-full" aria-hidden />
          {isLoadingMore && (
            <p className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-[#2c6b58]" aria-hidden />
              加载更多 Pin…
            </p>
          )}
          {!isLoadingMore && !hasMore && feedItems.length > 0 && !isInitialLoading && (
            <p className="text-center text-xs text-slate-400">瀑布流已浏览完毕</p>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(
  DiscoverPinterestMasonry,
  (prev, next) =>
    prev.items === next.items &&
    prev.users === next.users &&
    areDiscoverFiltersEqual(prev.filters, next.filters) &&
    prev.sortMode === next.sortMode &&
    prev.isLoadingMore === next.isLoadingMore &&
    prev.isInitialLoading === next.isInitialLoading &&
    prev.hasMore === next.hasMore &&
    prev.sentinelRef === next.sentinelRef &&
    prev.className === next.className &&
    prev.hotDestinations === next.hotDestinations &&
    prev.onSuggestDestination === next.onSuggestDestination &&
    prev.onRelaxFilters === next.onRelaxFilters,
);
