import { localizePlanBudgetDisplay } from '@/lib/home/localizePlanBudgetTip';
import { searchPlanBudgetLabel } from '@/lib/home/formatSearchPlanCopyText';
import type { SearchPlanDay, SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export type SharePlanDayOutline = {
  day: number;
  title: string;
  highlight: string;
};

export type SharePlanOutline = {
  budgetLine: string;
  days: SharePlanDayOutline[];
  tips: string[];
};

export function sharePlanDayTitle(day: SearchPlanDay): string {
  return day.title.replace(/^第\d+天\s*/u, '').trim() || `第${day.day}天`;
}

function shopShortName(shop: string): string {
  return shop.replace(/（[^）]*）$/u, '').trim();
}

export function sharePlanDayHighlight(day: SearchPlanDay): string {
  const tip = day.tips.trim();
  if (tip) return tip.startsWith('【行程亮点】') ? tip : `【行程亮点】${tip}`;
  const must = day.spots.find((spot) => /必体验/.test(spot.intro))?.name.trim();
  const spot = must || day.spots[0]?.name.trim() || '';
  const food = shopShortName(day.foods[0]?.shop.trim() || '');
  return [spot, food].filter(Boolean).join(' · ');
}

export function sharePlanHeaderMeta(plan: SearchStructuredPlan): string {
  const { targetCity, days, peopleType } = plan.baseInfo;
  const local = localizePlanBudgetDisplay(targetCity, days, '合计', peopleType);
  return [targetCity, `${days}天`, peopleType, local?.amount ?? ''].filter(Boolean).join(' · ');
}

function shortenShareTip(tip: string): string {
  if (tip.length <= 40) return tip;
  const colon = tip.indexOf('：');
  const label = colon >= 0 ? tip.slice(0, colon + 1) : '';
  const body = colon >= 0 ? tip.slice(colon + 1) : tip;
  const first = body.split(/[；;。]/u)[0]?.trim() ?? body.trim();
  const compact = `${label}${first}`.trim();
  if (compact.length <= 40) return compact;
  return `${compact.slice(0, 40).replace(/[，,、]$/u, '')}…`;
}

export function sharePlanBudgetLine(plan: SearchStructuredPlan): string {
  const local = localizePlanBudgetDisplay(
    plan.baseInfo.targetCity,
    plan.baseInfo.days,
    '合计',
    plan.baseInfo.peopleType,
  );
  if (local) {
    const detail = local.detail.replace(/，按上面五项本地区间合计$/u, '').replace(/按上面五项本地区间合计/u, '');
    return `${local.amount} · ${detail}`;
  }
  const total = plan.budgetList.find((item) => /合计/.test(item.item));
  if (total?.perPerson) {
    return `合计人均${total.perPerson}元`;
  }
  return searchPlanBudgetLabel(plan);
}

export function getSharePlanOutline(plan: SearchStructuredPlan): SharePlanOutline {
  return {
    budgetLine: sharePlanBudgetLine(plan),
    days: plan.dayList.map((day) => ({
      day: day.day,
      title: sharePlanDayTitle(day),
      highlight: sharePlanDayHighlight(day),
    })),
    tips: plan.globalTips
      .map((tip) => shortenShareTip(tip.trim()))
      .filter(Boolean)
      .slice(0, 3),
  };
}
