import type { TravelInterest } from '@/types/domain/aiTravelParams';

/** 发现页内容类型 */
export type DiscoverContentType = 'all' | 'guide' | 'plan' | 'moment';

/** 发现页时间范围 */
export type DiscoverTimeRange = 'all' | '7d' | '30d' | '90d';

/** 发现流排序：兴趣推荐分 vs 更新时间 */
export type DiscoverSortMode = 'recommend' | 'recent';

export const DEFAULT_DISCOVER_SORT_MODE: DiscoverSortMode = 'recommend';

export type DiscoverFilters = {
  q: string;
  destination: string;
  travelType: TravelInterest | '';
  timeRange: DiscoverTimeRange;
  contentType: DiscoverContentType;
};

export const DEFAULT_DISCOVER_FILTERS: DiscoverFilters = {
  q: '',
  destination: '',
  travelType: '',
  timeRange: 'all',
  contentType: 'all',
};

export type DiscoverGuideItem = {
  kind: 'guide';
  id: string;
  updatedAt: string;
  guideId: string;
};

export type DiscoverPlanItem = {
  kind: 'plan';
  id: string;
  updatedAt: string;
  planId: string;
};

/** 用户保存并公开的穷游方案（地图 AI 对话） */
export type DiscoverSavedPlanItem = {
  kind: 'savedPlan';
  id: string;
  updatedAt: string;
  userPlanId: string;
  title: string;
  locationName: string;
  authorId: string;
};

export type DiscoverMomentItem = {
  kind: 'moment';
  id: string;
  updatedAt: string;
  momentId: string;
  authorId: string;
};

export type DiscoverFeedItem = DiscoverGuideItem | DiscoverPlanItem | DiscoverSavedPlanItem | DiscoverMomentItem;

/** 带兴趣推荐得分的发现流条目 */
export type RecommendedDiscoverItem = DiscoverFeedItem & {
  recommendScore: number;
  recommendReasons: string[];
};
