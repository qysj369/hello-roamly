import type {
  SearchPlanDay,
  SearchPlanFood,
  SearchPlanIncrementFocus,
  SearchPlanSpot,
  SearchPlanTraffic,
  SearchStructuredPlan,
} from '@/types/domain/searchStructuredPlan';

function pickRicher(prev: string, next: string | undefined): string {
  const incoming = next?.trim() || '';
  if (!incoming) return prev;
  return incoming.length >= prev.trim().length ? incoming : prev;
}

function mergeSpots(prev: SearchPlanSpot[], next?: SearchPlanSpot[]): SearchPlanSpot[] {
  if (!next?.length) return prev;
  return prev.map((spot, index) => {
    const match = next.find((item) => item.name === spot.name) ?? next[index];
    return {
      name: spot.name,
      intro: pickRicher(spot.intro, match?.name === spot.name || next.length === prev.length ? match?.intro : undefined),
    };
  });
}

function mergeFoods(prev: SearchPlanFood[], next?: SearchPlanFood[]): SearchPlanFood[] {
  if (!next?.length) return prev;
  const seen = new Set(prev.map((item) => item.shop.trim()));
  const extras = next.filter((item) => item.shop?.trim() && !seen.has(item.shop.trim()));
  const updated = prev.map((food) => {
    const match = next.find((item) => item.shop === food.shop);
    if (!match) return food;
    return {
      shop: food.shop,
      dish: pickRicher(food.dish, match.dish),
      perCost: food.perCost,
    };
  });
  return extras.length > 0 ? [...updated, ...extras.slice(0, 2)] : updated;
}

function mergeTraffic(prev: SearchPlanTraffic[], next?: SearchPlanTraffic[]): SearchPlanTraffic[] {
  if (!next?.length) return prev;
  return prev.map((item, index) => ({
    desc: pickRicher(item.desc, next[index]?.desc),
  }));
}

function mergeDay(
  current: SearchPlanDay,
  incoming: SearchPlanDay | undefined,
  focus: SearchPlanIncrementFocus,
): SearchPlanDay {
  if (!incoming) return current;
  if (focus === 'spots') {
    return { ...current, spots: mergeSpots(current.spots, incoming.spots) };
  }
  if (focus === 'foods') {
    return { ...current, foods: mergeFoods(current.foods, incoming.foods) };
  }
  return { ...current, traffic: mergeTraffic(current.traffic, incoming.traffic) };
}

/** 只并入对应模块，锁住天数/标题/住宿/预算数字 */
export function mergeSearchPlanIncrement(
  current: SearchStructuredPlan,
  incoming: SearchStructuredPlan,
  focus: SearchPlanIncrementFocus,
): SearchStructuredPlan {
  return {
    baseInfo: current.baseInfo,
    budgetList: current.budgetList,
    globalTips: current.globalTips,
    dayList: current.dayList.map((day, index) => {
      const next = incoming.dayList.find((item) => item.day === day.day) ?? incoming.dayList[index];
      return mergeDay(day, next, focus);
    }),
  };
}
