import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { TravelMoment } from '@/types/domain/user/userSocial';
import { useInfiniteScroll } from '@/hooks/browser/useInfiniteScroll';
import { queryKeys } from '@/lib/query/keys';
import {
  fetchTravelMomentsPage,
  TRAVEL_MOMENTS_PAGE_SIZE,
} from '@/services/travelMoments/fetchMomentsPage';
import { travelMomentsFingerprint } from '@/utils/travelMomentsQuery';

export type UseInfiniteTravelMomentsOptions = {
  moments: TravelMoment[];
  authorId?: string;
  activeTag?: string | null;
  pageSize?: number;
  enabled?: boolean;
};

export function useInfiniteTravelMoments({
  moments,
  authorId = 'profile',
  activeTag = null,
  pageSize = TRAVEL_MOMENTS_PAGE_SIZE,
  enabled = true,
}: UseInfiniteTravelMomentsOptions) {
  const fingerprint = travelMomentsFingerprint(moments);

  const query = useInfiniteQuery({
    queryKey: queryKeys.travelMoments.infinite(authorId, activeTag, fingerprint),
    queryFn: ({ pageParam }) =>
      fetchTravelMomentsPage({
        moments,
        offset: pageParam,
        limit: pageSize,
        tag: activeTag,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextOffset : undefined),
    enabled,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data?.pages],
  );

  const total = query.data?.pages[0]?.total ?? 0;
  const hasMore = Boolean(query.hasNextPage);

  const loadMore = async () => {
    if (!hasMore || query.isFetchingNextPage) {
      return;
    }
    await query.fetchNextPage();
  };

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: enabled && hasMore,
    isLoading: query.isFetchingNextPage,
    disabled: !enabled || query.isLoading,
  });

  const retry = () => {
    void query.refetch();
  };

  return {
    items,
    isLoading: query.isFetchingNextPage,
    isReady: query.isSuccess || query.isError,
    hasMore,
    error: query.error ? '加载失败，请稍后重试' : null,
    total,
    loadMore,
    retry,
    sentinelRef,
  };
}
