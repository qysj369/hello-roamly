import { describe, expect, it } from 'vitest';
import {
  MIN_ASIDE_PREVIEW_CARDS,
  getPlanCityAtmosphere,
  isPlanAsideFoodPhoto,
  isPlanAsidePlaceholder,
  listPlanAsidePreviewCards,
} from '@/lib/home/planCityAtmosphere';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';
import { SHANGHAI_PLAN_ASIDE_ASSETS } from '@/data/shanghaiPlanAsideKit';

describe('getPlanCityAtmosphere', () => {
  it('keeps at least 15 unique Shanghai aside photos in the city library', () => {
    const paths = new Set(SHANGHAI_PLAN_ASIDE_ASSETS.map((item) => item.photoPath));
    expect(SHANGHAI_PLAN_ASIDE_ASSETS.length).toBeGreaterThanOrEqual(15);
    expect(paths.size).toBeGreaterThanOrEqual(15);
  });

  it('loads Hangzhou spots and foods from the city kit', () => {
    const hangzhou = getPlanCityAtmosphere('杭州');
    expect(hangzhou?.cityName).toBe('杭州');
    expect(hangzhou?.scenery.some((item) => item.name.includes('西湖'))).toBe(true);
    expect(hangzhou?.scenery.every((item) => item.photoPath.includes('/hangzhou/'))).toBe(true);
    expect(hangzhou?.foods.map((item) => item.name)).toContain('片儿川');
  });

  it('does not reuse Hangzhou media for Beijing or Suzhou', () => {
    const beijing = getPlanCityAtmosphere('北京');
    const suzhou = getPlanCityAtmosphere('苏州');
    expect(beijing?.cityName).toBe('北京');
    expect(beijing?.scenery.some((item) => item.name.includes('什刹海'))).toBe(true);
    expect(beijing?.scenery.some((item) => item.photoPath.includes('/hangzhou/'))).toBe(false);
    expect(suzhou?.cityName).toBe('苏州');
    expect(suzhou?.scenery.some((item) => item.name.includes('平江'))).toBe(true);
    expect(suzhou?.foods.map((item) => item.name)).toContain('苏式面');
  });

  it('keeps scenery photos off food cards and uses food photos or placeholders', () => {
    const hangzhou = getPlanCityAtmosphere('杭州');
    const pian = hangzhou?.foods.find((item) => item.name === '片儿川');
    const shrimp = hangzhou?.foods.find((item) => item.name === '龙井虾仁');
    const fish = hangzhou?.foods.find((item) => item.name === '西湖醋鱼');
    expect(pian?.photoPath).toBe('/city-kit/hangzhou/spot-food-noodles.jpg');
    expect(shrimp?.photoPath).toBe('/city-kit/hangzhou/spot-food-dumpling.jpg');
    expect(isPlanAsideFoodPhoto(pian?.photoPath ?? '')).toBe(true);
    expect(hangzhou?.foods.every((item) => !item.photoPath.includes('westlake'))).toBe(true);
    expect(hangzhou?.foods.every((item) => !item.photoPath.includes('cover.jpg'))).toBe(true);
    expect(hangzhou?.scenery.every((item) => !isPlanAsideFoodPhoto(item.photoPath))).toBe(true);
    expect(fish && isPlanAsidePlaceholder(fish.photoPath)).toBe(true);
  });

  it('does not borrow scenery covers for Beijing or Suzhou food cards', () => {
    const beijing = getPlanCityAtmosphere('北京');
    const suzhou = getPlanCityAtmosphere('苏州');
    expect(beijing?.foods.every((item) => isPlanAsidePlaceholder(item.photoPath))).toBe(true);
    expect(suzhou?.foods.every((item) => isPlanAsidePlaceholder(item.photoPath))).toBe(true);
    expect(beijing?.scenery.some((item) => item.photoPath.includes('shichahai'))).toBe(true);
    expect(suzhou?.scenery.some((item) => item.photoPath.includes('pingjiang'))).toBe(true);
  });

  it('matches Chengdu and Guangzhou dishes to food photos, not landmarks', () => {
    const chengdu = getPlanCityAtmosphere('成都');
    const guangzhou = getPlanCityAtmosphere('广州');
    expect(chengdu?.foods.find((item) => item.name === '火锅')?.photoPath).toBe(
      '/city-kit/chengdu/spot-hotpot.jpg',
    );
    expect(guangzhou?.foods.find((item) => item.name === '早茶点心')?.photoPath).toContain(
      'dimsum',
    );
    expect(guangzhou?.foods.find((item) => item.name === '肠粉')?.photoPath).toContain('cheungfun');
    expect(guangzhou?.foods.find((item) => item.name === '糖水')?.photoPath).toContain('tongshui');
    expect(guangzhou?.foods.every((item) => !isPlanAsidePlaceholder(item.photoPath))).toBe(true);
    expect(chengdu?.scenery.every((item) => !isPlanAsideFoodPhoto(item.photoPath))).toBe(true);
  });

  it('returns null for cities outside the kit', () => {
    expect(getPlanCityAtmosphere('不存在的城')).toBeNull();
    expect(getPlanCityAtmosphere('')).toBeNull();
    expect(getPlanCityAtmosphere('青岛')).toBeNull();
  });

  it('does not throw when scenery is missing', () => {
    expect(listPlanAsidePreviewCards(null)).toEqual([]);
    expect(
      listPlanAsidePreviewCards({
        cityName: '青岛',
        scenery: null as unknown as [],
        foods: null as unknown as [],
      }),
    ).toEqual([]);
  });

  it('gives Shanghai couple itinerary at least 6 unique aside photos', () => {
    const couple = matchSearchPlanGoldExample({
      startCity: '济南',
      targetCity: '上海',
      days: 3,
      peopleType: '情侣',
      budget: null,
      theme: null,
    });
    const cards = listPlanAsidePreviewCards(getPlanCityAtmosphere('上海', couple)!);
    const paths = new Set(cards.map((item) => item.photoPath));
    expect(cards.length).toBeGreaterThanOrEqual(MIN_ASIDE_PREVIEW_CARDS);
    expect(paths.size).toBeGreaterThanOrEqual(MIN_ASIDE_PREVIEW_CARDS);
    expect(cards.some((item) => item.variant === 'food')).toBe(true);
    expect(cards.some((item) => item.variant === 'scenery')).toBe(true);
  });

  it('pads Hangzhou aside with extra kit photos to at least 6 unique cards', () => {
    const cards = listPlanAsidePreviewCards(getPlanCityAtmosphere('杭州')!);
    expect(new Set(cards.map((item) => item.photoPath)).size).toBeGreaterThanOrEqual(
      MIN_ASIDE_PREVIEW_CARDS,
    );
  });

  it('keeps Shanghai aside cards that appear in the itinerary', () => {
    const aligned = getPlanCityAtmosphere('上海', {
      baseInfo: { peopleType: '好友结伴' },
      dayList: [
        {
          spots: [{ name: '外滩' }, { name: '人民广场' }],
          foods: [{ shop: '小杨生煎（南京东路店）', dish: '生煎包' }],
        },
      ],
    });
    const names = [
      ...(aligned?.scenery.map((item) => item.name) ?? []),
      ...(aligned?.foods.map((item) => item.name) ?? []),
    ];
    expect(names).toContain('外滩');
    expect(names).toContain('生煎');
    expect(names.length).toBeGreaterThanOrEqual(4);
    expect(aligned?.foods.some((item) => item.name === '阿婆甜品')).toBe(false);
  });

  it('prefers family venues for a Shanghai parent-child itinerary', () => {
    const family = getPlanCityAtmosphere('上海', {
      baseInfo: { peopleType: '亲子' },
      dayList: [
        {
          spots: [{ name: '上海自然博物馆' }, { name: '上海科技馆' }],
          foods: [{ shop: '南翔馒头店（静安店）', dish: '鲜肉小笼' }],
        },
      ],
    });
    const names = [
      ...(family?.scenery.map((item) => item.name) ?? []),
      ...(family?.foods.map((item) => item.name) ?? []),
    ];
    expect(names).toContain('上海自然博物馆');
    expect(names).toContain('上海科技馆');
    expect(names.length).toBeGreaterThanOrEqual(4);
    expect(family?.scenery[0]?.name).not.toBe('外滩');
    expect(names.length).toBeGreaterThan(3);
  });
});
