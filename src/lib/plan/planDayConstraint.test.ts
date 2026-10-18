import { describe, expect, it } from 'vitest';
import {
  alignIntroToMaxDays,
  buildLodgingContinuityConstraint,
  buildSameCityAccuracyConstraint,
  buildStrictDayCountConstraint,
  clampItineraryToMaxDays,
  countItineraryDayHeaders,
  enforceLodgingMorningConsistency,
  enforcePlanDayCountOnContent,
  normalizeItineraryDayHeaders,
  resolveEffectivePlanDays,
  scrubSameCityFakeLongHaul,
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

  it('aligns intro day count when model overshoots', () => {
    const raw = [
      '【方案简介】',
      '',
      '杭州亲子共5天4晚慢游。',
      '',
      '【行程流水账】',
      '',
      '### 第1天 西湖',
      '### 第2天 西溪',
      '### 第3天 返程',
      '### 第4天 多余',
      '### 第5天 也多余',
      '',
      '【蜗牛提示】',
      '',
      '提示。',
      '',
      '【避坑指南】',
      '',
      '避坑。',
    ].join('\n');

    const out = enforcePlanDayCountOnContent(raw, '杭州，3天，亲子出行', '杭州');
    expect(out).toContain('共3天2晚');
    expect(out).not.toContain('第4天');
    expect(out).not.toContain('第5天');
  });
});

describe('alignIntroToMaxDays', () => {
  it('rewrites overstated night counts', () => {
    expect(alignIntroToMaxDays('杭州亲子共5天4晚', 3)).toBe('杭州亲子共3天2晚');
  });
});

describe('buildStrictDayCountConstraint', () => {
  it('mentions exact day count', () => {
    expect(buildStrictDayCountConstraint(3)).toContain('第 1 天至第 3 天');
  });
});

describe('buildLodgingContinuityConstraint', () => {
  it('requires same lodging base and no teleport mornings', () => {
    const text = buildLodgingContinuityConstraint();
    expect(text).toContain('今晚住宿片区');
    expect(text).toContain('从昨晚住宿片区');
    expect(text).toContain('严禁跳棋');
    expect(text).toContain('主题切换≠换宿');
    expect(text).toContain('东站↔城站');
  });
});

describe('buildSameCityAccuracyConstraint', () => {
  it('forbids same-city fake long-haul sections', () => {
    const text = buildSameCityAccuracyConstraint();
    expect(text).toContain('同城准确度强制');
    expect(text).toContain('禁止');
    expect(text).toContain('大交通');
  });
});

describe('normalizeItineraryDayHeaders', () => {
  it('splits sticky day headers onto their own lines inside itinerary', () => {
    const raw = [
      '【方案简介】',
      '第1天西溪，第2天良渚，一基址连住。',
      '【行程流水账】',
      '绿堤散步结束，湿地博物馆（免费）。 #### 5 ### 第2天 · 转场去市区',
      '从昨晚住宿片区「西溪」出发',
      '玩法 # ### 第3天 · 返程',
      '从昨晚住宿片区「西溪」出发',
      '【蜗牛提示】',
      '带好水。',
      '【避坑指南】',
      '别买黄牛票。',
    ].join('\n');
    const out = normalizeItineraryDayHeaders(raw);
    expect(out).toMatch(/\n### 第2天 · 转场去市区/);
    expect(out).toMatch(/\n### 第3天 · 返程/);
    expect(out).not.toMatch(/#### 5 ### 第2天/);
    expect(out).not.toMatch(/玩法 # ### 第3天/);
    expect(out).toContain('第1天西溪，第2天良渚');
    expect(out).not.toMatch(/【方案简介】[\s\S]*### 第1天西溪/);
  });

  it('closes open quote when sticky day header cuts mid-phrase', () => {
    const raw = [
      '【方案简介】',
      '杭州三天。',
      '【行程流水账】',
      '### 第1天',
      '继续走到「蒋村 # ### 第2天 · 转场：亲子',
      '从昨晚住宿片区「西溪湿地北站周边」出发',
      '【蜗牛提示】',
      'ok',
      '【避坑指南】',
      'ok',
    ].join('\n');
    const out = normalizeItineraryDayHeaders(raw);
    expect(out).toContain('「蒋村」。');
    expect(out).toMatch(/\n### 第2天/);
    expect(out).not.toMatch(/蒋村 # ###/);
  });
});

describe('enforceLodgingMorningConsistency', () => {
  it('rewrites later mornings to the first base lodging', () => {
    const raw = [
      '今晚住宿片区：西溪湿地北站周边',
      '### 第2天',
      '从昨晚住宿片区「西溪湿地北站周边」出发，去滨江。',
      '### 第3天',
      '从昨晚住宿片区「良渚地铁站周边」出发，去博物院。',
    ].join('\n');
    const out = enforceLodgingMorningConsistency(raw);
    expect(out).toContain('从昨晚住宿片区「西溪湿地北站周边」出发');
    expect(out).not.toContain('从昨晚住宿片区「良渚地铁站周边」出发');
    expect(out.match(/从昨晚住宿片区「西溪湿地北站周边」出发/g)?.length).toBe(2);
  });

  it('syncs intro lodging district to itinerary base', () => {
    const raw = [
      '【方案简介】',
      '住宿固定在良渚地铁站周边（近2号线）。',
      '| 住宿 | 800 | 2晚·转塘/龙坞片区经济型酒店 |',
      '【行程流水账】',
      '今晚住宿片区：西溪湿地北站周边',
      '### 第2天',
      '从昨晚住宿片区「西溪湿地北站周边」出发。',
      '### 第3天',
      '从昨晚住宿片区「西溪湿地北站周边」出发。',
      '【蜗牛提示】',
      '住宿锁转塘/龙坞片区，地铁6号线方便。',
      '【避坑指南】',
      '别买黄牛票。',
    ].join('\n');
    const out = enforceLodgingMorningConsistency(raw);
    expect(out).toContain('住宿固定在西溪湿地北站周边');
    expect(out).toContain('西溪湿地北站周边');
    expect(out).not.toMatch(/住宿固定在良渚/);
    expect(out).not.toMatch(/住宿锁转塘/);
  });
});

describe('scrubSameCityFakeLongHaul', () => {
  it('removes Hangzhou East→City Station fake long-haul triad', () => {
    const raw = [
      '【方案简介】',
      '杭州三天。',
      '【行程流水账】',
      '### 第2天',
      '从昨晚住宿片区「西溪湿地北站周边」出发。',
      'A. 住宿 → 杭州东站',
      '地铁去东站。',
      'B. 大交通（杭州东站 → 杭州城站，城际短驳）',
      '> 说明：同属杭州市域，选用城际铁路完成大交通衔接。',
      '杭州东站 → 杭州城站，约¥8。',
      'C. 抵达·杭州城站 → 西湖·少年宫广场（今日首站）',
      '地铁去少年宫。',
      'D. 玩法',
      '喂鸽子。',
      '【蜗牛提示】',
      '带好水。',
      '【避坑指南】',
      '别买黄牛票。',
    ].join('\n');
    const out = scrubSameCityFakeLongHaul(raw);
    expect(out).toContain('同城直达');
    expect(out).not.toMatch(/B\.\s*大交通/);
    expect(out).not.toContain('城际短驳');
  });
});
