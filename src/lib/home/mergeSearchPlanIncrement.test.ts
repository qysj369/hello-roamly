import { describe, expect, it } from 'vitest';
import { mergeSearchPlanIncrement } from '@/lib/home/mergeSearchPlanIncrement';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const current: SearchStructuredPlan = {
  baseInfo: {
    startCity: '济南',
    targetCity: '杭州',
    days: 2,
    peopleType: '好友结伴',
    budget: null,
    theme: '山水徒步',
  },
  budgetList: [{ item: '合计', perPerson: 1800, tip: '' }],
  globalTips: ['带伞'],
  dayList: [
    {
      day: 1,
      title: '第1天 西湖',
      hotelArea: '西湖文化广场',
      tips: '早点出门',
      traffic: [{ desc: '地铁1号线' }],
      spots: [{ name: '西湖', intro: '湖' }],
      foods: [{ shop: '奎元馆', dish: '片儿川', perCost: 25 }],
    },
    {
      day: 2,
      title: '第2天 返程',
      hotelArea: '西湖文化广场',
      tips: '预留进站',
      traffic: [{ desc: '地铁去杭州东' }],
      spots: [{ name: '九溪', intro: '溪' }],
      foods: [{ shop: '知味观', dish: '糕点', perCost: 15 }],
    },
  ],
};

describe('mergeSearchPlanIncrement', () => {
  it('spots 只加长介绍，预算/美食/交通/标题不动', () => {
    const incoming: SearchStructuredPlan = {
      ...current,
      baseInfo: { ...current.baseInfo, days: 9 },
      budgetList: [{ item: '合计', perPerson: 1, tip: '改掉' }],
      dayList: [
        {
          ...current.dayList[0]!,
          title: '不该出现',
          hotelArea: '换酒店',
          traffic: [{ desc: '改交通' }],
          foods: [{ shop: '新店', dish: '新菜', perCost: 99 }],
          spots: [{ name: '西湖', intro: '西湖 mist 与苏堤，适合慢走半日。' }],
        },
        current.dayList[1]!,
      ],
    };
    const next = mergeSearchPlanIncrement(current, incoming, 'spots');
    expect(next.baseInfo.days).toBe(2);
    expect(next.budgetList[0]?.perPerson).toBe(1800);
    expect(next.dayList[0]?.title).toBe('第1天 西湖');
    expect(next.dayList[0]?.hotelArea).toBe('西湖文化广场');
    expect(next.dayList[0]?.foods).toEqual(current.dayList[0]?.foods);
    expect(next.dayList[0]?.traffic).toEqual(current.dayList[0]?.traffic);
    expect(next.dayList[0]?.spots[0]?.name).toBe('西湖');
    expect(next.dayList[0]?.spots[0]?.intro).toContain('苏堤');
  });

  it('foods 可追加餐馆，不改景点与预算', () => {
    const incoming: SearchStructuredPlan = {
      ...current,
      dayList: [
        {
          ...current.dayList[0]!,
          spots: [{ name: '西湖', intro: '被改掉的介绍' }],
          foods: [
            { shop: '奎元馆', dish: '片儿川加葱', perCost: 80 },
            { shop: '楼外楼', dish: '西湖醋鱼', perCost: 88 },
          ],
        },
        current.dayList[1]!,
      ],
    };
    const next = mergeSearchPlanIncrement(current, incoming, 'foods');
    expect(next.dayList[0]?.spots[0]?.intro).toBe('湖');
    expect(next.dayList[0]?.foods[0]?.shop).toBe('奎元馆');
    expect(next.dayList[0]?.foods[0]?.perCost).toBe(25);
    expect(next.dayList[0]?.foods[0]?.dish).toContain('片儿川');
    expect(next.dayList[0]?.foods.some((item) => item.shop === '楼外楼')).toBe(true);
    expect(next.budgetList).toEqual(current.budgetList);
  });

  it('traffic 只加长描述', () => {
    const incoming: SearchStructuredPlan = {
      ...current,
      dayList: [
        {
          ...current.dayList[0]!,
          traffic: [{ desc: '地铁1号线，凤起路换乘2号线，出站步行8分钟' }],
        },
        current.dayList[1]!,
      ],
    };
    const next = mergeSearchPlanIncrement(current, incoming, 'traffic');
    expect(next.dayList[0]?.traffic[0]?.desc).toContain('换乘2号线');
    expect(next.dayList[0]?.spots).toEqual(current.dayList[0]?.spots);
    expect(next.dayList[0]?.foods).toEqual(current.dayList[0]?.foods);
  });
});
