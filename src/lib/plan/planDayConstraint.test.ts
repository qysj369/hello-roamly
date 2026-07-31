import { describe, expect, it } from 'vitest';
import {
  buildStrictDayCountConstraint,
  clampItineraryToMaxDays,
  countItineraryDayHeaders,
  enforcePlanDayCountOnContent,
  resolveEffectivePlanDays,
} from '@/lib/plan/planDayConstraint';

describe('resolveEffectivePlanDays', () => {
  it('returns user days for single city', () => {
    expect(resolveEffectivePlanDays('成都 三天', '成都')).toBe(3);
  });

  it('covers all multi-stop stations when user days are fewer', () => {
    expect(resolveEffectivePlanDays('曲阜微山湖台儿庄两天1500', '曲阜→微山湖→台儿庄')).toBe(3);
  });
});

describe('clampItineraryToMaxDays', () => {
  it('removes day blocks beyond the requested count', () => {
    const itinerary = [
      '第1天 成都宽窄巷子',
      '第2天 都江堰',
      '第3天 青城山',
      '第4天 不应出现',
      '第12天 更不应出现',
    ].join('\n\n');

    expect(clampItineraryToMaxDays(itinerary, 3)).toBe(
      ['第1天 成都宽窄巷子', '第2天 都江堰', '第3天 青城山'].join('\n\n'),
    );
    expect(countItineraryDayHeaders(itinerary)).toBe(5);
  });
});

describe('enforcePlanDayCountOnContent', () => {
  it('clamps itinerary inside full plan markdown', () => {
    const raw = [
      '【方案简介】',
      '',
      '成都 3 天穷游。',
      '',
      '【行程流水账】',
      '',
      '第1天 玩A',
      '第2天 玩B',
      '第3天 玩C',
      '第4天 多余',
      '',
      '【蜗牛提示】',
      '',
      '提示。',
      '',
      '【避坑指南】',
      '',
      '避坑。',
    ].join('\n');

    const out = enforcePlanDayCountOnContent(raw, '成都 三天', '成都');
    expect(out).toContain('第3天 玩C');
    expect(out).not.toContain('第4天 多余');
  });
});

describe('buildStrictDayCountConstraint', () => {
  it('mentions exact day count', () => {
    expect(buildStrictDayCountConstraint(3)).toContain('第 1 天至第 3 天');
  });
});
