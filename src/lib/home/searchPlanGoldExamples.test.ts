import { describe, expect, it } from 'vitest';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';
import {
  searchPlanCatchyTitle,
  searchPlanHeaderLine,
  searchPlanShareHashtags,
  searchPlanShareHook,
} from '@/lib/home/searchPlanShareCopy';

const base = {
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  budget: null,
  theme: null,
};

describe('matchSearchPlanGoldExample', () => {
  it('locks the Shanghai 3-day friends itinerary and share copy', () => {
    const plan = matchSearchPlanGoldExample({ ...base, peopleType: '好友结伴' });
    expect(plan?.dayList.map((day) => day.title)).toEqual([
      '人民广场-南京东路-外滩滨江慢逛',
      '豫园-城隍庙-新天地石库门慢逛',
      '武康路-安福路街巷慢逛，返程',
    ]);
    expect(plan?.dayList[0]?.foods[0]).toMatchObject({ shop: '沈大成', dish: '蟹粉小笼、鲜肉条头糕' });
    expect(plan?.dayList[0]?.tips).toContain('沈大成');
    expect(plan?.globalTips[1]).toContain('北外滩滨江');
    expect(searchPlanHeaderLine(plan!)).toBe('上海 · 3天 · 好友结伴 · 约1210‑1800元');
    expect(searchPlanCatchyTitle(plan!)).toBe('《上海3天｜和好友避开人流的老城松弛路线》');
    expect(searchPlanShareHook(plan!)).toBe(
      '这条路线躲开网红扎堆点位，节奏松弛，适合好友慢悠悠逛吃上海',
    );
    expect(searchPlanShareHashtags(plan!)).toEqual([
      '上海好友旅行',
      '上海老城慢游',
      '上海平价探店',
    ]);
  });

  it('switches Shanghai 3-day copy when the party changes', () => {
    const friends = matchSearchPlanGoldExample({ ...base, peopleType: '好友结伴' });
    const couple = matchSearchPlanGoldExample({ ...base, peopleType: '情侣' });
    const family = matchSearchPlanGoldExample({ ...base, peopleType: '亲子' });
    const solo = matchSearchPlanGoldExample({ ...base, peopleType: '单人' });
    expect(couple?.dayList[0]?.tips).toContain('日落');
    expect(family?.dayList[0]?.tips).toContain('少走路');
    expect(solo?.dayList[0]?.tips).toContain('单人');
    expect(couple?.dayList[0]?.title).not.toBe(friends?.dayList[0]?.title);
    expect(family?.globalTips.join('')).not.toBe(friends?.globalTips.join(''));
    expect(searchPlanCatchyTitle(couple!)).toContain('情侣');
    expect(searchPlanShareHashtags(family!)).toEqual(
      expect.arrayContaining(['上海亲子旅行', '上海少走路']),
    );
    expect(searchPlanShareHook(solo!)).toContain('一个人也能松弛逛吃上海');
  });

  it('does not lock other cities or day counts', () => {
    expect(matchSearchPlanGoldExample({ ...base, peopleType: '好友结伴', targetCity: '杭州' })).toBeNull();
    expect(matchSearchPlanGoldExample({ ...base, peopleType: '好友结伴', days: 4 })).toBeNull();
  });
});
