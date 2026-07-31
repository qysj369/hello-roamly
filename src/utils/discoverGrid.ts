import { DEMO_CURRENT_USER_ID, DEMO_USERS } from '@/data/demoUsers';
import type { DiscoverFeedItem, DiscoverFilters, DiscoverSortMode } from '@/types/domain/discover';
import type { User } from '@/types/domain/user/user';
import { rankDiscoverUsersForViewer } from '@/utils/discoverRecommend';
import { getCountryLabel } from '@/utils/userProfileView';

export type DiscoverGridBuckets = {
  plans: DiscoverFeedItem[];
  moments: DiscoverFeedItem[];
  guides: DiscoverFeedItem[];
};

export function splitDiscoverFeedItems<T extends DiscoverFeedItem>(items: T[]): {
  plans: Array<Extract<T, { kind: 'plan' }> | Extract<T, { kind: 'savedPlan' }>>;
  moments: Extract<T, { kind: 'moment' }>[];
  guides: Extract<T, { kind: 'guide' }>[];
} {
  return {
    plans: items.filter(
      (item): item is Extract<T, { kind: 'plan' }> | Extract<T, { kind: 'savedPlan' }> =>
        item.kind === 'plan' || item.kind === 'savedPlan',
    ),
    moments: items.filter((item): item is Extract<T, { kind: 'moment' }> => item.kind === 'moment'),
    guides: items.filter((item): item is Extract<T, { kind: 'guide' }> => item.kind === 'guide'),
  };
}

function userMatchesDestination(user: User, destination: string): boolean {
  if (user.bio?.includes(destination)) {
    return true;
  }
  return user.visitedCountries.some((code) => {
    const label = getCountryLabel(code);
    return label.includes(destination) || destination.includes(label);
  });
}

/** 热门用户：兴趣推荐或按粉丝人气，尊重发现页筛选 */
export function getDiscoverPopularUsers(
  filters: DiscoverFilters,
  sortMode: DiscoverSortMode = 'recommend',
) {
  const query = filters.q.trim().toLowerCase();

  const filtered = DEMO_USERS.filter((user) => {
    if (user.id === DEMO_CURRENT_USER_ID) {
      return false;
    }

    if (filters.destination && !userMatchesDestination(user, filters.destination)) {
      return false;
    }

    if (filters.travelType && !user.interests.includes(filters.travelType)) {
      return false;
    }

    if (query) {
      const blob = [
        user.username,
        user.bio ?? '',
        user.travelPersonality.title,
        user.travelPersonality.traits.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      if (!blob.includes(query)) {
        return false;
      }
    }

    return true;
  });

  if (sortMode === 'recent') {
    return [...filtered]
      .sort((a, b) => b.followersCount - a.followersCount)
      .map((user) => ({
        ...user,
        recommendScore: 0,
        recommendReasons: [] as string[],
      }));
  }

  return rankDiscoverUsersForViewer(filtered);
}

export const DISCOVER_GUIDES_PREVIEW_LIMIT = 4;

export function getDiscoverGuidesPreview<T extends DiscoverFeedItem>(
  guides: T[],
  limit = DISCOVER_GUIDES_PREVIEW_LIMIT,
): T[] {
  return guides.slice(0, limit);
}

export function shouldShowDiscoverSection(
  filters: DiscoverFilters,
  section: 'plan' | 'moment' | 'user' | 'guide',
): boolean {
  if (section === 'user') {
    return filters.contentType === 'all';
  }
  if (section === 'guide') {
    return filters.contentType === 'all' || filters.contentType === 'guide';
  }
  if (filters.contentType === 'all') {
    return true;
  }
  return filters.contentType === section;
}

export function isDiscoverGuidesPreviewMode(filters: DiscoverFilters): boolean {
  return filters.contentType === 'all';
}

/** 发现流分区排序说明（计划/瞬间/攻略） */
export function getDiscoverSectionSortHint(sortMode: DiscoverSortMode): string | undefined {
  if (sortMode === 'recommend') {
    return '按兴趣匹配度排序';
  }
  return '按发布时间排序';
}

/** 热门用户分区排序说明 */
export function getDiscoverUsersSortHint(sortMode: DiscoverSortMode): string | undefined {
  if (sortMode === 'recommend') {
    return '按兴趣与合拍度排序';
  }
  return '按粉丝人气排序';
}

export function isDiscoverGridEmpty(counts: {
  plans: number;
  moments: number;
  users: number;
  guides: number;
  showPlans: boolean;
  showMoments: boolean;
  showUsers: boolean;
  showGuides: boolean;
}): boolean {
  const total =
    (counts.showPlans ? counts.plans : 0) +
    (counts.showMoments ? counts.moments : 0) +
    (counts.showUsers ? counts.users : 0) +
    (counts.showGuides ? counts.guides : 0);
  return total === 0;
}
