import { useMemo } from 'react';
import type {
  DiscoverFilters,
  DiscoverSortMode,
  RecommendedDiscoverItem,
} from '@/types/domain/discover';
import type { User } from '@/types/domain/user/user';
import {
  getDiscoverGuidesPreview,
  getDiscoverSectionSortHint,
  getDiscoverUsersSortHint,
  isDiscoverGridEmpty,
  isDiscoverGuidesPreviewMode,
  shouldShowDiscoverSection,
  splitDiscoverFeedItems,
} from '@/utils/discoverGrid';

export type DiscoverRecommendedUser = User & {
  recommendScore: number;
  recommendReasons: string[];
};

export type UseDiscoverGridModelInput = {
  items: RecommendedDiscoverItem[];
  users: DiscoverRecommendedUser[];
  filters: DiscoverFilters;
  sortMode: DiscoverSortMode;
};

/** 发现页内容网格：分区数据与可见性（无 UI） */
export function useDiscoverGridModel({
  items,
  users,
  filters,
  sortMode,
}: UseDiscoverGridModelInput) {
  return useMemo(() => {
    const { plans, moments, guides } = splitDiscoverFeedItems(items);
    const guidesPreviewMode = isDiscoverGuidesPreviewMode(filters);
    const visibleGuides = guidesPreviewMode ? getDiscoverGuidesPreview(guides) : guides;

    const visibility = {
      showPlans: shouldShowDiscoverSection(filters, 'plan'),
      showMoments: shouldShowDiscoverSection(filters, 'moment'),
      showUsers: shouldShowDiscoverSection(filters, 'user'),
      showGuides: shouldShowDiscoverSection(filters, 'guide'),
      guidesPreviewMode,
    };

    const sortHint = getDiscoverSectionSortHint(sortMode);
    const usersSortHint = getDiscoverUsersSortHint(sortMode);

    const isEmpty = isDiscoverGridEmpty({
      plans: plans.length,
      moments: moments.length,
      users: users.length,
      guides: visibleGuides.length,
      showPlans: visibility.showPlans,
      showMoments: visibility.showMoments,
      showUsers: visibility.showUsers,
      showGuides: visibility.showGuides,
    });

    return {
      buckets: { plans, moments, guides, visibleGuides, guidesTotal: guides.length },
      visibility,
      sortHint,
      usersSortHint,
      isEmpty,
    };
  }, [filters, items, sortMode, users]);
}
