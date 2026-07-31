import {
  AI_SNAIL_COST_ROWS,
  type AiSnailCostItem,
  type AiSnailGuideResult,
} from '@/types/domain/aiSnailGuide';
import type {
  GuidePublishEditorDraft,
  PublishedGuideRecord,
} from '@/types/domain/guidePublish';
import type { Guide } from '@/types/domain/guide';
import type { UserId } from '@/types/domain/user/userId';

/** 发布记录 → 详情页 Guide（含结构化三大板块） */
export function publishedRecordToGuide(record: PublishedGuideRecord): Guide {
  return {
    ...record.listMeta,
    structured: record.content,
    aiAssisted: record.aiAssisted ?? Boolean(record.sourceGuideId),
    authorId: record.authorId,
    publishedAt: record.publishedAt,
    kind: 'structured',
  };
}

/** 空白结构化攻略草稿（默认 3 天） */
export function createEmptyGuidePublishDraft(days = 3): GuidePublishEditorDraft {
  return syncDailyJournalWithDays({
    title: '',
    destination: '',
    days: String(days),
    budgetLabel: '',
    interests: '',
    costBreakdown: {
      transportation: { amount: '', savingTips: '' },
      accommodation: { amount: '', savingTips: '' },
      food: { amount: '', savingTips: '' },
      entertainment: { amount: '', savingTips: '' },
      total: '',
    },
    dailyJournal: [],
    snailInsights: { regrets: '', recommendations: '' },
  });
}

function tipsToText(tips: string[]): string {
  return tips.join('\n');
}

