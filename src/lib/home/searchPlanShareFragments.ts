import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type SearchPlanShareFragment = {
  name: string;
  caption: string;
  kind: 'spot' | 'food';
};

export function shopShortName(shop: string): string {
  return shop.replace(/（[^）]*）$/u, '').trim();
}

/** 行程拆成单景点 / 单店碎片，不拼多日总览。 */
export function collectSearchPlanShareFragments(plan: SearchStructuredPlan): SearchPlanShareFragment[] {
  const items: SearchPlanShareFragment[] = [];
  const seen = new Set<string>();
  for (const day of plan.dayList) {
    for (const spot of day.spots) {
      const name = spot.name.trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      items.push({ name, caption: spot.intro.trim(), kind: 'spot' });
    }
    for (const food of day.foods) {
      const name = shopShortName(food.shop);
      if (!name || seen.has(name)) continue;
      seen.add(name);
      items.push({ name, caption: food.dish.trim(), kind: 'food' });
    }
  }
  return items;
}
