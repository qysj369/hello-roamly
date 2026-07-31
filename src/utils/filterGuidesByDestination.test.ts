import { describe, expect, it } from 'vitest';
import { filterGuidesByDestination, filterTrailGuidesByDestination } from '@/utils/filterGuidesByDestination';

describe('filterGuidesByDestination', () => {
  const guides = [
    { city: '西安', title: '西安三天' },
    { city: '成都', title: '成都火锅' },
  ];

  it('returns all guides when search has no destination', () => {
    expect(filterGuidesByDestination(guides, '')).toHaveLength(2);
  });

  it('filters guides by destination in query', () => {
    expect(filterGuidesByDestination(guides, '西安 三天')).toEqual([guides[0]]);
  });

  it('falls back to all when no match', () => {
    expect(filterGuidesByDestination(guides, '青岛 三天')).toHaveLength(2);
  });
});

describe('filterTrailGuidesByDestination', () => {
  const trails = [
    { end_city: '西安', title: '西安线' },
    { end_city: '成都', title: '成都线' },
  ];

  it('filters trail guides by end city', () => {
    expect(filterTrailGuidesByDestination(trails, '济南到成都 三天')).toEqual([trails[1]]);
  });
});
