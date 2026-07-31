import { useCallback, useEffect, useMemo, useState } from 'react';
import { useInfiniteScroll } from '@/hooks/browser/useInfiniteScroll';
import { useDiscoverFeed } from '@/hooks/discover/useDiscoverFeed';
import type { DiscoverFilters, DiscoverSortMode } from '@/types/domain/discover';

export const DISCOVER_FEED_PAGE_SIZE = 12;

export function useInfiniteDiscoverFeed(
  filters: DiscoverFilters,
  sortMode: DiscoverSortMode = 'recommend',
) {
  const { items: allItems, total, isDebouncing } = useDiscoverFeed(filters, sortMode);
  const [visibleCount, setVisibleCount] = useState<number>(DISCOVER_FEED_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  useEffect(() => {
    setVisibleCount(DISCOVER_FEED_PAGE_SIZE);
    setIsLoadingMore(false);
  }, [allItems]);

  const items = useMemo(
    () => allItems.slice(0, visibleCount),
    [allItems, visibleCount],
  );

  const hasMore = visibleCount < allItems.length;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) {
      return;
    }
    setIsLoadingMore(true);
    setVisibleCount((count) => Math.min(count + DISCOVER_FEED_PAGE_SIZE, allItems.length));
    setIsLoadingMore(false);
  }, [allItems.length, hasMore, isLoadingMore]);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isLoadingMore,
    disabled: allItems.length === 0,
  });

  return {
    items,
    total,
    isDebouncing,
    hasMore,
    isLoadingMore,
    isInitialLoading: isDebouncing && items.length === 0,
    sentinelRef,
    loadMore,
  };
}
