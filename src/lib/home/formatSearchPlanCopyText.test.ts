import { describe, expect, it } from 'vitest';
import {
  buildSearchPlanSharePacket,
  formatSearchPlanCopyText,
  searchPlanBudgetLabel,
  searchPlanShareCardDesc,
  searchPlanShareTitle,
} from '@/lib/home/formatSearchPlanCopyText';
import { SITE_SHARE_REFERENCE_LINE } from '@/lib/config/siteCompliance';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const plan: SearchStructuredPlan = {
  baseInfo: {
    startCity: '济南',
    targetCity: '杭州',
    days: 3,
    peopleType: '好友结伴',
    budget: null,
    theme: '山水徒步',
  },
  budgetList: [{ item: '合计', perPerson: 2600, tip: '总预算约2600元' }],
  globalTips: ['地铁可扫支付宝'],
  dayList: [
    {
      day: 1,
      title: '抵达杭州，漫步西湖',
      hotelArea: '西湖湖滨商圈',
      tips: '穿舒适鞋',
      traffic: [{ desc: '济南西高铁至杭州东' }],
      spots: [{ name: '西湖', intro: '沿苏堤慢走' }],
      foods: [{ shop: '楼外楼', dish: '西湖醋鱼', perCost: 150 }],
    },
  ],
};

describe('formatSearchPlanCopyText', () => {
  it('writes summary, budget, day cards, tips, and brand footer', () => {
    const text = formatSearchPlanCopyText(plan);
    expect(text).toContain('《杭州3天｜和好友避开人流的湖边松弛路线》');
    expect(text).toMatch(/杭州 · 3天 · 好友结伴 · 约/);
    expect(text).not.toContain('未设置预算');
    expect(text).toContain('出发：济南');
    expect(text).toContain('主题：山水徒步');
    expect(text).toContain('合计  人均2600元  总预算约2600元');
    expect(text).toContain('【抵达杭州，漫步西湖】');
    expect(text).toContain('住宿片区：西湖湖滨商圈');
    expect(text).toContain('- 济南西高铁至杭州东');
    expect(text).toContain('- 西湖 · 沿苏堤慢走');
    expect(text).toContain('- 楼外楼 · 西湖醋鱼 · 人均150元');
    expect(text).toContain('【行程亮点】穿舒适鞋');
    expect(text).toContain('【本次行程专属贴士】');
    expect(text).toContain('- 地铁可扫支付宝');
    expect(text).toContain('蜗牛旅行｜路慢，方能读懂山河');
    expect(text).toContain('helloroamly.com');
    expect(text).not.toContain('特惠');
    expect(text).not.toContain('预订');
  });

  it('uses local in-city budget range instead of 未设置预算', () => {
    expect(searchPlanBudgetLabel(plan)).toMatch(/^约\d+/);
    expect(searchPlanBudgetLabel(plan)).not.toBe('未设置预算');
  });

  it('builds a branded catchy share title', () => {
    expect(searchPlanShareTitle(plan)).toContain('杭州3天｜和好友避开人流的湖边松弛路线');
    expect(searchPlanShareTitle(plan)).not.toContain('杭州3天行程');
  });

  it('packs the full itinerary for one-tap share, including days and the live page link', () => {
    const url = 'https://helloroamly.com/saved-plans/plan-hz';
    const packet = buildSearchPlanSharePacket(plan, url);
    expect(searchPlanShareCardDesc(plan)).toBe('西湖 · 楼外楼');
    expect(packet).toContain('【抵达杭州，漫步西湖】');
    expect(packet).toContain('- 西湖 · 沿苏堤慢走');
    expect(packet).toContain('- 楼外楼 · 西湖醋鱼 · 人均150元');
    expect(packet).toContain(url);
    expect(packet).toContain(SITE_SHARE_REFERENCE_LINE);
    expect(packet).not.toContain('一键定制');
  });
});
