import { DEMO_CURRENT_USER_ID, DEMO_USERS } from '@/data/demoUsers';
import { demoGuides } from '@/data/demoGuides';
import { getRecentTravelPlans } from '@/data/recentTravelPlans';
import type { TravelInterest } from '@/types/domain/aiTravelParams';
import type { Guide } from '@/types/domain/guide';
import type {
  DiscoverFeedItem,
  DiscoverFilters,
  DiscoverSortMode,
  DiscoverTimeRange,
  RecommendedDiscoverItem,
} from '@/types/domain/discover';
import { DEFAULT_DISCOVER_FILTERS } from '@/types/domain/discover';
import { INTEREST_TAG_HINTS } from '@/utils/discoverInterest';
import {
  applyDiscoverFeedSort,
  rankDiscoverFeedForViewer,
} from '@/utils/discoverRecommend';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { isEnrichedTravelPlan } from '@/types/domain/travelPlan';
import type { UserAiSessionRecord } from '@/types/api/userAiSessions';
import type { TravelMoment } from '@/types/domain/user/userSocial';
import { canViewTravelMoment } from '@/utils/travelMomentVisibility';
import { getPlanDestination, getPlanGeneratedAt, getPlanStyleTags } from '@/utils/travelPlanView';
import { sessionToDiscoverItem } from '@/utils/userPlanView';

function matchesTimeRange(isoDate: string, range: DiscoverTimeRange): boolean {
  if (range === 'all') {
    return true;
  }
  const date = new Date(isoDate).getTime();
  if (Number.isNaN(date)) {
    return true;
  }
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const cutoff = Date.now() - days * 86_400_000;
  return date >= cutoff;
}

function matchesQuery(text: string, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) {
    return true;
  }
  return text.toLowerCase().includes(query);
}

function matchesDestination(text: string, destination: string): boolean {
  const target = destination.trim();
  if (!target) {
    return true;
  }
  return text.includes(target);
}

function matchesTravelType(tags: string[], travelType: TravelInterest | ''): boolean {
  if (!travelType) {
    return true;
  }
  const hints = INTEREST_TAG_HINTS[travelType];
  return tags.some((tag) => hints.some((hint) => tag.includes(hint)));
}

function filterGuide(guide: Guide, filters: DiscoverFilters): boolean {
  const blob = [guide.city, guide.title, guide.tags.join(' ')].join(' ');
  if (!matchesDestination(blob, filters.destination)) {
    return false;
  }
  if (!matchesTravelType(guide.tags, filters.travelType)) {
    return false;
  }
  if (!matchesTimeRange(guide.updatedAt, filters.timeRange)) {
    return false;
  }
  if (!matchesQuery(blob, filters.q)) {
    return false;
  }
  return true;
}

function filterPlan(plan: TravelPlan, filters: DiscoverFilters): boolean {
  const destination = getPlanDestination(plan);
  const tags = getPlanStyleTags(plan).map((tag) => tag.label);
  const blob = [destination, plan.title, tags.join(' ')].join(' ');
  if (!matchesDestination(blob, filters.destination)) {
    return false;
  }
  if (!matchesTravelType(tags, filters.travelType)) {
    return false;
  }
  const updatedAt = getPlanGeneratedAt(plan);
  if (!matchesTimeRange(updatedAt, filters.timeRange)) {
    return false;
  }
  if (!matchesQuery(blob, filters.q)) {
    return false;
  }
  return true;
}

function filterMoment(moment: TravelMoment, filters: DiscoverFilters): boolean {
  const blob = [
    moment.title ?? '',
    moment.description,
    moment.content,
    moment.location ?? '',
    moment.countryCode ?? '',
    moment.tags.join(' '),
  ].join(' ');
  if (!matchesDestination(blob, filters.destination)) {
    return false;
  }
  if (!matchesTravelType(moment.tags, filters.travelType)) {
    return false;
  }
  if (!matchesTimeRange(moment.createdAt, filters.timeRange)) {
    return false;
  }
  if (!matchesQuery(blob, filters.q)) {
    return false;
  }
  return true;
}

function filterSavedSession(session: UserAiSessionRecord, filters: DiscoverFilters): boolean {
  const blob = [session.title ?? '', session.location.name, session.initialQuery ?? ''].join(' ');
  if (!matchesDestination(blob, filters.destination)) {
    return false;
  }
  if (!matchesTimeRange(session.updatedAt, filters.timeRange)) {
    return false;
  }
  if (!matchesQuery(blob, filters.q)) {
    return false;
  }
  return true;
}

