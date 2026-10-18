import { describe, expect, it } from 'vitest';
import {
  getSearchPlanCoverUrl,
  getSearchPlanFragmentPoster,
  getSearchPlanPosterSummary,
  getSearchPlanSharePosterInput,
  getSearchPlanDouyinCopyText,
  getSearchPlanXhsCopyText,
  getSearchPlanXhsPosterInput,
  searchPlanExportPosterSize,
  searchPlanPosterShareUrl,
} from '@/lib/home/buildSearchPlanPoster';
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
  budgetList: [{ item: '合计', perPerson: 2600, tip: '' }],
  globalTips: [],
  dayList: [
    {
      day: 1,
      title: '抵达杭州，漫步西湖',
      hotelArea: '西湖湖滨商圈',
      tips: '',
      traffic: [],
      spots: [{ name: '西湖', intro: '' }],
      foods: [],
    },
    {
      day: 2,
      title: '西溪湿地',
      hotelArea: '西湖湖滨商圈',
      tips: '',
      traffic: [],
      spots: [{ name: '西溪湿地', intro: '' }],
      foods: [],
    },
  ],
};

describe('buildSearchPlanPoster', () => {
  it('writes a wechat poster input without promo words', () => {
    const input = getSearchPlanSharePosterInput(plan, 'https://helloroamly.com/');
    expect(input.tone).toBe('brand');
    expect(input.badge).toBe('漫行灵感');
    expect(input.title).toContain('杭州3天｜和好友避开人流的湖边松弛路线');
    expect(input.title).not.toContain('杭州3天行程');
    expect(input.subtitle).toContain('好友结伴');
    expect(input.subtitle).not.toMatch(/约/);
    expect(input.subtitle).not.toContain('未设置预算');
    expect(input.summary).toMatch(/西湖|苏堤/);
    expect(input.summary).not.toContain('D1');
    expect(input.shareUrl).toBe('https://helloroamly.com/');
    expect(input.summary).not.toContain('特惠');
    expect(input.summary).not.toContain('预订');
  });

  it('uses city-kit scenery instead of a neon night stock photo', () => {
    expect(getSearchPlanCoverUrl('上海')).toContain('/city-kit/shanghai/');
    expect(getSearchPlanCoverUrl('杭州')).toContain('/city-kit/hangzhou/');
    expect(getSearchPlanSharePosterInput(plan, 'https://helloroamly.com/').coverImageUrl).toContain(
      '/city-kit/hangzhou/',
    );
  });

  it('builds douyin copy with a short cover title', () => {
    const copy = getSearchPlanDouyinCopyText(plan, 'https://helloroamly.com/');
    expect(copy.title).toContain('杭州3天｜和好友避开人流的湖边松弛路线');
    expect(copy.hashtags).toEqual(expect.arrayContaining(['杭州好友旅行', '杭州湖边慢游', '杭州街巷漫游']));
    expect(copy.shareUrl).toBe('https://helloroamly.com/');
  });

  it('builds xhs copy with city hashtags', () => {
    const copy = getSearchPlanXhsCopyText(plan, 'https://helloroamly.com/');
    expect(copy.title).toContain('杭州3天｜和好友避开人流的湖边松弛路线');
    expect(copy.hashtags).toEqual(expect.arrayContaining(['杭州好友旅行', '杭州湖边慢游']));
    expect(copy.shareUrl).toBe('https://helloroamly.com/');
    expect(getSearchPlanXhsPosterInput(plan, 'https://helloroamly.com/').noteSlides).toHaveLength(3);
  });

  it('keeps summary short', () => {
    expect(getSearchPlanPosterSummary(plan).length).toBeLessThanOrEqual(160);
  });

  it('builds a single-spot fragment poster without a multi-day table', () => {
    const fragment = getSearchPlanFragmentPoster(plan);
    expect(fragment.title).toMatch(/苏堤|西湖|湖边/);
    expect(fragment.caption.length).toBeGreaterThan(0);
    expect(`${fragment.kicker}${fragment.title}${fragment.caption}`).not.toMatch(/Day\s*[123]/i);
    expect(searchPlanExportPosterSize('wechat', false)).toEqual({ width: 1080, height: 1080 });
    expect(searchPlanExportPosterSize('wechat', true)).toEqual({ width: 720, height: 720 });
    expect(searchPlanExportPosterSize('douyin', false)).toEqual({ width: 1080, height: 1920 });
    expect(searchPlanExportPosterSize('douyin', true)).toEqual({ width: 720, height: 1280 });
  });

  it('points unsaved posters at homepage search fields', () => {
    const url = searchPlanPosterShareUrl(null, {
      targetCity: '杭州',
      days: 3,
      peopleType: '好友结伴',
    });
    const decoded = decodeURIComponent(url);
    expect(url).toContain('from=share');
    expect(decoded).toContain('sid=search-杭州');
    expect(decoded).toContain('city=杭州');
    expect(url).toContain('days=3');
    expect(decoded).toContain('party=好友结伴');
    expect(url).not.toContain('/saved-plans/');
  });

  it('embeds the itinerary payload so a scan opens the trip, not a blank home', () => {
    const url = searchPlanPosterShareUrl('plan-abc', plan.baseInfo, plan);
    const decoded = decodeURIComponent(url);
    expect(url).not.toContain('/saved-plans/');
    expect(decoded).toContain('city=杭州');
    expect(decoded).toContain('sp=');
    expect(url).toContain('from=share');
  });
});
