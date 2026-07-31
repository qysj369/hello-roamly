import { describe, expect, it } from 'vitest';
import {
  getDiscoverSectionSortHint,
  getDiscoverUsersSortHint,
  isDiscoverGridEmpty,
} from '@/utils/discoverGrid';

describe('discoverGrid helpers', () => {
  it('getDiscoverSectionSortHint', () => {
    expect(getDiscoverSectionSortHint('recommend')).toBe('按兴趣匹配度排序');
    expect(getDiscoverSectionSortHint('recent')).toBe('按发布时间排序');
  });

  it('getDiscoverUsersSortHint', () => {
    expect(getDiscoverUsersSortHint('recommend')).toContain('合拍');
    expect(getDiscoverUsersSortHint('recent')).toContain('人气');
  });

  it('isDiscoverGridEmpty respects section visibility', () => {
    expect(
      isDiscoverGridEmpty({
        plans: 0,
        moments: 0,
        users: 0,
        guides: 0,
        showPlans: true,
        showMoments: false,
        showUsers: false,
        showGuides: false,
      }),
    ).toBe(true);

    expect(
      isDiscoverGridEmpty({
        plans: 1,
        moments: 0,
        users: 0,
        guides: 0,
        showPlans: true,
        showMoments: false,
        showUsers: false,
        showGuides: false,
      }),
    ).toBe(false);
  });
});
