import { foodsForParty, getCityTravelKnowledge } from '@/lib/agent/cityTravelKnowledge';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';
import { localizePlanBudgetDisplay } from '@/lib/home/localizePlanBudgetTip';
import { classifySearchPlanParty } from '@/lib/home/searchPlanShareCopy';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const BUDGET_DOWN_FACTOR = 0.85;

function parseYuanMid(amount: string): number | null {
  const range = amount.match(/(\d+)\s*[‑\-–—]\s*(\d+)/);
  if (range?.[1] && range[2]) {
    return Math.round((Number(range[1]) + Number(range[2])) / 2);
  }
  const single = amount.match(/(\d+)/);
  return single?.[1] ? Number(single[1]) : null;
}

function sumLocalBudget(plan: SearchStructuredPlan): number {
  return plan.budgetList
    .filter((item) => !/合计|总计|往返|大交通/.test(item.item))
    .reduce((sum, item) => sum + (Number(item.perPerson) || 0), 0);
}

function withTotal(plan: SearchStructuredPlan): SearchStructuredPlan {
  const total = sumLocalBudget(plan);
  return {
    ...plan,
    budgetList: plan.budgetList.map((item) =>
      /合计|总计/.test(item.item) ? { ...item, perPerson: total, tip: item.tip || '只含市内消费' } : item,
    ),
  };
}

/** 上海 3 天换人群：直接切锁定样例，不重跑整页生成 */
export function switchSearchPlanPartyLocal(
  plan: SearchStructuredPlan,
  peopleType: string,
): SearchStructuredPlan | null {
  const gold = matchSearchPlanGoldExample({
    ...plan.baseInfo,
    peopleType,
  });
  if (gold) return gold;
  return null;
}

export function replacePlanFoodsFromKnowledge(plan: SearchStructuredPlan): SearchStructuredPlan | null {
  const knowledge = getCityTravelKnowledge(plan.baseInfo.targetCity);
  if (!knowledge) return null;
  const foods = foodsForParty(knowledge, plan.baseInfo.peopleType);
  if (foods.length === 0) return null;
  return {
    ...plan,
    dayList: plan.dayList.map((day, index) => {
      const food = foods[index % foods.length];
      const current = day.foods[0];
      if (current?.shop === food.shop) {
        const alt = foods[(index + 1) % foods.length];
        return {
          ...day,
          foods: [{ shop: alt.shop, dish: alt.dish, perCost: alt.perCost }],
          tips: day.tips.replace(current.shop, alt.shop).replace(current.dish, alt.dish),
        };
      }
      return {
        ...day,
        foods: [{ shop: food.shop, dish: food.dish, perCost: food.perCost }, ...day.foods.slice(1)],
        tips: current
          ? day.tips.replace(current.shop, food.shop).replace(current.dish, food.dish)
          : day.tips,
      };
    }),
  };
}

export function lowerSearchPlanBudget(plan: SearchStructuredPlan): SearchStructuredPlan {
  const next = {
    ...plan,
    budgetList: plan.budgetList.map((item) => {
      if (/往返|大交通|合计|总计/.test(item.item)) return item;
      if (/市内交通/.test(item.item)) return item;
      return {
        ...item,
        perPerson: Math.max(10, Math.round((item.perPerson * BUDGET_DOWN_FACTOR) / 10) * 10),
        tip: item.tip.includes('已按松弛降档') ? item.tip : `${item.tip}；已按松弛降档少排收费点`.replace(/^；/, ''),
      };
    }),
  };
  return withTotal(next);
}

export function recalcSearchPlanLocalBudget(plan: SearchStructuredPlan): SearchStructuredPlan {
  const city = plan.baseInfo.targetCity;
  const days = plan.baseInfo.days;
  const party = plan.baseInfo.peopleType;
  const next = {
    ...plan,
    budgetList: plan.budgetList.map((item) => {
      const display = localizePlanBudgetDisplay(city, days, item.item, party);
      if (!display) return item;
      if (/往返|大交通/.test(item.item)) {
        return { ...item, perPerson: 0, tip: display.detail };
      }
      if (/合计|总计/.test(item.item)) {
        return { ...item, tip: display.detail };
      }
      const mid = parseYuanMid(display.amount);
      return {
        ...item,
        perPerson: mid ?? item.perPerson,
        tip: display.detail,
      };
    }),
  };
  return withTotal(next);
}

