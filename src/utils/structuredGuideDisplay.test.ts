import { describe, expect, it } from 'vitest';
import { formatStructuredGuideCoreTag } from '@/utils/structuredGuideDisplay';
import type { AiSnailGuideResult } from '@/types/domain/aiSnailGuide';

const guide: AiSnailGuideResult = {
  id: 'g1',
  title: '北京穷游',
  destination: '北京',
  days: 3,
  budgetLabel: '1000-2000元',
  interests: [],
  costBreakdown: {
    transportation: { amount: 200, savingTips: [] },
    accommodation: { amount: 600, savingTips: [] },
    food: { amount: 500, savingTips: [] },
    entertainment: { amount: 200, savingTips: [] },
    total: 1500,
  },
  dailyJournal: [],
  snailInsights: { regrets: '', recommendations: '' },
  generatedAt: '2026-05-19T00:00:00.000Z',
};

describe('formatStructuredGuideCoreTag', () => {
  it('formats destination, days and per-person total', () => {
    expect(formatStructuredGuideCoreTag(guide)).toBe('北京 · 3天 · 人均¥1500');
  });
});
