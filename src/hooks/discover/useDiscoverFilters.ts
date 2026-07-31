import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TravelInterest } from '@/types/domain/aiTravelParams';
import {
  DEFAULT_DISCOVER_FILTERS,
  DEFAULT_DISCOVER_SORT_MODE,
  type DiscoverContentType,
  type DiscoverFilters,
  type DiscoverSortMode,
  type DiscoverTimeRange,
} from '@/types/domain/discover';
import { countActiveDiscoverFilters, countAdvancedDiscoverFilters } from '@/utils/discoverContent';

/** 发现页筛选与 sort 同步到 URL，便于分享链接与浏览器后退保留状态 */

function parseSortMode(params: URLSearchParams): DiscoverSortMode {
  const sort = params.get('sort');
  return sort === 'recent' ? 'recent' : DEFAULT_DISCOVER_SORT_MODE;
}

function parseFilters(params: URLSearchParams): DiscoverFilters {
  const travelType = params.get('type') ?? '';
  const validInterests: TravelInterest[] = ['food', 'culture', 'adventure', 'shopping', 'nature'];

  return {
    q: params.get('q') ?? '',
    destination: params.get('dest') ?? '',
    travelType: validInterests.includes(travelType as TravelInterest)
      ? (travelType as TravelInterest)
      : '',
    timeRange: (['all', '7d', '30d', '90d'].includes(params.get('time') ?? '')
      ? params.get('time')
      : 'all') as DiscoverTimeRange,
    contentType: (['all', 'guide', 'plan', 'moment'].includes(params.get('kind') ?? '')
      ? params.get('kind')
      : 'all') as DiscoverContentType,
  };
}

function filtersToSearchParams(filters: DiscoverFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q.trim()) {
    params.set('q', filters.q.trim());
  }
  if (filters.destination) {
    params.set('dest', filters.destination);
  }
  if (filters.travelType) {
    params.set('type', filters.travelType);
  }
  if (filters.timeRange !== 'all') {
    params.set('time', filters.timeRange);
  }
  if (filters.contentType !== 'all') {
    params.set('kind', filters.contentType);
  }
  return params;
}

function sortModeToSearchParams(sortMode: DiscoverSortMode, params: URLSearchParams) {
  if (sortMode !== DEFAULT_DISCOVER_SORT_MODE) {
    params.set('sort', sortMode);
  } else {
    params.delete('sort');
  }
}

export function useDiscoverFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const sortMode = useMemo(() => parseSortMode(searchParams), [searchParams]);

  const activeFilterCount = useMemo(() => countActiveDiscoverFilters(filters), [filters]);
  const advancedFilterCount = useMemo(() => countAdvancedDiscoverFilters(filters), [filters]);

  const patchFilters = useCallback(
    (patch: Partial<DiscoverFilters>) => {
      const next = { ...filters, ...patch };
      const params = filtersToSearchParams(next);
      sortModeToSearchParams(sortMode, params);
      setSearchParams(params, { replace: true });
    },
    [filters, sortMode, setSearchParams],
  );

  const setSortMode = useCallback(
    (nextSort: DiscoverSortMode) => {
      const params = filtersToSearchParams(filters);
      sortModeToSearchParams(nextSort, params);
      setSearchParams(params, { replace: true });
    },
    [filters, setSearchParams],
  );

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams();
    sortModeToSearchParams(sortMode, params);
    setSearchParams(params, { replace: true });
  }, [sortMode, setSearchParams]);

  const setQuery = useCallback((q: string) => patchFilters({ q }), [patchFilters]);
  const setDestination = useCallback(
    (destination: string) => patchFilters({ destination }),
    [patchFilters],
  );
  const setTravelType = useCallback(
    (travelType: TravelInterest | '') => patchFilters({ travelType }),
    [patchFilters],
  );
  const setTimeRange = useCallback(
    (timeRange: DiscoverTimeRange) => patchFilters({ timeRange }),
    [patchFilters],
  );
  const setContentType = useCallback(
    (contentType: DiscoverContentType) => patchFilters({ contentType }),
    [patchFilters],
  );

  return {
    filters,
    sortMode,
    activeFilterCount,
    advancedFilterCount,
    hasActiveFilters: activeFilterCount > 0,
    patchFilters,
    setQuery,
    setDestination,
    setTravelType,
    setTimeRange,
    setContentType,
    setSortMode,
    resetFilters,
  };
}

export { DEFAULT_DISCOVER_FILTERS };
