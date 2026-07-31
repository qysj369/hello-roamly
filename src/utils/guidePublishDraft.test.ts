import { describe, expect, it } from 'vitest';
import {
  aiSnailGuideToEditorDraft,
  buildPublishedGuideRecord,
  buildStructuredGuideContent,
  createEmptyGuidePublishDraft,
  publishedRecordToGuide,
  syncDailyJournalWithDays,
} from '@/utils/guidePublishDraft';
import type { AiSnailGuideResult } from '@/types/domain/aiSnailGuide';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';

const aiGuide: AiSnailGuideResult = {
  id: 'ai-guide-1',
  title: '成都 3 天穷游',
  destination: '成都',
  days: 3,
  budgetLabel: '500-1000元',
  interests: ['美食', '打卡'],
  costBreakdown: {
    transportation: { amount: 120, savingTips: ['地铁日票'] },
    accommodation: { amount: 300, savingTips: ['青旅'] },
    food: { amount: 200, savingTips: ['苍蝇馆子'] },
    entertainment: { amount: 80, savingTips: ['免费公园'] },
    total: 700,
  },
  dailyJournal: [
    { day: 1, narrative: '宽窄巷子', expenses: [{ item: '地铁', amount: 6 }], tips: ['早去'] },
    { day: 2, narrative: '锦里', expenses: [{ item: '小吃', amount: 40 }], tips: [] },
    { day: 3, narrative: '熊猫基地', expenses: [{ item: '门票', amount: 55 }], tips: ['预约'] },
  ],
  snailInsights: { regrets: '别买景区特产', recommendations: '冒烤鸭好吃' },
  generatedAt: '2026-05-19T00:00:00.000Z',
};

describe('guidePublishDraft compatibility', () => {
  it('round-trips AI guide through editor draft', () => {
    const draft = aiSnailGuideToEditorDraft(aiGuide);
    const rebuilt = buildStructuredGuideContent(draft, aiGuide.id);

    expect(rebuilt.title).toBe(aiGuide.title);
    expect(rebuilt.destination).toBe(aiGuide.destination);
    expect(rebuilt.days).toBe(aiGuide.days);
    expect(rebuilt.costBreakdown.total).toBe(aiGuide.costBreakdown.total);
    expect(rebuilt.dailyJournal).toHaveLength(3);
    expect(rebuilt.dailyJournal[0]?.narrative).toBe('宽窄巷子');
    expect(rebuilt.dailyJournal[0]?.expenses[0]).toEqual({ item: '地铁', amount: 6 });
    expect(rebuilt.snailInsights.regrets).toBe(aiGuide.snailInsights.regrets);
  });

  it('syncs daily journal when days field changes', () => {
    const draft = aiSnailGuideToEditorDraft(aiGuide);
    const expanded = syncDailyJournalWithDays({ ...draft, days: '5' });

    expect(expanded.dailyJournal).toHaveLength(5);
    expect(expanded.dailyJournal[4]?.day).toBe(5);
    expect(expanded.dailyJournal[0]?.narrative).toBe('宽窄巷子');
  });

  it('published record content matches preview builder', () => {
    const draft = aiSnailGuideToEditorDraft(aiGuide);
    const preview = buildStructuredGuideContent(draft, aiGuide.id);
    const record = buildPublishedGuideRecord(draft, DEMO_CURRENT_USER_ID, aiGuide.id);

    expect(record.content.title).toBe(preview.title);
    expect(record.content.costBreakdown.total).toBe(preview.costBreakdown.total);
    expect(record.content.dailyJournal.length).toBe(preview.dailyJournal.length);
    expect(record.listMeta.city).toBe(preview.destination);
    expect(record.aiAssisted).toBe(true);
    expect(record.sourceGuideId).toBe(aiGuide.id);
  });

  it('maps published record to Guide with structured fields', () => {
    const draft = aiSnailGuideToEditorDraft(aiGuide);
    const record = buildPublishedGuideRecord(draft, DEMO_CURRENT_USER_ID, aiGuide.id);
    const guide = publishedRecordToGuide(record);

    expect(guide.kind).toBe('structured');
    expect(guide.structured?.title).toBe(aiGuide.title);
    expect(guide.structured?.costBreakdown.total).toBe(700);
    expect(guide.aiAssisted).toBe(true);
  });

  it('creates empty draft with journal days synced', () => {
    const draft = createEmptyGuidePublishDraft(4);
    expect(draft.dailyJournal).toHaveLength(4);
  });
});
