import { describe, expect, it } from 'vitest';
import { formatStructuredGuidePlainText } from '@/utils/structuredGuidePlainText';
import type { AiSnailGuideResult } from '@/types/domain/aiSnailGuide';

const sampleGuide: AiSnailGuideResult = {
  id: 'test-guide',
  title: '济南 2 天穷游',
  destination: '济南',
  days: 2,
  budgetLabel: '500-1000元',
  interests: ['美食'],
  costBreakdown: {
    transportation: { amount: 80, savingTips: ['公交'] },
    accommodation: { amount: 200, savingTips: ['青旅'] },
    food: { amount: 150, savingTips: ['小吃'] },
    entertainment: { amount: 50, savingTips: ['免费景点'] },
    total: 480,
  },
  dailyJournal: [
    {
      day: 1,
      narrative: '逛老城',
      expenses: [{ item: '地铁', amount: 5 }],
      tips: ['早出门'],
    },
  ],
  snailInsights: { regrets: '别坐黑车', recommendations: '早市好吃' },
  generatedAt: '2026-05-19T00:00:00.000Z',
};

describe('formatStructuredGuidePlainText', () => {
  it('includes all three structured sections', () => {
    const text = formatStructuredGuidePlainText(sampleGuide);
    expect(text).toContain('【花费清单】');
    expect(text).toContain('【行程流水账】');
    expect(text).toContain('【蜗牛启示】');
    expect(text).toContain('济南 2 天穷游');
    expect(text).toContain('总计：¥480');
  });
});
