import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const persistCreate = vi.fn(async () => undefined);
const persistSave = vi.fn(async () => undefined);

vi.mock('@/lib/plan/persistUserAiSession', () => ({
  persistUserAiSessionCreate: (...args: unknown[]) => persistCreate(...args),
  persistUserAiSessionSave: (...args: unknown[]) => persistSave(...args),
}));

vi.mock('@/lib/query/client', () => ({
  queryClient: { invalidateQueries: vi.fn() },
}));

import {
  defaultSearchPlanTitle,
  ensureSharedSearchPlan,
  saveSearchStructuredPlan,
} from '@/lib/home/saveSearchStructuredPlan';

const plan: SearchStructuredPlan = {
  baseInfo: {
    startCity: '济南',
    targetCity: '杭州',
    days: 3,
    peopleType: '好友结伴',
    budget: null,
    theme: null,
  },
  budgetList: [{ item: '合计', perPerson: 2600, tip: '' }],
  globalTips: [],
  dayList: [
    {
      day: 1,
      title: '抵达杭州',
      hotelArea: '湖滨',
      tips: '',
      traffic: [],
      spots: [{ name: '西湖', intro: '' }],
      foods: [],
    },
  ],
};

describe('saveSearchStructuredPlan', () => {
  beforeEach(() => {
    persistCreate.mockClear();
    persistSave.mockClear();
  });

  it('uses a catchy city-days-party route title', () => {
    expect(defaultSearchPlanTitle(plan)).toBe('杭州3天｜和好友避开人流的湖边松弛路线');
    expect(defaultSearchPlanTitle(plan)).not.toContain('杭州3天行程');
  });

  it('creates a search session then marks it saved', async () => {
    const result = await saveSearchStructuredPlan({
      plan,
      title: '杭州3天好友结伴',
      isPublic: false,
    });
    expect(result.sessionId).toMatch(/^plan-/);
    expect(persistCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: 'search',
        locationName: '杭州',
        lng: 120.1551,
        lat: 30.2741,
        conversationTurns: expect.arrayContaining([
          expect.objectContaining({
            role: 'assistant',
            content: expect.stringContaining('HOLO_SEARCH_PLAN'),
          }),
        ]),
      }),
    );
    expect(persistSave).toHaveBeenCalledWith(
      result.sessionId,
      expect.objectContaining({ title: '杭州3天好友结伴', isPublic: false }),
    );
  });

  it('updates an existing session without creating again', async () => {
    await saveSearchStructuredPlan({
      plan,
      title: '杭州周末',
      isPublic: true,
      sessionId: 'plan-existing',
    });
    expect(persistCreate).not.toHaveBeenCalled();
    expect(persistSave).toHaveBeenCalledWith(
      'plan-existing',
      expect.objectContaining({ title: '杭州周末', isPublic: true }),
    );
  });

  it('rejects an empty title', async () => {
    await expect(saveSearchStructuredPlan({ plan, title: '  ', isPublic: false })).rejects.toThrow(
      '请填写方案名称',
    );
  });

  it('publishes a shareable plan so friends can open the same itinerary', async () => {
    const sessionId = await ensureSharedSearchPlan(plan);
    expect(persistSave).toHaveBeenCalledWith(
      sessionId,
      expect.objectContaining({ title: '杭州3天｜和好友避开人流的湖边松弛路线', isPublic: true }),
    );
  });
});
