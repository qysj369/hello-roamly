import type {
  AiSnailCostBreakdown,
  AiSnailDailyJournal,
  AiSnailGuideResult,
  AiSnailInsights,
} from '@/types/domain/aiSnailGuide';
import { AI_SNAIL_COST_ROWS } from '@/types/domain/aiSnailGuide';
import { STRUCTURED_GUIDE_SECTIONS } from '@/lib/guides/structuredGuideSections';

/** 宪法三卡 — 与 AI 输出 / 前台展示一一对应 */
export const STRUCTURED_GUIDE_FORM_CARDS = [
  {
    card: 1 as const,
    sectionId: STRUCTURED_GUIDE_SECTIONS[0].id,
    editorId: 'sg-edit-cost',
    title: '【花费清单】',
    subtitle: '交通 · 住宿 · 餐饮 · 门票/娱乐 · 自动加总',
    aiField: 'costBreakdown' as const,
  },
  {
    card: 2 as const,
    sectionId: STRUCTURED_GUIDE_SECTIONS[1].id,
    editorId: 'sg-edit-journal',
    title: '【行程流水账】',
    subtitle: '按天叙述 · 开销明细 · 实用贴士',
    aiField: 'dailyJournal' as const,
  },
  {
    card: 3 as const,
    sectionId: STRUCTURED_GUIDE_SECTIONS[2].id,
    editorId: 'sg-edit-insights',
    title: '【蜗牛启示】',
    titleSlangId: 'snail-insights' as const,
    subtitle: '避坑雷达 · 宝藏点',
    aiField: 'snailInsights' as const,
  },
] as const;

/** 花费清单 — 表格行与 AiSnailCostBreakdown 字段映射 */
export const GUIDE_PUBLISH_COST_FIELDS = AI_SNAIL_COST_ROWS.map((row) => ({
  key: row.key,
  label: row.label,
  aiPath: `costBreakdown.${row.key}` as const,
  amountField: 'amount' as const,
  tipsField: 'savingTips' as const,
}));

/** 行程流水账 — 单日字段与 AiSnailDailyJournal 映射 */
export const GUIDE_PUBLISH_JOURNAL_FIELDS = {
  day: { label: '天数', aiPath: 'day' as const },
  narrative: { label: '当天行程', aiPath: 'narrative' as const },
  expenses: { label: '开销明细', aiPath: 'expenses' as const },
  expenseItem: { label: '项目', aiPath: 'expenses[].item' as const },
  expenseAmount: { label: '金额', aiPath: 'expenses[].amount' as const },
  tips: { label: '实用贴士', aiPath: 'tips' as const },
} as const;

/** 蜗牛启示 — 与 AiSnailInsights 映射 */
export const GUIDE_PUBLISH_INSIGHT_FIELDS = {
  regrets: { label: '避坑雷达', slangId: 'pitfall-radar' as const, aiPath: 'snailInsights.regrets' as const },
  recommendations: {
    label: '宝藏点',
    slangId: 'treasure-spot' as const,
    aiPath: 'snailInsights.recommendations' as const,
  },
} as const;
export type GuidePublishAiFieldMap = {
  costBreakdown: AiSnailCostBreakdown;
  dailyJournal: AiSnailDailyJournal[];
  snailInsights: AiSnailInsights;
  meta: Pick<AiSnailGuideResult, 'title' | 'destination' | 'days' | 'budgetLabel' | 'interests'>;
};
