import type { AiSnailGuideResult } from '@/types/domain/aiSnailGuide';
import type { Guide } from '@/types/domain/guide';
import type { UserId } from '@/types/domain/user/userId';
/** 攻略发布编辑器 — 花费单项草稿（对应 AiSnailCostItem） */
export type GuidePublishCostItemDraft = {
  amount: string;
  savingTips: string;
};

/** 行程流水账 — 单日开销草稿（对应 AiSnailDailyExpense） */
export type GuidePublishDailyExpenseDraft = {
  item: string;
  amount: string;
};

/** 行程流水账 — 单日草稿（对应 AiSnailDailyJournal） */
export type GuidePublishDailyJournalDraft = {
  day: number;
  narrative: string;
  expenses: GuidePublishDailyExpenseDraft[];
  tips: string;
};

/** 攻略发布编辑器 — 可编辑表单草稿 */
export type GuidePublishEditorDraft = {
  title: string;
  destination: string;
  days: string;
  budgetLabel: string;
  interests: string;
  costBreakdown: {
    transportation: GuidePublishCostItemDraft;
    accommodation: GuidePublishCostItemDraft;
    food: GuidePublishCostItemDraft;
    entertainment: GuidePublishCostItemDraft;
    total: string;
  };
  dailyJournal: GuidePublishDailyJournalDraft[];
  snailInsights: {
    /** 避坑指南 — AiSnailInsights.regrets */
    regrets: string;
    /** 宝藏发现 — AiSnailInsights.recommendations */
    recommendations: string;
  };
};

/** 用户发布的完整攻略（本地存储） */
export type PublishedGuideRecord = {
  id: string;
  authorId: UserId;
  listMeta: Guide;
  content: AiSnailGuideResult;
  publishedAt: string;
  /** 是否经 AI蜗牛 辅助生成 */
  aiAssisted?: boolean;
  /** AI 生成源 id（发布时传入） */
  sourceGuideId?: string;
};
