import type { RefObject } from 'react';
import DiscoverEmptyState from '@/components/features/discover/DiscoverEmptyState';
import DiscoverFeedSentinel from '@/components/features/discover/DiscoverFeedSentinel';
import DiscoverGuidesSection from '@/components/features/discover/sections/DiscoverGuidesSection';
import DiscoverMomentsSection from '@/components/features/discover/sections/DiscoverMomentsSection';
import DiscoverPlansSection from '@/components/features/discover/sections/DiscoverPlansSection';
import DiscoverUsersSection from '@/components/features/discover/sections/DiscoverUsersSection';
import {
  useDiscoverGridModel,
  type DiscoverRecommendedUser,
} from '@/hooks/discover/useDiscoverGridModel';
import type {
  DiscoverFilters,
  DiscoverSortMode,
  RecommendedDiscoverItem,
} from '@/types/domain/discover';
import { cn } from '@/utils/cn';

export type { DiscoverRecommendedUser };

export type DiscoverContentGridProps = {
  items: RecommendedDiscoverItem[];
  users: DiscoverRecommendedUser[];
  filters: DiscoverFilters;
  sortMode: DiscoverSortMode;
  sentinelRef: RefObject<HTMLDivElement | null>;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  className?: string;
};

/** 发现页分区网格：仅编排；数据模型见 useDiscoverGridModel */
export default function DiscoverContentGrid({
  items,
  users,
  filters,
  sortMode,
  sentinelRef,
  isLoadingMore = false,
  hasMore = false,
  className,
}: DiscoverContentGridProps) {
  const model = useDiscoverGridModel({ items, users, filters, sortMode });
  const { buckets, visibility, sortHint, usersSortHint, isEmpty } = model;

  if (isEmpty) {
    return <DiscoverEmptyState className={className} />;
  }

  const showInfiniteScroll = visibility.showPlans || visibility.showMoments;

  return (
    <div className={cn('space-y-8', className)}>
      {visibility.showGuides && (
        <DiscoverGuidesSection
          visibleGuides={buckets.visibleGuides}
          guidesTotal={buckets.guidesTotal}
          guidesPreviewMode={visibility.guidesPreviewMode}
          sortHint={sortHint}
        />
      )}

      {visibility.showPlans && (
        <DiscoverPlansSection plans={buckets.plans} sortHint={sortHint} />
      )}

      {visibility.showMoments && (
        <DiscoverMomentsSection moments={buckets.moments} sortHint={sortHint} />
      )}

      {visibility.showUsers && (
        <DiscoverUsersSection users={users} sortHint={usersSortHint} />
      )}

      <DiscoverFeedSentinel
        sentinelRef={sentinelRef}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        showSentinel={showInfiniteScroll}
        feedHasItems={items.length > 0}
      />
    </div>
  );
}
