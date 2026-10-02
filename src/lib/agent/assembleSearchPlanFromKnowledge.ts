import {
  foodsForParty,
  getCityTravelKnowledge,
  type CityKnowledgeSpot,
  type CityTravelKnowledge,
} from '@/lib/agent/cityTravelKnowledge';
import {
  applyHolidayRerouteLocal,
  applyRainRerouteLocal,
  recalcSearchPlanLocalBudget,
} from '@/lib/agent/patchSearchPlanLocal';
import { readTravelPreferenceMemory } from '@/lib/agent/travelPreferenceMemory';
import { classifySearchPlanParty } from '@/lib/home/searchPlanShareCopy';
import type { SearchPlanRequest, SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

function isIndoorSpot(spot: CityKnowledgeSpot): boolean {
  return /博物馆|美术馆|室内|展示馆|茶馆/.test(`${spot.name}${spot.note}`);
}

function isQuietSpot(spot: CityKnowledgeSpot): boolean {
  return /更松|清晨|人少|侧巷|背街|沿湖|滨江/.test(`${spot.note}${spot.crowd}`);
}

function cleanAltName(alt: string): string {
  return alt.replace(/(清晨|工作日|早场|一层|头班船|侧巷)$/u, '').trim() || alt;
}

function namesOverlap(left: string, right: string): boolean {
  return left === right || left.startsWith(right) || right.startsWith(left);
}

function alreadyPicked(picked: CityKnowledgeSpot[], name: string): boolean {
  return picked.some((spot) => namesOverlap(spot.name, name));
}

function pickSpots(knowledge: CityTravelKnowledge, peopleType: string, days: number): CityKnowledgeSpot[] {
  const needed = Math.max(2, days * 2);
  const focus = classifySearchPlanParty(peopleType);
  const weights = readTravelPreferenceMemory().weights;
  let pool = [...knowledge.spots];
  const preferIndoor = focus === 'family' || weights.quietBoost > 0;
  const preferQuiet = weights.viralPenalty > 0 || focus === 'couple' || focus === 'family';
  pool.sort((left, right) => {
    const indoor = Number(isIndoorSpot(right)) - Number(isIndoorSpot(left));
    const quiet = Number(isQuietSpot(right)) - Number(isQuietSpot(left));
    if (preferIndoor && indoor) return indoor;
    if (preferQuiet && quiet) return quiet;
    return 0;
  });
  if (weights.viralPenalty > 1) {
    const filtered = pool.filter((spot) => !/主街|夜市|打卡/.test(spot.crowd) || isQuietSpot(spot));
    if (filtered.length >= 2) pool = filtered;
  }
  const picked: CityKnowledgeSpot[] = [];
  for (const spot of pool) {
    if (picked.length >= needed) break;
    if (alreadyPicked(picked, spot.name)) continue;
    picked.push(spot);
  }
  const extras = [...knowledge.holidayAlts, ...knowledge.rainAlts].map((alt) => ({
    name: cleanAltName(alt),
    note: '分流补点，少走人潮',
    crowd: '节假日更松',
  }));
  for (const extra of extras) {
    if (picked.length >= needed) break;
    if (alreadyPicked(picked, extra.name)) continue;
    picked.push(extra);
  }
  return picked;
}

function themeWantsRain(theme: string | null | undefined): boolean {
  return /下雨|雨天|有雨/.test(theme ?? '');
}

function themeWantsHoliday(theme: string | null | undefined): boolean {
  return /周末|节假日|人多/.test(theme ?? '');
}

function uniquifyDaySpots(plan: SearchStructuredPlan): SearchStructuredPlan {
  const seen: string[] = [];
  return {
    ...plan,
    dayList: plan.dayList.map((day, index) => {
      const spots = day.spots.filter((spot) => {
        if (seen.some((name) => namesOverlap(name, spot.name))) return false;
        seen.push(spot.name);
        return true;
      });
      const kept = spots.length > 0 ? spots : day.spots;
      const last = index === plan.dayList.length - 1;
      const keepPatched = index === 0 && /起步慢逛/.test(day.title);
      const names = kept.map((spot) => spot.name).join('-') || '街巷';
      const title = keepPatched
        ? last && !/返程/.test(day.title)
          ? `${day.title.replace(/，?返程$/, '')}，返程`
          : day.title
        : `${names}慢逛${last ? '，返程' : ''}`;
      return { ...day, spots: kept, title };
    }),
  };
}

function skeletonBudget(days: number): SearchStructuredPlan['budgetList'] {
  const scale = Math.max(1, days) / 3;
  const nights = Math.max(0, days - 1);
  return [
    { item: '往返大交通', perPerson: 0, tip: '按出发地核算高铁/机票，不计入市内合计' },
    { item: '市内交通', perPerson: Math.round(100 * scale), tip: '' },
    { item: '餐饮', perPerson: Math.round(480 * scale), tip: '' },
    { item: '门票', perPerson: Math.round(160 * scale), tip: '' },
    { item: '住宿', perPerson: Math.round(250 * nights), tip: '' },
    { item: '机动备用金', perPerson: Math.round(100 * scale), tip: '' },
    { item: '合计', perPerson: 0, tip: '只含市内消费' },
  ];
}

/** 有知识库的城：本地拼一份松弛行程，不先打模型 */
export function assembleSearchPlanFromKnowledge(params: SearchPlanRequest): SearchStructuredPlan | null {
  const knowledge = getCityTravelKnowledge(params.targetCity);
  if (!knowledge) return null;
  const days = Math.max(1, Math.min(14, Math.round(params.days)));
  const peopleType = params.peopleType.trim() || '好友结伴';
  const foods = foodsForParty(knowledge, peopleType);
  const spots = pickSpots(knowledge, peopleType, days);
  const city = knowledge.city;
  const hotel = `${city}地铁沿线`;
  const dayList = Array.from({ length: days }, (_, index) => {
    const lead = spots[index * 2];
    const extra = spots[index * 2 + 1];
    const food = foods[index % Math.max(1, foods.length)] ?? foods[0];
    const last = index === days - 1;
    const names = extra && lead ? `${lead.name}-${extra.name}` : lead?.name ?? '街巷';
    return {
      day: index + 1,
      title: `${names}慢逛${last ? '，返程' : ''}`,
      hotelArea: last ? `${hotel}（退房寄存）` : `${hotel}（不换住）`,
      traffic: [{ desc: knowledge.transit.slice(0, 40) }],
      spots: [
        lead ? { name: lead.name, intro: `必体验：${lead.note}` } : null,
        extra ? { name: extra.name, intro: `时间充裕可选：${extra.note}` } : null,
      ].filter((item): item is { name: string; intro: string } => Boolean(item)),
      foods: food ? [{ shop: food.shop, dish: food.dish, perCost: food.perCost }] : [],
      tips: [
        lead?.note ?? '按原节奏闲逛',
        food ? `午餐${food.shop}，必点${food.dish}` : '',
        last ? '预留返程通勤。' : extra?.note ?? '',
      ]
        .filter(Boolean)
        .join('；'),
    };
  });
  const assembled = recalcSearchPlanLocalBudget({
    baseInfo: {
      startCity: params.startCity,
      targetCity: city,
      days,
      peopleType,
      budget: params.budget,
      theme: params.theme,
    },
    budgetList: skeletonBudget(days),
    dayList,
    globalTips: [
      `雨天替代：${knowledge.rainAlts.slice(0, 3).join('、')}`,
      `节假日分流：${knowledge.holidayAlts.slice(0, 3).join('、')}`,
      `本地交通：${knowledge.transit}`,
    ],
  });
  if (themeWantsRain(params.theme)) {
    return uniquifyDaySpots(applyRainRerouteLocal(assembled) ?? assembled);
  }
  if (themeWantsHoliday(params.theme)) {
    return uniquifyDaySpots(applyHolidayRerouteLocal(assembled) ?? assembled);
  }
  return uniquifyDaySpots(assembled);
}
