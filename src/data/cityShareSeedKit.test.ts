import { describe, expect, it } from 'vitest';
import {
  CITY_SHARE_SEED_KIT,
  pickCityShareDouyinScript,
  pickCityShareXhsNote,
} from '@/data/cityShareSeedKit';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

function plan(city: string, spot: string): SearchStructuredPlan {
  return {
    baseInfo: {
      startCity: '济南',
      targetCity: city,
      days: 3,
      peopleType: '好友结伴',
      budget: null,
      theme: null,
    },
    budgetList: [{ item: '合计', perPerson: 1500, tip: '' }],
    globalTips: [],
    dayList: [
      {
        day: 1,
        title: `${spot}慢逛`,
        hotelArea: '',
        tips: '',
        traffic: [],
        spots: [{ name: spot, intro: '必体验' }],
        foods: [],
      },
    ],
  };
}

describe('cityShareSeedKit', () => {
  it('covers Shanghai, Hangzhou, Chengdu and Xi’an with 3 Douyin scripts and 2 Xiaohongshu notes each', () => {
    expect(CITY_SHARE_SEED_KIT.map((item) => item.city)).toEqual(['上海', '杭州', '成都', '西安']);
    for (const seed of CITY_SHARE_SEED_KIT) {
      expect(seed.douyin).toHaveLength(3);
      expect(seed.xhs).toHaveLength(2);
      const blob = `${seed.douyin.map((item) => `${item.spoken}${item.tags}`).join('')} ${seed.xhs.map((item) => item.body).join('')}`;
      expect(blob).not.toMatch(/Day\s*[123]/i);
      expect(blob).not.toMatch(/人均\d/);
      expect(blob).not.toContain('helloroamly.com');
      expect(blob).not.toContain('一键定制');
      expect(blob).not.toContain('专属行程');
    }
  });

  it('picks the matching fragment by spot name', () => {
    expect(pickCityShareDouyinScript(plan('杭州', '龙井村'))?.id).toBe('hz-tea');
    expect(pickCityShareXhsNote(plan('杭州', '龙井村'))?.id).toBe('hz-xhs-tea');
    expect(pickCityShareDouyinScript(plan('成都', '人民公园'))?.id).toBe('cd-park');
    expect(pickCityShareDouyinScript(plan('西安', '陕西历史博物馆'))?.id).toBe('xa-museum');
    expect(pickCityShareDouyinScript(plan('上海', '沈大成'))?.id).toBe('sh-food');
    expect(pickCityShareXhsNote(plan('上海', '上海博物馆'))?.id).toBe('sh-xhs-oldtown');
    expect(pickCityShareDouyinScript(plan('上海', '外滩滨江'))?.id).toBe('sh-bund');
  });

  it('keeps every seed line free of routes, budgets and outbound URLs', () => {
    for (const seed of CITY_SHARE_SEED_KIT) {
      for (const script of seed.douyin) {
        expect(script.spoken).toContain('。');
        expect(script.tags.startsWith('#')).toBe(true);
        expect(script.shots.length).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
