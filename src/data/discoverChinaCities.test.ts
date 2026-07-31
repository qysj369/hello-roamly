import { describe, expect, it } from 'vitest';
import {
  DISCOVER_CHINA_CITIES,
  DISCOVER_CHINA_CITY_COUNT,
  isDiscoverChinaCity,
} from '@/data/discoverChinaCities';
import { buildDiscoverDestinations } from '@/data/discoverOptions';
import { buildDiscoverFeed } from '@/utils/discoverContent';
import { getDiscoverCitiesWithContent } from '@/utils/discoverTrends';
import { DEFAULT_DISCOVER_FILTERS } from '@/types/domain/discover';

describe('discoverChinaCities', () => {
  it('keeps full coordinate library for map/covers', () => {
    expect(DISCOVER_CHINA_CITY_COUNT).toBeGreaterThanOrEqual(90);
    expect(DISCOVER_CHINA_CITIES).toContain('杭州');
    expect(isDiscoverChinaCity('丽江')).toBe(true);
  });

  it('only exposes cities with content in discover filters', () => {
    const covered = getDiscoverCitiesWithContent();
    const options = buildDiscoverDestinations();
    expect(covered.length).toBeGreaterThan(0);
    expect(covered.length).toBeLessThan(DISCOVER_CHINA_CITY_COUNT);
    expect(options.length).toBe(covered.length + 1);
    expect(options[0]?.label).toBe('全部目的地');
  });
});

describe('discover destination filter', () => {
  it('matches guides by city name in content blob', () => {
    const hangzhou = buildDiscoverFeed({ ...DEFAULT_DISCOVER_FILTERS, destination: '杭州' });
    expect(hangzhou.some((item) => item.kind === 'guide')).toBe(true);

    const empty = buildDiscoverFeed({ ...DEFAULT_DISCOVER_FILTERS, destination: '不存在城' });
    expect(empty.length).toBe(0);
  });
});
