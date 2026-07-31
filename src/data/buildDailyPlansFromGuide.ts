import type { Guide } from '@/types/domain/guide';
import type { TravelPlanActivity, TravelPlanDay } from '@/types/domain/travelPlan';

const DAY_ACTIVITY_TEMPLATES: Omit<TravelPlanActivity, 'location'>[] = [
  { time: '09:00', description: '抵达后城市漫步，熟悉街区与交通', cost: 0 },
  { time: '12:00', description: '本地小吃或平价餐馆午餐', cost: 35 },
  { time: '14:30', description: '核心景点或街区深度逛', cost: 40 },
  { time: '19:00', description: '夜景 / 夜市或轻松收尾', cost: 50 },
];

function parseGuideDayCount(daysLabel: string): number {
  const match = daysLabel.match(/(\d+)/);
  if (!match) {
    return 1;
  }
  return Math.min(14, Math.max(1, Number.parseInt(match[1], 10)));
}

function parseGuideBudgetAmount(budgetLabel: string): number {
  const match = budgetLabel.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 80;
}

export function buildDailyPlansFromGuide(guide: Guide): TravelPlanDay[] {
  const dayCount = parseGuideDayCount(guide.days);
  const perDayBudget = parseGuideBudgetAmount(guide.budget);

  return Array.from({ length: dayCount }, (_, index) => {
    const day = index + 1;
    const activities: TravelPlanActivity[] = DAY_ACTIVITY_TEMPLATES.map((template, actIndex) => ({
      ...template,
      location: actIndex === 0 ? guide.city : `${guide.city} · ${guide.tags[actIndex % guide.tags.length] ?? '街区'}`,
      cost: template.cost ?? 0,
    }));

    return {
      day,
      title: day === 1 ? `${guide.city} · ${guide.title}` : `${guide.city} 第 ${day} 天`,
      activities,
    };
  }).map((dayPlan) => ({
    ...dayPlan,
    activities: dayPlan.activities.map((activity) => ({
      ...activity,
      cost: Math.round((perDayBudget / dayPlan.activities.length) * 10) / 10,
    })),
  }));
}

export function estimateTotalCostFromGuide(guide: Guide): number {
  const days = parseGuideDayCount(guide.days);
  const perDay = parseGuideBudgetAmount(guide.budget);
  return Math.round(perDay * days);
}