function markReturnDay(title: string): string {
  return /返程/.test(title) ? title : `${title.replace(/，?返程$/, '')}，返程`;
}

/** 只改天数：缩短保留前面几天，加长用知识库补一天 */
export function resizeSearchPlanDays(plan: SearchStructuredPlan, days: number): SearchStructuredPlan | null {
  const nextDays = Math.max(1, Math.min(14, Math.round(days)));
  if (nextDays === plan.baseInfo.days) return plan;
  if (nextDays < plan.dayList.length) {
    const dayList = plan.dayList.slice(0, nextDays).map((day, index) =>
      index === nextDays - 1 ? { ...day, day: index + 1, title: markReturnDay(day.title) } : { ...day, day: index + 1 },
    );
    return recalcSearchPlanLocalBudget({
      ...plan,
      baseInfo: { ...plan.baseInfo, days: nextDays },
      dayList,
    });
  }
  const knowledge = getCityTravelKnowledge(plan.baseInfo.targetCity);
  const extra = knowledge?.spots.find((spot) => !plan.dayList.some((day) => day.spots.some((item) => item.name === spot.name)));
  const added = {
    day: plan.dayList.length + 1,
    title: extra ? `${extra.name}慢逛${nextDays === plan.dayList.length + 1 ? '，返程' : ''}` : `街巷慢逛${nextDays === plan.dayList.length + 1 ? '，返程' : ''}`,
    hotelArea: plan.dayList[0]?.hotelArea || '',
    traffic: [{ desc: knowledge?.transit.slice(0, 36) || '市内地铁接驳' }],
    spots: extra ? [{ name: extra.name, intro: `必体验：${extra.note}` }] : [],
    foods: plan.dayList[0]?.foods.slice(0, 1) ?? [],
    tips: extra ? `${extra.note}；${extra.crowd}` : '按原节奏补一天闲逛，预留返程。',
  };
  const dayList = [
    ...plan.dayList.map((day) => ({ ...day, title: day.title.replace(/，返程/, '') })),
    added,
  ];
  if (dayList.length < nextDays) return null;
  return recalcSearchPlanLocalBudget({
    ...plan,
    baseInfo: { ...plan.baseInfo, days: dayList.length },
    dayList: dayList.map((day, index) => ({ ...day, day: index + 1 })),
  });
}

export function removePlanSpot(
  plan: SearchStructuredPlan,
  name: string,
  day?: number,
): SearchStructuredPlan | null {
  const target = name.trim();
  if (!target) return null;
  let touched = false;
  const dayList = plan.dayList.map((item) => {
    if (day && item.day !== day) return item;
    const spots = item.spots.filter((spot) => !spot.name.includes(target));
    if (spots.length === item.spots.length) return item;
    touched = true;
    return {
      ...item,
      spots,
      title: item.title.replace(new RegExp(`-?${target}`), '').replace(/--/, '-'),
    };
  });
  return touched ? { ...plan, dayList } : null;
}

export function addPlanSpotFromKnowledge(
  plan: SearchStructuredPlan,
  name?: string,
  day?: number,
): SearchStructuredPlan | null {
  const knowledge = getCityTravelKnowledge(plan.baseInfo.targetCity);
  if (!knowledge) return null;
  const used = new Set(plan.dayList.flatMap((item) => item.spots.map((spot) => spot.name)));
  const extra =
    knowledge.spots.find((spot) => name && spot.name.includes(name)) ||
    knowledge.spots.find((spot) => !used.has(spot.name));
  if (!extra) return null;
  const index = day ? plan.dayList.findIndex((item) => item.day === day) : Math.max(0, plan.dayList.length - 2);
  const target = plan.dayList[index] ?? plan.dayList[0];
  if (!target || target.spots.some((spot) => spot.name === extra.name)) return null;
  return {
    ...plan,
    dayList: plan.dayList.map((item) =>
      item.day === target.day
        ? {
            ...item,
            spots: [...item.spots, { name: extra.name, intro: `必体验：${extra.note}` }].slice(0, 3),
          }
        : item,
    ),
  };
}

