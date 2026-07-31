import type { TravelPlan } from '@/types/domain/travelPlan';
import { travelPlanDetailPath } from '@/router/paths';
import { formatDateZh } from '@/utils/date';
import {
  getPlanDestination,
  getPlanDaysLabel,
  getPlanGeneratedAt,
  getPlanPracticalInfo,
  getPlanSuitableAudience,
  getPlanTotalCostLabel,
} from '@/utils/travelPlanView';

function appendPracticalSection(
  lines: string[],
  title: string,
  tips: string[],
): void {
  if (tips.length === 0) {
    return;
  }
  lines.push('', title);
  tips.forEach((tip) => {
    lines.push(`  · ${tip}`);
  });
}

/** 将旅行计划格式化为可复制的纯文本行程 */
export function formatTravelPlanItineraryText(plan: TravelPlan): string {
  const lines: string[] = [
    plan.title,
    '═'.repeat(Math.min(plan.title.length, 40)),
    '',
    plan.summary,
    '',
    `目的地：${getPlanDestination(plan)}`,
    `总预算：${getPlanTotalCostLabel(plan)}`,
    `总天数：${getPlanDaysLabel(plan)}`,
    `适合人群：${getPlanSuitableAudience(plan)}`,
    `创建时间：${formatDateZh(getPlanGeneratedAt(plan))}`,
  ];

  if (plan.tags.length > 0) {
    lines.push(`标签：${plan.tags.join('、')}`);
  }

  lines.push('', '【每日行程】');

  plan.dailyPlans.forEach((day) => {
    lines.push('', `第 ${day.day} 天 · ${day.title}`);
    day.activities.forEach((activity) => {
      const parts = [`  ${activity.time}`, activity.description];
      if (activity.location) {
        parts.push(`@ ${activity.location}`);
      }
      if (activity.cost != null && activity.cost > 0) {
        parts.push(`¥${activity.cost}`);
      }
      lines.push(parts.join(' · '));
    });
  });

  const practical = getPlanPracticalInfo(plan);
  appendPracticalSection(lines, '【住宿建议】', practical.accommodationTips);
  appendPracticalSection(lines, '【交通提示】', practical.transportationTips);
  appendPracticalSection(lines, '【注意事项】', practical.precautions);

  if (typeof window !== 'undefined') {
    lines.push('', `详情链接：${window.location.origin}${travelPlanDetailPath(plan.id)}`);
  }

  lines.push('', `— 由 Hello Roamly 生成`);
  return lines.join('\n');
}
