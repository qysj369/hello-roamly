/** AI蜗牛引导流程 — 人均总预算档位 */
export type AiSnailBudgetRangeId = 'under500' | '500-1000' | '1000-2000' | 'over2000';

/** AI蜗牛 — 旅行偏好多选 */
export type AiSnailPreferenceId =
  | 'food'
  | 'checkin'
  | 'nature'
  | 'culture'
  | 'budget'
  | 'local';

export type AiSnailGuideStep =
  | 'destination'
  | 'days'
  | 'budget'
  | 'preferences'
  | 'generating'
  | 'editor'
  | 'published';

/** 引导对话收集完成的参数 */
export type AiSnailGuideParams = {
  destination: string;
  days: number;
  budgetRange: AiSnailBudgetRangeId;
  preferences: AiSnailPreferenceId[];
};

/** 花费清单 — 单项 */
export type AiSnailCostItem = {
  amount: number;
  savingTips: string[];
};

/** 花费清单 */
export type AiSnailCostBreakdown = {
  transportation: AiSnailCostItem;
  accommodation: AiSnailCostItem;
  food: AiSnailCostItem;
  entertainment: AiSnailCostItem;
  total: number;
};

/** 行程流水账 — 单日开销明细 */
export type AiSnailDailyExpense = {
  item: string;
  amount: number;
};

/** 行程流水账 — 单日 */
export type AiSnailDailyJournal = {
  day: number;
  narrative: string;
  expenses: AiSnailDailyExpense[];
  tips: string[];
};

/** 蜗牛启示 */
export type AiSnailInsights = {
  regrets: string;
  recommendations: string;
};

/** AI蜗牛生成的完整穷游攻略 */
export type AiSnailGuideResult = {
  id: string;
  title: string;
  destination: string;
  days: number;
  budgetLabel: string;
  interests: string[];
  costBreakdown: AiSnailCostBreakdown;
  dailyJournal: AiSnailDailyJournal[];
  snailInsights: AiSnailInsights;
  generatedAt: string;
};

export const AI_SNAIL_BUDGET_OPTIONS: {
  id: AiSnailBudgetRangeId;
  label: string;
  min: number;
  max: number;
}[] = [
  { id: 'under500', label: '500元以下', min: 200, max: 500 },
  { id: '500-1000', label: '500-1000元', min: 500, max: 1000 },
  { id: '1000-2000', label: '1000-2000元', min: 1000, max: 2000 },
  { id: 'over2000', label: '2000元以上', min: 2000, max: 5000 },
];

export const AI_SNAIL_PREFERENCE_OPTIONS: { id: AiSnailPreferenceId; label: string }[] = [
  { id: 'food', label: '美食' },
  { id: 'checkin', label: '打卡' },
  { id: 'nature', label: '自然风光' },
  { id: 'culture', label: '历史文化' },
  { id: 'budget', label: '省钱优先' },
  { id: 'local', label: '体验当地' },
];

export const AI_SNAIL_DAY_OPTIONS = [1, 2, 3, 4, 5, 7] as const;

export const AI_SNAIL_ASSISTANT_NAME = 'AI蜗牛';

export const AI_SNAIL_COST_ROWS = [
  { key: 'transportation' as const, label: '交通' },
  { key: 'accommodation' as const, label: '住宿' },
  { key: 'food' as const, label: '餐饮' },
  { key: 'entertainment' as const, label: '门票/娱乐' },
];
