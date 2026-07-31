import type { GuidePublishEditorDraft } from '@/types/domain/guidePublish';

export type StructuredGuideCheckItem = {
  id: string;
  label: string;
  done: boolean;
  required: boolean;
};

export type StructuredGuideCompleteness = {
  items: StructuredGuideCheckItem[];
  requiredDone: number;
  requiredTotal: number;
  progress: number;
  ready: boolean;
};

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

/** 发布前结构化攻略完成度（用于发布器清单与进度条） */
export function getStructuredGuideCompleteness(
  draft: GuidePublishEditorDraft,
): StructuredGuideCompleteness {
  const filledJournalDays = draft.dailyJournal.filter((day) => hasText(day.narrative)).length;
  const hasCostLine = [
    draft.costBreakdown.transportation.amount,
    draft.costBreakdown.accommodation.amount,
    draft.costBreakdown.food.amount,
    draft.costBreakdown.entertainment.amount,
  ].some((value) => Number(value.replace(/[^\d.]/g, '')) > 0);

  const items: StructuredGuideCheckItem[] = [
    { id: 'title', label: '攻略标题', done: hasText(draft.title), required: true },
    { id: 'destination', label: '目的地', done: hasText(draft.destination), required: true },
    { id: 'days', label: '旅行天数', done: hasText(draft.days), required: true },
    { id: 'cost', label: '花费清单', done: hasCostLine && hasText(draft.costBreakdown.total), required: true },
    {
      id: 'journal',
      label: '行程流水账（至少 1 天）',
      done: filledJournalDays > 0,
      required: true,
    },
    {
      id: 'insights',
      label: '蜗牛启示（避坑雷达或宝藏点）',      done:
        hasText(draft.snailInsights.regrets) || hasText(draft.snailInsights.recommendations),
      required: true,
    },
  ];

  const requiredItems = items.filter((item) => item.required);
  const requiredDone = requiredItems.filter((item) => item.done).length;
  const requiredTotal = requiredItems.length;

  return {
    items,
    requiredDone,
    requiredTotal,
    progress: requiredTotal > 0 ? Math.round((requiredDone / requiredTotal) * 100) : 0,
    ready: requiredDone === requiredTotal,
  };
}
