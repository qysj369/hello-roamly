import { describe, expect, it } from 'vitest';
import { MIN_ASIDE_PREVIEW_CARDS } from '@/lib/home/planCityAtmosphere';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';
import { SEARCH_PLAN_SHARE_PHOTO_COUNT, listSearchPlanSharePhotos } from '@/lib/home/searchPlanShareVisuals';

const couple = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '情侣',
  budget: null,
  theme: null,
})!;

describe('listSearchPlanSharePhotos', () => {
  it('still returns photos when the city kit has no scenery list', () => {
    const qingdao = {
      ...couple,
      baseInfo: { ...couple.baseInfo, targetCity: '青岛' },
    };
    expect(() => listSearchPlanSharePhotos(qingdao)).not.toThrow();
    expect(listSearchPlanSharePhotos(qingdao).length).toBeGreaterThan(0);
  });

  it('picks at least six unique Shanghai aside photos mixed with food', () => {
    const photos = listSearchPlanSharePhotos(couple);
    expect(photos.length).toBeGreaterThanOrEqual(Math.min(SEARCH_PLAN_SHARE_PHOTO_COUNT, MIN_ASIDE_PREVIEW_CARDS));
    const paths = new Set(photos.map((item) => item.photoPath));
    expect(paths.size).toBe(photos.length);
    expect(photos.every((item) => !item.photoPath.startsWith('data:'))).toBe(true);
    expect(photos.some((item) => item.variant === 'scenery')).toBe(true);
    expect(photos.some((item) => item.variant === 'food')).toBe(true);
  });
});