function collectDiscoverFeedItems(
  filters: DiscoverFilters,
  publicSavedSessions: UserAiSessionRecord[] = [],
): DiscoverFeedItem[] {
  const items: DiscoverFeedItem[] = [];

  if (filters.contentType === 'all' || filters.contentType === 'guide') {
    for (const guide of demoGuides) {
      if (!filterGuide(guide, filters)) {
        continue;
      }
      items.push({
        kind: 'guide',
        id: `guide-${guide.id}`,
        guideId: guide.id,
        updatedAt: guide.updatedAt,
      });
    }
  }

  if (filters.contentType === 'all' || filters.contentType === 'plan') {
    for (const plan of getRecentTravelPlans(24)) {
      if (!filterPlan(plan, filters)) {
        continue;
      }
      const updatedAt = isEnrichedTravelPlan(plan)
        ? plan.presentation.generatedAt
        : new Date().toISOString();
      items.push({
        kind: 'plan',
        id: `plan-${plan.id}`,
        planId: plan.id,
        updatedAt,
      });
    }

    for (const session of publicSavedSessions) {
      if (!session.isPublic || !session.isSaved || !filterSavedSession(session, filters)) {
        continue;
      }
      items.push(sessionToDiscoverItem(session));
    }
  }

  if (filters.contentType === 'all' || filters.contentType === 'moment') {
    for (const user of DEMO_USERS) {
      for (const moment of user.travelMoments) {
        if (
          !canViewTravelMoment({
            moment,
            authorId: user.id,
            // TODO: viewerId 改为当前登录用户 ID
            viewerId: DEMO_CURRENT_USER_ID,
            isOwnProfile: user.id === DEMO_CURRENT_USER_ID,
          })
        ) {
          continue;
        }
        if (!filterMoment(moment, filters)) {
          continue;
        }
        items.push({
          kind: 'moment',
          id: `moment-${moment.id}`,
          momentId: moment.id,
          authorId: user.id,
          updatedAt: moment.createdAt,
        });
      }
    }
  }

  return items;
}

/**
 * 在内存中构建发现流并完成排序（演示数据源）。
 *
 * @remarks
 * 流水线：{@link collectDiscoverFeedItems} 过滤 → {@link rankDiscoverFeedForViewer} 个性化打分
 * → {@link applyDiscoverFeedSort} 按 `sortMode` 重排。瞬间入池前执行 `canViewTravelMoment`，
 * 与个人页可见性规则一致。
 *
 * @param filters - 目的地、兴趣、时间范围、内容类型、关键词等筛选条件
 * @param sortMode - `recommend`（默认，按推荐分）或 `recent`（按更新时间）
 * @returns 带 `recommendScore` / `recommendReasons` 的 feed 条目列表
 *
 * @see fetchDiscoverFeed - React Query 层入口（含模拟网络延迟）
 */
export function buildDiscoverFeed(
  filters: DiscoverFilters,
  sortMode: DiscoverSortMode = 'recommend',
  publicSavedSessions: UserAiSessionRecord[] = [],
): RecommendedDiscoverItem[] {
  const items = collectDiscoverFeedItems(filters, publicSavedSessions);
  const ranked = rankDiscoverFeedForViewer(items);
  return applyDiscoverFeedSort(ranked, sortMode);
}

export function countDiscoverFeedResults(
  filters: DiscoverFilters,
  sortMode: DiscoverSortMode = 'recommend',
): number {
  return buildDiscoverFeed(filters, sortMode).length;
}

/** 当筛选过严时，逐步放宽条件直到有结果 */
export function suggestRelaxedDiscoverFilters(filters: DiscoverFilters): DiscoverFilters | null {
  const attempts: DiscoverFilters[] = [
    { ...filters, q: '' },
    { ...filters, q: '', travelType: '' },
    { ...filters, q: '', travelType: '', contentType: 'all' },
    { ...filters, q: '', travelType: '', contentType: 'all', timeRange: 'all' },
    { ...DEFAULT_DISCOVER_FILTERS, destination: filters.destination },
    DEFAULT_DISCOVER_FILTERS,
  ];

  for (const attempt of attempts) {
    if (buildDiscoverFeed(attempt).length > 0) {
      return attempt;
    }
  }

  return null;
}

export function countActiveDiscoverFilters(filters: DiscoverFilters): number {
  let count = 0;
  if (filters.q.trim()) {
    count += 1;
  }
  if (filters.destination) {
    count += 1;
  }
  if (filters.travelType) {
    count += 1;
  }
  if (filters.timeRange !== 'all') {
    count += 1;
  }
  if (filters.contentType !== 'all') {
    count += 1;
  }
  return count;
}

/** 「更多筛选」面板内的条件数量（不含搜索框/目的地） */
export function countAdvancedDiscoverFilters(filters: DiscoverFilters): number {
  let count = 0;
  if (filters.travelType) {
    count += 1;
  }
  if (filters.timeRange !== 'all') {
    count += 1;
  }
  if (filters.contentType !== 'all') {
    count += 1;
  }
  return count;
}
