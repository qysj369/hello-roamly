import { describe, expect, it } from 'vitest';
import { CITY_SHARE_PHOTO_FRAMES, matchSearchPlanSpotPhoto } from '@/lib/home/citySharePhotoLibrary';
import { getSearchPlanFragmentPoster } from '@/lib/home/buildSearchPlanPoster';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';
import { scoreSpotNameHit } from '@/lib/home/spotNameHit';

const friends = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: null,
})!;

describe('citySharePhotoLibrary', () => {
  it('exposes Xiaohongshu 3:4, Douyin 9:16 and WeChat 1:1 frames', () => {
    expect(CITY_SHARE_PHOTO_FRAMES.xhs.width / CITY_SHARE_PHOTO_FRAMES.xhs.height).toBeCloseTo(3 / 4);
    expect(CITY_SHARE_PHOTO_FRAMES.douyin.width / CITY_SHARE_PHOTO_FRAMES.douyin.height).toBeCloseTo(9 / 16);
    expect(CITY_SHARE_PHOTO_FRAMES.wechat.width / CITY_SHARE_PHOTO_FRAMES.wechat.height).toBe(1);
  });

  it('matches Shanghai itinerary names to the same-city photo kit', () => {
    const used = new Set<string>();
    const museum = matchSearchPlanSpotPhoto(friends, '上海博物馆', used);
    const bund = matchSearchPlanSpotPhoto(friends, '外滩滨江', used);
    const food = matchSearchPlanSpotPhoto(friends, '沈大成', used);
    expect(museum).toMatch(/natural-museum|museum/);
    expect(museum).not.toMatch(/peoples-square|bund/);
    expect(bund).toMatch(/shanghai|bund/);
    expect(food).toMatch(/xiaolong/);
    expect(new Set([museum, bund, food]).size).toBe(3);
  });

  it('scores exact place names above city or river aliases', () => {
    expect(scoreSpotNameHit('上海博物馆', ['上海博物馆', '上博'], '上海博物馆')).toBeGreaterThan(
      scoreSpotNameHit('人民广场', ['人民广场'], '上海博物馆'),
    );
    expect(scoreSpotNameHit('外滩', ['外滩源', '外滩'], '外滩滨江')).toBeGreaterThan(
      scoreSpotNameHit('陆家嘴夜色', ['陆家嘴', '夜景', '滨江'], '外滩滨江'),
    );
    expect(scoreSpotNameHit('上海', [], '上海博物馆')).toBe(0);
  });

  it('uses the first itinerary landmark for WeChat, not the Douyin food shot', () => {
    const fragment = getSearchPlanFragmentPoster(friends);
    expect(fragment.title).toBe('上海博物馆');
    expect(fragment.imageUrl).toMatch(/natural-museum|museum/);
    expect(fragment.title).not.toContain('沈大成');
  });
});