function cleanAltName(alt: string): string {
  return alt.replace(/(清晨|工作日|早场|一层|头班船)$/u, '').trim() || alt;
}

function namesOverlap(left: string, right: string): boolean {
  return left === right || left.startsWith(right) || right.startsWith(left);
}

function dayLooksIndoor(day: SearchStructuredPlan['dayList'][number]): boolean {
  return day.spots.some((spot) => /博物馆|美术馆|室内|展示馆|茶馆/.test(spot.name));
}

function patchLeadAcrossDays(
  plan: SearchStructuredPlan,
  leads: string[],
  intro: string,
  tipPrefix: string,
  tipBody: string,
  dayTip: string,
): SearchStructuredPlan | null {
  if (!plan.dayList[0] || leads.length === 0) return null;
  let titled = false;
  const dayList = plan.dayList.map((day, index) => {
    const name = cleanAltName(leads[index % leads.length] ?? leads[0]!);
    if (index > 0 && dayLooksIndoor(day)) return day;
    const already = day.spots.some((spot) => namesOverlap(spot.name, name));
    const spots = already ? day.spots : [{ name, intro }, ...day.spots].slice(0, 3);
    const title =
      !titled && !day.title.includes(name.slice(0, 4)) ? `${name}起步慢逛` : day.title;
    if (title !== day.title) titled = true;
    const tips = day.tips.includes(dayTip.slice(0, 4))
      ? day.tips
      : `${day.tips}${day.tips ? '；' : ''}${dayTip}`;
    return { ...day, title, spots, tips };
  });
  const labeled = tipPrefix ? `${tipPrefix}${tipBody}` : '';
  const globalTips =
    !tipPrefix
      ? plan.globalTips
      : plan.globalTips.some((tip) => tip.startsWith(tipPrefix))
        ? plan.globalTips.map((tip) => (tip.startsWith(tipPrefix) ? labeled : tip))
        : [labeled, ...plan.globalTips];
  return { ...plan, globalTips, dayList };
}

/** 下雨：室外日换室内点，并写上雨天替代贴士 */
export function applyRainRerouteLocal(plan: SearchStructuredPlan): SearchStructuredPlan | null {
  const knowledge = getCityTravelKnowledge(plan.baseInfo.targetCity);
  if (!knowledge?.rainAlts[0]) return null;
  return patchLeadAcrossDays(
    plan,
    knowledge.rainAlts,
    '雨天室内替代，少走路',
    '雨天替代：',
    knowledge.rainAlts.slice(0, 3).join('、'),
    '下雨先走室内。',
  );
}

/** 节假日：换分流点，并写上人少替代贴士 */
export function applyHolidayRerouteLocal(plan: SearchStructuredPlan): SearchStructuredPlan | null {
  const knowledge = getCityTravelKnowledge(plan.baseInfo.targetCity);
  if (!knowledge?.holidayAlts[0]) return null;
  return patchLeadAcrossDays(
    plan,
    knowledge.holidayAlts,
    '节假日分流，少走人潮主台阶',
    '节假日分流：',
    knowledge.holidayAlts.slice(0, 3).join('、'),
    '节假日改走人少点。',
  );
}

/** 少走路：首日改馆内可坐的点 */
export function applyEasyWalkLocal(plan: SearchStructuredPlan): SearchStructuredPlan | null {
  const knowledge = getCityTravelKnowledge(plan.baseInfo.targetCity);
  const easy =
    knowledge?.spots.find((spot) => /博物馆|室内|茶馆|公园|少走路|亲子/.test(`${spot.name}${spot.note}`))
    ?? knowledge?.rainAlts[0];
  if (!easy) return null;
  const name = typeof easy === 'string' ? easy : easy.name;
  return patchLeadAcrossDays(
    plan,
    [name],
    '少走路，馆内可坐',
    '',
    '',
    '少走路，馆内可坐。',
  );
}

export function partyFocusLabel(peopleType: string): string {
  const focus = classifySearchPlanParty(peopleType);
  if (focus === 'family') return '亲子少走路';
  if (focus === 'couple') return '情侣错峰日落';
  if (focus === 'solo') return '单人少换乘';
  if (focus === 'friends') return '好友避人流探店';
  return peopleType;
}
