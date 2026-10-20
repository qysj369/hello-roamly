import { describe, expect, it } from 'vitest';
import {
  buildSearchPlanDouyinPlatformCopy,
  buildSearchPlanWechatPlatformCopy,
  formatSearchPlanPlatformClipboard,
  searchPlanCatchyTitle,
  searchPlanHeaderLine,
  searchPlanPublicHashtags,
  searchPlanShareHashtags,
  searchPlanShareHook,
} from '@/lib/home/searchPlanShareCopy';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const plan: SearchStructuredPlan = {
  baseInfo: {
    startCity: '济南',
    targetCity: '上海',
    days: 3,
    peopleType: '好友结伴',
    budget: null,
    theme: null,
  },
  budgetList: [{ item: '合计', perPerson: 1800, tip: '' }],
  globalTips: [],
  dayList: [
    {
      day: 1,
      title: '老城厢慢行',
      hotelArea: '豫园',
      tips: '绕开城隍庙主街，钻进小巷吃生煎。',
      traffic: [],
      spots: [{ name: '豫园', intro: '必体验' }],
      foods: [{ shop: '南翔馒头店', dish: '蟹粉小笼', perCost: 40 }],
    },
  ],
};

describe('searchPlanShareCopy', () => {
  it('writes city days party and local budget range', () => {
    expect(searchPlanHeaderLine(plan)).toMatch(/^上海 · 3天 · 好友结伴 · 约/);
    expect(searchPlanHeaderLine(plan)).not.toContain('未设置预算');
  });

  it('builds a catchy share title instead of a flat 行程 label', () => {
    expect(searchPlanCatchyTitle(plan)).toBe('《上海3天｜和好友避开人流的老城松弛路线》');
    expect(searchPlanCatchyTitle(plan)).not.toContain('上海3天行程');
  });

  it('builds platform hashtags and a forwardable hook', () => {
    expect(searchPlanShareHashtags(plan)).toEqual(['上海好友旅行', '上海老城慢游', '上海平价探店']);
    expect(searchPlanPublicHashtags(plan)).toEqual([
      '上海好友旅行',
      '上海老城慢游',
      '上海街巷漫游',
    ]);
    expect(searchPlanShareHook(plan)).toBe(
      '这条路线躲开网红扎堆点位，节奏松弛，适合好友慢悠悠逛吃上海',
    );
  });

  it('writes distinct wechat and douyin copy for the same seaside route', () => {
    const qingdao: SearchStructuredPlan = {
      baseInfo: {
        startCity: '济南',
        targetCity: '青岛',
        days: 3,
        peopleType: '情侣',
        budget: null,
        theme: null,
      },
      budgetList: [],
      globalTips: [],
      dayList: [
        {
          day: 1,
          title: '八大关看海',
          hotelArea: '',
          tips: '错峰看日落',
          traffic: [],
          spots: [{ name: '八大关', intro: '海边日落，人少' }],
          foods: [],
        },
      ],
    };
    const wechat = buildSearchPlanWechatPlatformCopy(qingdao);
    const douyin = buildSearchPlanDouyinPlatformCopy(qingdao);
    expect(wechat).toEqual({
      title: '青岛3天｜和情侣错峰看日落的八大关路线',
      hook: '沿着海边慢慢逛，在八大关等待一场橘色落日，人少安静，适合两个人慢悠悠放空。',
      hashtags: ['青岛旅行', '八大关', '海边日落'],
    });
    expect(douyin).toEqual({
      title: '青岛小众看海路线！八大关落日真的美哭✨',
      hook: '错峰出行避开人潮，在海边等一场浪漫日落。',
      hashtags: ['青岛旅游', '八大关日落', '山东旅游'],
    });
    expect(formatSearchPlanPlatformClipboard(wechat)).toBe(
      '青岛3天｜和情侣错峰看日落的八大关路线\n沿着海边慢慢逛，在八大关等待一场橘色落日，人少安静，适合两个人慢悠悠放空。\n#青岛旅行 #八大关 #海边日落',
    );
    expect(wechat.title).not.toBe(douyin.title);
  });

  it('prefers a seaside sunset spot over an earlier indoor stop', () => {
    const qingdao: SearchStructuredPlan = {
      baseInfo: {
        startCity: '济南',
        targetCity: '青岛',
        days: 3,
        peopleType: '情侣',
        budget: null,
        theme: null,
      },
      budgetList: [],
      globalTips: [],
      dayList: [
        {
          day: 1,
          title: '雨天室内',
          hotelArea: '',
          tips: '雨天少走路',
          traffic: [],
          spots: [
            { name: '青岛啤酒博物馆', intro: '室内' },
            { name: '八大关', intro: '海边日落' },
            { name: '栈桥', intro: '看海' },
          ],
          foods: [],
        },
      ],
    };
    const wechat = buildSearchPlanWechatPlatformCopy(qingdao);
    const douyin = buildSearchPlanDouyinPlatformCopy(qingdao);
    expect(wechat.title).toBe('青岛3天｜和情侣错峰看日落的八大关路线');
    expect(wechat.hook).toContain('在八大关等待一场橘色落日');
    expect(wechat.hashtags).toEqual(['青岛旅行', '八大关', '海边日落']);
    expect(douyin.title).toBe('青岛小众看海路线！八大关落日真的美哭✨');
    expect(douyin.hashtags).toEqual(['青岛旅游', '八大关日落', '山东旅游']);
    expect(wechat.title).not.toContain('博物馆');
    expect(douyin.title).not.toContain('博物馆');
  });
});
