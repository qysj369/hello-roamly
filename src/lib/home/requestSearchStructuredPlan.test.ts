import { describe, expect, it, vi } from 'vitest';
import { requestSearchStructuredPlan } from '@/lib/home/requestSearchStructuredPlan';
import {
  SEARCH_PLAN_FAIL_HINT,
  SEARCH_PLAN_LOADING_TEXT,
  SEARCH_PLAN_MAX_ATTEMPTS,
  SEARCH_PLAN_RETRY_TEXT,
} from '@/lib/home/searchStructuredPlanParse';
import { HOME_SEARCH_FAIL_HINT } from '@/lib/home/submitHomeSearchStep1';
import { SearchStructuredPlanApiError } from '@/services/ai/api/fetchSearchStructuredPlan';
import type { SearchPlanRequest } from '@/types/domain/searchStructuredPlan';

const params: SearchPlanRequest = {
  startCity: '济南',
  targetCity: '拉萨',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: '山水徒步',
};

const validJson = JSON.stringify({
  baseInfo: params,
  budgetList: [{ item: '合计', perPerson: 1, tip: '' }],
  dayList: [
    { day: 1, title: '1', traffic: [], spots: [], foods: [], tips: '', hotelArea: '' },
    { day: 2, title: '2', traffic: [], spots: [], foods: [], tips: '', hotelArea: '' },
    { day: 3, title: '3', traffic: [], spots: [], foods: [], tips: '', hotelArea: '' },
  ],
  globalTips: [],
});

describe('requestSearchStructuredPlan 重试上限', () => {
  it('格式破坏最多请求 3 次（含首次），然后兜底，不空转', async () => {
    const fetchRaw = vi.fn().mockResolvedValue('### 这是散文不是JSON');
    const statuses: string[] = [];
    const result = await requestSearchStructuredPlan(params, {
      fetchRaw,
      onStatus: (message) => statuses.push(message),
    });

    expect(fetchRaw).toHaveBeenCalledTimes(SEARCH_PLAN_MAX_ATTEMPTS);
    expect(result).toEqual({ ok: false, error: SEARCH_PLAN_FAIL_HINT, attempts: 3 });
    expect(statuses[0]).toBe(SEARCH_PLAN_LOADING_TEXT);
    expect(statuses.filter((item) => item === SEARCH_PLAN_RETRY_TEXT)).toHaveLength(2);
  });

  it('第二次重试成功则停，不再继续打接口', async () => {
    const fetchRaw = vi
      .fn()
      .mockResolvedValueOnce('bad')
      .mockResolvedValueOnce(validJson)
      .mockResolvedValueOnce('should-not-run');
    const result = await requestSearchStructuredPlan(params, { fetchRaw });
    expect(result.ok).toBe(true);
    expect(result.attempts).toBe(2);
    expect(fetchRaw).toHaveBeenCalledTimes(2);
  });

  it('returns the Shanghai 3-day friends gold sample without calling the model', async () => {
    const fetchRaw = vi.fn();
    const result = await requestSearchStructuredPlan(
      {
        startCity: '济南',
        targetCity: '上海',
        days: 3,
        peopleType: '好友结伴',
        budget: null,
        theme: null,
      },
      { fetchRaw },
    );
    expect(fetchRaw).not.toHaveBeenCalled();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.plan.dayList.map((day) => day.title)).toEqual([
      '人民广场-南京东路-外滩滨江慢逛',
      '豫园-城隍庙-新天地石库门慢逛',
      '武康路-安福路街巷慢逛，返程',
    ]);
    expect(result.plan.dayList[0]?.tips).toContain('沈大成');
    expect(result.plan.dayList[0]?.foods[0]?.dish).toContain('蟹粉小笼');
    expect(result.plan.globalTips[2]).toContain('Metro大都会APP');
  });

  it('assembles Hangzhou from the city kit without calling the model', async () => {
    const fetchRaw = vi.fn();
    const result = await requestSearchStructuredPlan(
      {
        startCity: '济南',
        targetCity: '杭州',
        days: 3,
        peopleType: '亲子',
        budget: null,
        theme: null,
      },
      { fetchRaw },
    );
    expect(fetchRaw).not.toHaveBeenCalled();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.plan.baseInfo.targetCity).toBe('杭州');
    expect(result.plan.dayList).toHaveLength(3);
    expect(result.plan.dayList[0]?.spots[0]?.name).toMatch(/博物馆|绿道|苏堤|龙井|小河/);
    expect(result.plan.globalTips[0]).toContain('雨天替代');
  });

  it('returns a different Shanghai 3-day plan for couples', async () => {
    const fetchRaw = vi.fn();
    const result = await requestSearchStructuredPlan(
      {
        startCity: '济南',
        targetCity: '上海',
        days: 3,
        peopleType: '情侣',
        budget: null,
        theme: null,
      },
      { fetchRaw },
    );
    expect(fetchRaw).not.toHaveBeenCalled();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.plan.dayList[0]?.tips).toContain('日落');
    expect(result.plan.dayList[0]?.title).not.toContain('人民广场-南京东路');
  });

  it('网络错误立即停，不走格式重试循环', async () => {
    const fetchRaw = vi.fn().mockRejectedValue(new SearchStructuredPlanApiError('DeepSeek 未配置'));
    const result = await requestSearchStructuredPlan(params, { fetchRaw });
    expect(result.ok).toBe(false);
    expect(result.attempts).toBe(1);
    expect(fetchRaw).toHaveBeenCalledTimes(1);
    if (!result.ok) {
      expect(result.error).not.toBe(HOME_SEARCH_FAIL_HINT);
    }
  });
});
