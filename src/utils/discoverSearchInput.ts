import { getDiscoverCitiesWithContent } from '@/utils/discoverTrends';
import type { DiscoverFilters } from '@/types/domain/discover';

const KNOWN_DESTINATIONS = getDiscoverCitiesWithContent().map((city) => city.label);

/** 搜索框输入：城市名走 destination，其余走关键词 q，避免 AND 叠加导致 0 结果 */
export function resolveDiscoverSearchInput(
  input: string,
  current: Pick<DiscoverFilters, 'destination' | 'q'>,
): Pick<DiscoverFilters, 'destination' | 'q'> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { destination: '', q: '' };
  }

  const matchedCity = KNOWN_DESTINATIONS.find(
    (city) => city === trimmed || trimmed.includes(city) || city.includes(trimmed),
  );

  if (matchedCity) {
    return { destination: matchedCity, q: '' };
  }

  return { destination: '', q: trimmed };
}

/** 搜索框展示值：优先显示 destination，否则显示 q */
export function getDiscoverSearchDisplayValue(filters: Pick<DiscoverFilters, 'destination' | 'q'>): string {
  return filters.destination || filters.q;
}
