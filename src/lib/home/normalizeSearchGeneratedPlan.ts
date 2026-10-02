import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const TIP_PREFIXES = ['雨天替代：', '节假日分流：', '本地交通：'] as const;

/** 模型输出后只补结构，不改路线，不新增大段文案 */
export function normalizeSearchGeneratedPlan(plan: SearchStructuredPlan): SearchStructuredPlan {
  return {
    ...plan,
    dayList: plan.dayList.map((day) => ({
      ...day,
      foods: day.foods.map((food) => ({
        ...food,
        dish: food.dish.trim() && food.dish.trim() !== food.shop.trim() ? food.dish.trim() : food.dish.trim() || '招牌菜',
      })),
      tips: day.tips.trim(),
    })),
    globalTips: TIP_PREFIXES.map((prefix, index) => {
      const current = plan.globalTips[index]?.trim() ?? '';
      if (current.startsWith(prefix)) return current;
      const found = plan.globalTips.find((tip) => tip.trim().startsWith(prefix));
      if (found) return found.trim();
      return current ? `${prefix}${current.replace(/^(雨天替代|节假日分流|本地交通)[:：]?/, '')}` : prefix;
    }),
  };
}
