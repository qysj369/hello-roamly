import { findUserById } from '@/data/findUserById';
import { demoGuides } from '@/data/demoGuides';
import { findTravelPlanById } from '@/data/findTravelPlan';
import {
  guideDetailPath,
  savedUserPlanDetailPath,
  travelPlanDetailPath,
  userProfilePath,
} from '@/router/paths';
import {
  DEFAULT_DISCOVER_FILTERS,
  type DiscoverFeedItem,
  type RecommendedDiscoverItem,
} from '@/types/domain/discover';
import { buildDiscoverFeed } from '@/utils/discoverContent';
import { getGuideCoverUrl, getMomentCoverUrl, getPlanCoverImage } from '@/utils/discoverMedia';
import { getPlanDestination } from '@/utils/travelPlanView';
import { getSavedUserPlanCoverUrl } from '@/utils/userPlanView';
import { pickRecommendedHotPicks } from '@/utils/discoverRecommend';

export function getHotPickHref(item: DiscoverFeedItem): string {
  if (item.kind === 'guide') {
    return guideDetailPath(item.guideId);
  }
  if (item.kind === 'plan') {
    return travelPlanDetailPath(item.planId);
  }
  if (item.kind === 'savedPlan') {
    return savedUserPlanDetailPath(item.userPlanId);
  }
  return userProfilePath(item.authorId);
}

/** 热门推荐：基于用户兴趣得分 + 类型多样性 */
export function getDiscoverHotPicks(limit = 8): RecommendedDiscoverItem[] {
  const pool = buildDiscoverFeed(DEFAULT_DISCOVER_FILTERS);
  return pickRecommendedHotPicks(pool, limit);
}

export type DiscoverHotPickPreview = {
  item: RecommendedDiscoverItem;
  title: string;
  subtitle: string;
  coverUrl: string;
  badge: string;
  /** 用于发现页一键筛选 */
  destinationHint?: string;
};

export function resolveHotPickPreview(item: RecommendedDiscoverItem): DiscoverHotPickPreview | null {
  if (item.kind === 'guide') {
    const guide = demoGuides.find((entry) => entry.id === item.guideId);
    if (!guide) {
      return null;
    }
    return {
      item,
      title: guide.title,
      subtitle: `${guide.city} · ${guide.budget}`,
      coverUrl: getGuideCoverUrl(guide),
      badge: '热门攻略',
      destinationHint: guide.city,
    };
  }

  if (item.kind === 'plan') {
    const plan = findTravelPlanById(item.planId);
    if (!plan) {
      return null;
    }
    return {
      item,
      title: plan.title,
      subtitle: plan.tags.slice(0, 2).join(' · ') || 'AI 漫行计划',
      coverUrl: getPlanCoverImage(plan),
      badge: '精选计划',
      destinationHint: getPlanDestination(plan).split(/[·•]/)[0]?.trim(),
    };
  }

  if (item.kind === 'savedPlan') {
    return {
      item,
      title: item.title,
      subtitle: `${item.locationName} · 蜗友公开方案`,
      coverUrl: getSavedUserPlanCoverUrl(item.userPlanId, item.locationName),
      badge: '漫行方案',
      destinationHint: item.locationName,
    };
  }

  const user = findUserById(item.authorId);
  const moment = user?.travelMoments.find((entry) => entry.id === item.momentId);
  if (!moment || !user) {
    return null;
  }

  return {
    item,
    title: moment.title ?? moment.description.slice(0, 32),
    subtitle: `${user.username}${moment.location ? ` · ${moment.location}` : ''}`,
    coverUrl: getMomentCoverUrl(moment),
    badge: '旅行瞬间',
    destinationHint: moment.location ?? undefined,
  };
}
