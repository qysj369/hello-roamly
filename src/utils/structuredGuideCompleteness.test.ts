import { describe, expect, it } from 'vitest';
import { getStructuredGuideCompleteness } from '@/utils/structuredGuideCompleteness';
import type { GuidePublishEditorDraft } from '@/types/domain/guidePublish';

const baseDraft: GuidePublishEditorDraft = {
  title: '济南 2 天穷游',
  destination: '济南',
  days: '2',
  budgetLabel: '500-1000元',
  interests: '美食',
  costBreakdown: {
    transportation: { amount: '80', savingTips: '公交' },
    accommodation: { amount: '200', savingTips: '青旅' },
    food: { amount: '150', savingTips: '小吃' },
    entertainment: { amount: '50', savingTips: '免费景点' },
    total: '480',
  },
  dailyJournal: [{ day: 1, narrative: '逛老城', expenses: [{ item: '地铁', amount: '5' }], tips: '早出门' }],
  snailInsights: { regrets: '别坐黑车', recommendations: '早市好吃' },
};

describe('getStructuredGuideCompleteness', () => {
  it('marks complete draft as ready', () => {
    const result = getStructuredGuideCompleteness(baseDraft);
    expect(result.ready).toBe(true);
    expect(result.progress).toBe(100);
  });

  it('flags missing journal', () => {
    const result = getStructuredGuideCompleteness({
      ...baseDraft,
      dailyJournal: [{ day: 1, narrative: '', expenses: [], tips: '' }],
    });
    expect(result.ready).toBe(false);
    expect(result.items.find((item) => item.id === 'journal')?.done).toBe(false);
  });
});
