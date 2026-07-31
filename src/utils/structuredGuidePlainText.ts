import { AI_SNAIL_COST_ROWS, type AiSnailGuideResult } from '@/types/domain/aiSnailGuide';

/** 结构化攻略 — 纯文本导出（复制 / 分享） */
export function formatStructuredGuidePlainText(guide: AiSnailGuideResult): string {
  const lines: string[] = [
    guide.title,
    `${guide.destination} · ${guide.days} 天 · 预算 ${guide.budgetLabel} · ${guide.interests.join('、')}`,
    '',
    '【花费清单】',
  ];

  for (const row of AI_SNAIL_COST_ROWS) {
    const item = guide.costBreakdown[row.key];
    lines.push(`- ${row.label}：¥${item.amount}`);
    for (const tip of item.savingTips) {
      lines.push(`  · ${tip}`);
    }
  }
  lines.push(`- 总计：¥${guide.costBreakdown.total}`);
  lines.push('');
  lines.push('【行程流水账】');

  for (const day of guide.dailyJournal) {
    lines.push(`第 ${day.day} 天`);
    lines.push(day.narrative);
    if (day.expenses.length > 0) {
      lines.push(
        `开销：${day.expenses.map((expense) => `${expense.item} ¥${expense.amount}`).join('、')}`,
      );
    }
    for (const tip of day.tips) {
      lines.push(`贴士：${tip}`);
    }
    lines.push('');
  }

  lines.push('【蜗牛启示】');
  lines.push(`最后悔的事/避坑：${guide.snailInsights.regrets}`);
  lines.push(`最推荐的事/宝藏：${guide.snailInsights.recommendations}`);

  return lines.join('\n');
}

export async function copyStructuredGuidePlainText(guide: AiSnailGuideResult): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(formatStructuredGuidePlainText(guide));
    return true;
  } catch {
    return false;
  }
}
