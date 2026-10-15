import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

/** 把结伴攻略散文收成管家面板可用的轻量行程结构（不走穷游装配） */
export function companionSketchToSearchPlan(args: {
  startCity: string;
  targetCity: string;
  text: string;
}): SearchStructuredPlan {
  const paragraphs = args.text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const snippet = (index: number) => paragraphs[index] || paragraphs[0] || args.text.slice(0, 80);
  return {
    baseInfo: {
      startCity: args.startCity,
      targetCity: args.targetCity,
      days: 3,
      peopleType: '好友结伴',
      budget: null,
      theme: '慢旅行',
    },
    budgetList: [],
    globalTips: paragraphs.slice(0, 3),
    dayList: [1, 2, 3].map((day) => ({
      day,
      title: `第${day}天 ${args.targetCity}`,
      traffic: [],
      spots: [{ name: args.targetCity, intro: snippet(day) }],
      foods: [],
      tips: snippet(day),
      hotelArea: '',
    })),
  };
}
