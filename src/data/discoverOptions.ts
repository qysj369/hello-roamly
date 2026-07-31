import { getDiscoverCitiesWithContent } from '@/utils/discoverTrends';
import { TRAVEL_INTEREST_OPTIONS } from '@/types/domain/aiTravelParams';
import type { TravelInterest } from '@/types/domain/aiTravelParams';
import type { DiscoverContentType, DiscoverTimeRange } from '@/types/domain/discover';

/** 发现页可选目的地：仅包含有内容的城市 */
export function buildDiscoverDestinations() {
  return [
    { value: '', label: '全部目的地' },
    ...getDiscoverCitiesWithContent().map((city) => ({
      value: city.value,
      label: city.label,
    })),
  ];
}

export const DISCOVER_TRAVEL_TYPES: { value: TravelInterest | ''; label: string }[] = [
  { value: '', label: '全部类型' },
  ...TRAVEL_INTEREST_OPTIONS.map((item) => ({ value: item.id, label: item.label })),
];

export const DISCOVER_TIME_RANGES: { value: DiscoverTimeRange; label: string }[] = [
  { value: 'all', label: '全部时间' },
  { value: '7d', label: '近 7 天' },
  { value: '30d', label: '近 30 天' },
  { value: '90d', label: '近 3 个月' },
];

export const DISCOVER_CONTENT_TYPES: { value: DiscoverContentType; label: string }[] = [
  { value: 'all', label: '全部内容' },
  { value: 'guide', label: '攻略' },
  { value: 'plan', label: '旅行计划' },
  { value: 'moment', label: '旅行瞬间' },
];
