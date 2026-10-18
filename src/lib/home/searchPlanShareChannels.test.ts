import { describe, expect, it } from 'vitest';
import {
  SEARCH_PLAN_DISCLAIMER,
  SEARCH_PLAN_SHARE_CHANNELS,
  SEARCH_PLAN_SHARE_CTA,
  SEARCH_PLAN_SHARE_REF,
  buildSearchPlanChannelCopy,
  buildStructuredShareCopy,
  sanitizeShareExportText,
  sanitizePosterOverlayText,
  searchPlanComposeAppUrl,
  searchPlanShareGuide,
} from '@/lib/home/searchPlanShareChannels';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';

const friends = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: null,
})!;

describe('searchPlanShareChannels', () => {
  it('pins wechat and douyin only', () => {
    expect(SEARCH_PLAN_SHARE_CHANNELS.filter((item) => item.pinned).map((item) => item.id)).toEqual([
      'wechat',
      'douyin',
    ]);
    expect(SEARCH_PLAN_SHARE_CHANNELS.filter((item) => !item.pinned).map((item) => item.id)).toEqual([
      'xhs',
      'weibo',
      'dianping',
      'zhihu',
      'bilibili',
      'kuaishou',
    ]);
  });

  it('keeps WeChat, Xiaohongshu and Douyin copy public-safe', () => {
    const url = 'https://helloroamly.com/saved-plans/plan-test?from=share';
    const xhs = buildSearchPlanChannelCopy('xhs', friends, url);
    const wechat = buildSearchPlanChannelCopy('wechat', friends, url);
    const douyin = buildSearchPlanChannelCopy('douyin', friends, url);
    expect(SEARCH_PLAN_DISCLAIMER).toContain('AI行程规划工具');
    expect(SEARCH_PLAN_DISCLAIMER).toContain('不从事旅行社组团、票务预订等旅游经营业务');
    for (const copy of [xhs, wechat, douyin]) {
      expect(copy).toContain(SEARCH_PLAN_SHARE_REF);
      expect(copy).not.toContain(SEARCH_PLAN_DISCLAIMER);
      expect(copy).toContain('沈大成');
      expect(copy).not.toContain(SEARCH_PLAN_SHARE_CTA);
      expect(copy).not.toContain('一键定制');
      expect(copy).not.toContain('专属旅行方案');
      expect(copy).not.toContain('Day 1');
      expect(copy).not.toContain('Day 2');
      expect(copy).not.toContain('Day 3');
      expect(copy).not.toContain(url);
      expect(copy).not.toContain('helloroamly.com');
      expect(copy).not.toMatch(/1210|1800/);
      expect(copy).not.toContain('平价探店');
      expect(copy).not.toContain('#蜗牛旅行');
      expect(copy).not.toContain('Hello Roamly');
    }
    expect(xhs).toContain('上海博物馆');
    expect(xhs).toContain('🌿');
    expect(xhs).toContain('📍');
    expect(xhs).not.toContain('【口播】');
    expect(douyin).not.toContain('【口播】');
    expect(douyin).toContain('#上海慢游');
    expect(douyin).toContain('别追人流');
    expect(douyin).toContain('蟹粉小笼');
    expect(wechat).toContain('沈大成');
    expect(wechat).toContain('上海博物馆');
    expect(wechat).toContain('不用追赶人流');
    expect(wechat).toContain('D1');
    expect(wechat).toContain('出行小提示');
    expect(wechat).not.toEqual(xhs);
    expect(xhs).not.toContain('别被网红点位的人流推着走');
  });

  it('builds a four-block seed note instead of a single thin sentence', () => {
    const copy = buildStructuredShareCopy(friends);
    expect(copy).toMatch(/上海3天好友慢游/);
    expect(copy).toContain('D1');
    expect(copy).toContain('D2');
    expect(copy).toContain('D3');
    expect(copy).toContain('出行小提示');
    expect(copy).toContain(SEARCH_PLAN_SHARE_REF);
    expect(copy).toContain('#上海慢游');
    expect(copy).toContain('#周末去哪');
    expect(copy.split('\n').length).toBeGreaterThan(6);
  });

  it('folds Zhihu / Bilibili / Kuaishou copy as lightweight public notes', () => {
    const url = 'https://helloroamly.com/saved-plans/plan-test?from=share';
    const zhihu = buildSearchPlanChannelCopy('zhihu', friends, url);
    const bili = buildSearchPlanChannelCopy('bilibili', friends, url);
    const kuaishou = buildSearchPlanChannelCopy('kuaishou', friends, url);
    expect(zhihu).toContain('周末漫游怎么走');
    expect(zhihu).toContain('上海博物馆');
    expect(zhihu).toContain(SEARCH_PLAN_SHARE_REF);
    expect(zhihu).not.toContain(url);
    expect(bili).toContain(SEARCH_PLAN_SHARE_REF);
    expect(kuaishou).toContain(SEARCH_PLAN_SHARE_REF);
    for (const copy of [zhihu, bili, kuaishou]) {
      expect(copy).not.toContain('一键定制');
      expect(copy).not.toContain('helloroamly.com');
      expect(copy).not.toContain('Day 1');
    }
  });

  it('strips multi-day lists, budgets, domains and marketing lines from export copy', () => {
    const dirty = [
      'Day 1 人民广场 Day 2 豫园 第3天武康路',
      '人均1210-1800元 预算按实核算',
      '完整行程路线在蜗牛旅行 helloroamly.com，AI一键定制你的专属旅行方案',
      '定制行程 全套路线 完整攻略 成套行程',
      'https://helloroamly.com/saved-plans/x',
      SEARCH_PLAN_DISCLAIMER,
    ].join('\n');
    const clean = sanitizeShareExportText(dirty);
    expect(clean).toContain(SEARCH_PLAN_SHARE_REF);
    expect(clean).not.toContain('Day 1');
    expect(clean).not.toContain('Day 2');
    expect(clean).not.toContain('第3天');
    expect(clean).not.toContain('1210');
    expect(clean).not.toContain('helloroamly.com');
    expect(clean).not.toContain('一键定制');
    expect(clean).not.toContain('旅行社组团');
    expect(clean).not.toContain('定制行程');
    expect(clean).not.toContain('全套路线');
    expect(clean).not.toContain('完整攻略');
    expect(clean).not.toContain('成套行程');
    expect(clean).toContain('游玩灵感');
    expect(clean).toContain('漫游碎片');
  });

  it('strips per-person prices and long tip blocks from public preview copy', () => {
    const dirty = [
      '老麦咖啡馆 · 特调咖啡 · 人均38元',
      '【行程亮点】梧桐老洋房小众街巷漫步',
      '【本次行程专属贴士】',
      '- 雨天替代：外滩换成上海城市规划展示馆',
      '约1210‑1800元',
    ].join('\n');
    const clean = sanitizeShareExportText(dirty);
    expect(clean).not.toMatch(/人均|38|1210|1800|元/);
    expect(clean).not.toContain('行程亮点');
    expect(clean).not.toContain('专属贴士');
    expect(clean).toContain(SEARCH_PLAN_SHARE_REF);
  });

  it('scrubs poster overlay marketing words without appending the disclaimer', () => {
    expect(sanitizePosterOverlayText('Day 1 完整攻略 https://helloroamly.com 定制行程')).toBe(
      '游玩灵感 游玩灵感',
    );
    expect(sanitizePosterOverlayText('成套行程 全套路线')).toBe('游玩灵感 漫游碎片');
  });

  it('builds iOS compose schemes that carry copy where the app allows it', () => {
    const weibo = SEARCH_PLAN_SHARE_CHANNELS.find((item) => item.id === 'weibo')!;
    const wechat = SEARCH_PLAN_SHARE_CHANNELS.find((item) => item.id === 'wechat')!;
    const copy = buildSearchPlanChannelCopy('weibo', friends, 'https://helloroamly.com/?share=1');
    expect(searchPlanComposeAppUrl(weibo, copy)).toContain('sinaweibo://sendweibo?content=');
    expect(searchPlanComposeAppUrl(wechat, copy)).toBe('weixin://');
    const douyin = SEARCH_PLAN_SHARE_CHANNELS.find((item) => item.id === 'douyin')!;
    expect(searchPlanComposeAppUrl(douyin, copy)).toBe('snssdk1128://');
    expect(searchPlanComposeAppUrl(douyin, copy)).not.toContain('openRecord');
  });

  it('tells Douyin users to save vertical photos and spoken copy', () => {
    const douyin = SEARCH_PLAN_SHARE_CHANNELS.find((item) => item.id === 'douyin')!;
    expect(searchPlanShareGuide(douyin, true)).toContain('口播已复制');
    expect(searchPlanShareGuide(douyin, true)).toContain('汇总海报');
    expect(searchPlanShareGuide(douyin, false)).toContain('汇总海报');
  });

  it('keeps Hangzhou / Chengdu / Xi’an city names in the structured seed note', () => {
    const hangzhou = miniCityPlan('杭州', '西湖苏堤');
    const chengdu = miniCityPlan('成都', '宽窄巷子');
    const xian = miniCityPlan('西安', '西安城墙');
    const hzDouyin = buildSearchPlanChannelCopy('douyin', hangzhou, 'https://helloroamly.com/?share=1');
    const cdXhs = buildSearchPlanChannelCopy('xhs', chengdu, 'https://helloroamly.com/?share=1');
    const xaXhs = buildSearchPlanChannelCopy('xhs', xian, 'https://helloroamly.com/?share=1');
    expect(hzDouyin).toContain('西湖苏堤');
    expect(hzDouyin).toContain('#杭州慢游');
    expect(cdXhs).toContain('宽窄巷子');
    expect(xaXhs).toContain('西安城墙');
    for (const copy of [hzDouyin, cdXhs, xaXhs]) {
      expect(copy).toContain(SEARCH_PLAN_SHARE_REF);
      expect(copy).toContain('D1');
      expect(copy).toContain('出行小提示');
      expect(copy).not.toContain(SEARCH_PLAN_DISCLAIMER);
      expect(copy).not.toContain('Day 1');
      expect(copy).not.toContain('一键定制');
      expect(copy).not.toContain('专属行程');
      expect(copy).not.toContain('helloroamly.com');
      expect(copy).not.toMatch(/1500/);
    }
  });
});

function miniCityPlan(city: string, spot: string) {
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
        spots: [{ name: spot, intro: '必体验：慢慢走' }],
        foods: [{ shop: '本地小店', dish: '随便吃', perCost: 30 }],
      },
    ],
  };
}
