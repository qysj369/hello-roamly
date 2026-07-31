import { useMemo } from 'react';
import { useGuideList } from '@/hooks/api/useGuideList';
import { useDebouncedValue } from '@/hooks/browser/useDebouncedValue';
import { useUiStore } from '@/stores';

/** 攻略列表：Zustand 搜索词 + 防抖 + services/guides 数据 */
export function useFilteredGuides(debounceMs = 200) {
  const searchQuery = useUiStore((state) => state.searchQuery);
  const debouncedQuery = useDebouncedValue(searchQuery, debounceMs);

  const listParams = useMemo(() => ({ q: debouncedQuery.trim() || undefined }), [debouncedQuery]);

  const { data, isFetching, isPending, error } = useGuideList(listParams);

  return {
    searchQuery,
    debouncedQuery,
    guides: data?.items ?? [],
    total: data?.total ?? 0,
    isDebouncing: searchQuery !== debouncedQuery,
    isLoading: isPending || isFetching,
    error,
  };
}
