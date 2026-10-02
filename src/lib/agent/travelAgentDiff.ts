import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

/** 标出本轮改过的卡片字段，方便只刷新对应区块 */
export function diffSearchPlanFields(
  prev: SearchStructuredPlan | null,
  next: SearchStructuredPlan,
): string[] {
  if (!prev) return ['baseInfo', 'budgetList', 'dayList', 'globalTips'];
  const changed: string[] = [];
  const baseKeys: Array<keyof SearchStructuredPlan['baseInfo']> = [
    'targetCity',
    'days',
    'peopleType',
    'budget',
    'theme',
  ];
  if (baseKeys.some((key) => prev.baseInfo[key] !== next.baseInfo[key])) {
    changed.push('baseInfo');
  }
  if (JSON.stringify(prev.budgetList) !== JSON.stringify(next.budgetList)) {
    changed.push('budgetList');
  }
  if (JSON.stringify(prev.globalTips) !== JSON.stringify(next.globalTips)) {
    changed.push('globalTips');
  }
  next.dayList.forEach((day, index) => {
    const before = prev.dayList[index];
    if (!before || JSON.stringify(before) !== JSON.stringify(day)) {
      changed.push(`dayList.${day.day}`);
    }
  });
  if (prev.dayList.length !== next.dayList.length) {
    changed.push('dayList.length');
  }
  return changed;
}

export function describePlanFieldChanges(fields: string[]): string {
  if (fields.length === 0) return '内容未改';
  const labels = fields.map((field) => {
    if (field === 'baseInfo') return '基础信息';
    if (field === 'budgetList') return '预算明细';
    if (field === 'globalTips') return '专属贴士';
    if (field === 'dayList.length') return '天数';
    if (field.startsWith('dayList.')) return `D${field.slice('dayList.'.length)}`;
    return field;
  });
  return `只更新了${[...new Set(labels)].join('、')}`;
}
