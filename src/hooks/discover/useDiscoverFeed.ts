import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useDebouncedValue } from '@/hooks/browser/useDebouncedValue';
import { queryKeys } from '@/lib/query/keys';
import { fetchDiscoverFeed } from '@/services/discover/fetchDiscoverFeed';
import type { DiscoverFilters, DiscoverSortMode } from '@/types/domain/discover';

export const DISCOVER_FEED_DEBOUNCE_MS = 220;

export function useDiscoverFeed(
  filters: DiscoverFilters,
  sortMode: DiscoverSortMode = 'recommend',
  debounceMs = DISCOVER_FEED_DEBOUNCE_MS,
) {
  const debouncedQuery = useDebouncedValue(filters.q, debounceMs);

  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      q: debouncedQuery,
    }),
    [filters, debouncedQuery],
  );

  const query = useQuery({
    queryKey: queryKeys.discover.feed(effectiveFilters, sortMode),
    queryFn: () => fetchDiscoverFeed(effectiveFilters, sortMode),
    placeholderData: keepPreviousData,
  });

  const items = query.data ?? [];

  return {
    items,
    total: items.length,
    isDebouncing: filters.q !== debouncedQuery,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