function textToTips(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function costItemToDraft(item: AiSnailCostItem): GuidePublishEditorDraft['costBreakdown']['food'] {
  return {
    amount: String(item.amount),
    savingTips: tipsToText(item.savingTips),
  };
}

/** AI 生成结果 → 发布编辑器草稿（与前台展示器字段一一对应） */
export function aiSnailGuideToEditorDraft(guide: AiSnailGuideResult): GuidePublishEditorDraft {
  return syncDailyJournalWithDays({
    title: guide.title,
    destination: guide.destination,
    days: String(guide.days),
    budgetLabel: guide.budgetLabel,
    interests: guide.interests.join('、'),
    costBreakdown: {
      transportation: costItemToDraft(guide.costBreakdown.transportation),
      accommodation: costItemToDraft(guide.costBreakdown.accommodation),
      food: costItemToDraft(guide.costBreakdown.food),
      entertainment: costItemToDraft(guide.costBreakdown.entertainment),
      total: String(guide.costBreakdown.total),
    },
    dailyJournal: guide.dailyJournal.map((day) => ({
      day: day.day,
      narrative: day.narrative,
      expenses: day.expenses.map((expense) => ({
        item: expense.item,
        amount: String(expense.amount),
      })),
      tips: tipsToText(day.tips),
    })),
    snailInsights: {
      regrets: guide.snailInsights.regrets,
      recommendations: guide.snailInsights.recommendations,
    },
  });
}

function parseAmount(value: string, fallback = 0): number {
  const parsed = Number(value.replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function emptyJournalDay(day: number): GuidePublishEditorDraft['dailyJournal'][number] {
  return { day, narrative: '', expenses: [], tips: '' };
}

/** 按「天数」同步行程流水账条目数（增删天并保持已有内容） */
export function syncDailyJournalWithDays(draft: GuidePublishEditorDraft): GuidePublishEditorDraft {
  const targetDays = Math.max(1, parseAmount(draft.days, 1));
  const byDay = new Map(draft.dailyJournal.map((entry) => [entry.day, entry]));
  const dailyJournal = Array.from({ length: targetDays }, (_, index) => {
    const day = index + 1;
    return byDay.get(day) ?? emptyJournalDay(day);
  });
  return { ...draft, dailyJournal };
}

/** 发布编辑器草稿 → 完整攻略内容 */
export function editorDraftToAiSnailGuide(
  draft: GuidePublishEditorDraft,
  sourceId?: string,
): AiSnailGuideResult {
  const days = Math.max(1, parseAmount(draft.days, 1));
  const interests = draft.interests
    .split(/[、,，]/)
    .map((item) => item.trim())
    .filter(Boolean);

  const breakdown = {
    transportation: {
      amount: parseAmount(draft.costBreakdown.transportation.amount),
      savingTips: textToTips(draft.costBreakdown.transportation.savingTips),
    },
    accommodation: {
      amount: parseAmount(draft.costBreakdown.accommodation.amount),
      savingTips: textToTips(draft.costBreakdown.accommodation.savingTips),
    },
    food: {
      amount: parseAmount(draft.costBreakdown.food.amount),
      savingTips: textToTips(draft.costBreakdown.food.savingTips),
    },
    entertainment: {
      amount: parseAmount(draft.costBreakdown.entertainment.amount),
      savingTips: textToTips(draft.costBreakdown.entertainment.savingTips),
    },
    total: parseAmount(draft.costBreakdown.total),
  };

  if (!breakdown.total) {
    breakdown.total =
      breakdown.transportation.amount +
      breakdown.accommodation.amount +
      breakdown.food.amount +
      breakdown.entertainment.amount;
  }

  return {
    id: sourceId ?? `snail-draft-${Date.now()}`,
    title: draft.title.trim(),
    destination: draft.destination.trim(),
    days,
    budgetLabel: draft.budgetLabel.trim(),
    interests,
    costBreakdown: breakdown,
    dailyJournal: draft.dailyJournal.map((day) => ({
      day: day.day,
      narrative: day.narrative.trim(),
      expenses: day.expenses
        .filter((expense) => expense.item.trim() || expense.amount.trim())
        .map((expense) => ({
          item: expense.item.trim(),
          amount: parseAmount(expense.amount),
        })),
      tips: textToTips(day.tips),
    })),
    snailInsights: {
      regrets: draft.snailInsights.regrets.trim(),
      recommendations: draft.snailInsights.recommendations.trim(),
    },
    generatedAt: new Date().toISOString(),
  };
}

/** 从草稿构建与前台 StructuredGuideViewer 一致的攻略内容 */
export function buildStructuredGuideContent(
  draft: GuidePublishEditorDraft,
  sourceId?: string,
): AiSnailGuideResult {
  return editorDraftToAiSnailGuide(syncDailyJournalWithDays(draft), sourceId);
}

export function editorDraftToListMeta(
  draft: GuidePublishEditorDraft,
  guideId: string,
): Guide {
  const days = parseAmount(draft.days, 1);
  const total = parseAmount(draft.costBreakdown.total);
  const tags = draft.interests
    .split(/[、,，]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);

  return {
    id: guideId,
    city: draft.destination.trim(),
    title: draft.title.trim(),
    budget: total > 0 ? `约 ¥${total}` : draft.budgetLabel.trim(),
    days: `${days} 天`,
    tags: tags.length > 0 ? tags : ['穷游'],
    updatedAt: new Date().toISOString(),
    kind: 'structured',
  };
}

export function buildPublishedGuideRecord(
  draft: GuidePublishEditorDraft,
  authorId: UserId,
  sourceGuideId?: string,
): PublishedGuideRecord {
  const id = `user-guide-${Date.now()}`;
  const normalized = syncDailyJournalWithDays(draft);
  const content = buildStructuredGuideContent(normalized, sourceGuideId ?? id);
  return {
    id,
    authorId,
    listMeta: editorDraftToListMeta(normalized, id),
    content: { ...content, id },
    publishedAt: new Date().toISOString(),
    aiAssisted: Boolean(sourceGuideId),
    sourceGuideId,
  };
}

export function validateGuidePublishDraft(draft: GuidePublishEditorDraft): string | null {
  if (!draft.title.trim()) {
    return '请填写攻略标题';
  }
  if (!draft.destination.trim()) {
    return '请填写目的地';
  }
  if (!draft.days.trim() || parseAmount(draft.days) < 1) {
    return '请填写有效的旅行天数';
  }
  if (draft.dailyJournal.every((day) => !day.narrative.trim())) {
    return '请至少填写一天的行程流水账';
  }
  if (!draft.snailInsights.regrets.trim() && !draft.snailInsights.recommendations.trim()) {
    return '请填写蜗牛启示（避坑雷达或宝藏点至少一项）';
  }
  return null;
}

export function recalculateCostTotal(draft: GuidePublishEditorDraft): string {
  let sum = 0;
  for (const row of AI_SNAIL_COST_ROWS) {
    sum += parseAmount(draft.costBreakdown[row.key].amount);
  }
  return String(sum);
}
