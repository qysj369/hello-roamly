import { DISCOVER_CHINA_CITIES } from '@/data/discoverChinaCities';
import { DEMO_CURRENT_USER_ID, DEMO_USERS } from '@/data/demoUsers';
import { demoGuides } from '@/data/demoGuides';
import { getRecentTravelPlans } from '@/data/recentTravelPlans';
import { getPlanDestination, getPlanStyleTags } from '@/utils/travelPlanView';
import { canViewTravelMoment } from '@/utils/travelMomentVisibility';

export type DiscoverTrendDestination = {
  label: string;
  /** 用于发现页 destination 筛选 */
  value: string;
  count: number;
  rank: number;
};

export type DiscoverTrendTag = {
  label: string;
  count: number;
  rank: number;
};

export type DiscoverTrendsSnapshot = {
  destinations: DiscoverTrendDestination[];
  tags: DiscoverTrendTag[];
  updatedAt: string;
};

const KNOWN_CITY_LABELS = [...new Set([...DISCOVER_CHINA_CITIES, ...demoGuides.map((guide) => guide.city)])];

function increment(map: Map<string, number>, key: string, weight = 1) {
  const normalized = key.trim();
  if (!normalized) {
    return;
  }
  map.set(normalized, (map.get(normalized) ?? 0) + weight);
}

function resolveCityFromLocation(location: string): string | null {
  const text = location.trim();
  if (!text) {
    return null;
  }

  for (const city of KNOWN_CITY_LABELS) {
    if (text.includes(city)) {
      return city;
    }
  }

  // 瞬间 location 常为「国家·城市」；取末段且限制长度，避免整句当地名误入趋势榜
  const tail = text.split(/[·•]/).pop()?.trim();
  if (tail && tail.length <= 8) {
    return tail;
  }

  return null;
}

function rankEntries(map: Map<string, number>, limit: number) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
    .slice(0, limit)
    .map(([label, count], index) => ({
      label,
      count,
      rank: index + 1,
    }));
}

function collectDestinationCounts(): Map<string, number> {
  const counts = new Map<string, number>();

  // 攻略 > 计划 > 瞬间：编辑精选内容对「热门目的地」信号更强
  for (const guide of demoGuides) {
    increment(counts, guide.city, 3);
  }

  for (const plan of getRecentTravelPlans(24)) {
    const city = resolveCityFromLocation(getPlanDestination(plan));
    if (city) {
      increment(counts, city, 2);
    }
  }

  for (const user of DEMO_USERS) {
    for (const moment of user.travelMoments) {
      if (
        !canViewTravelMoment({
          moment,
          authorId: user.id,
          viewerId: DEMO_CURRENT_USER_ID,
          isOwnProfile: user.id === DEMO_CURRENT_USER_ID,
        })
      ) {
        continue;
      }
      const city = resolveCityFromLocation(moment.location ?? '');
      if (city) {
        increment(counts, city, 1);
      }
    }
  }

  return counts;
}

function collectTagCounts(): Map<string, number> {
  const counts = new Map<string, number>();

  for (const guide of demoGuides) {
    for (const tag of guide.tags) {
      increment(counts, tag, 3);
    }
  }

  for (const plan of getRecentTravelPlans(24)) {
    for (const tag of getPlanStyleTags(plan)) {
      increment(counts, tag.label, 2);
    }
    for (const tag of plan.tags) {
      increment(counts, tag, 1);
    }
  }

  for (const user of DEMO_USERS) {
    for (const moment of user.travelMoments) {
      if (
        !canViewTravelMoment({
          moment,
          authorId: user.id,
          viewerId: DEMO_CURRENT_USER_ID,
          isOwnProfile: user.id === DEMO_CURRENT_USER_ID,
        })
      ) {
        continue;
      }
      for (const tag of moment.tags) {
        increment(counts, tag, 1);
      }
    }
  }

  return counts;
}

export function getDiscoverTrends(
  destinationLimit = 20,
  tagLimit = 10,
): DiscoverTrendsSnapshot {
  const destinationRanked = rankEntries(collectDestinationCounts(), destinationLimit);

  return {
    destinations: destinationRanked.map((entry) => ({
      ...entry,
      value: entry.label,
    })),
    tags: rankEntries(collectTagCounts(), tagLimit),
    updatedAt: new Date().toISOString(),
  };
}

/** 仅有站内内容的城市（攻略 / 计划 / 瞬间），用于发现页筛选 */
export function getDiscoverCitiesWithContent(): DiscoverTrendDestination[] {
  return rankEntries(collectDestinationCounts(), 999).map((entry, index) => ({
    label: entry.label,
    value: entry.label,
    count: entry.count,
    rank: index + 1,
  }));
}
