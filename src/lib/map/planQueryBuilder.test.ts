import { describe, expect, it } from 'vitest';
import {
  buildClarifyLockedSearchPlanQuery,
  buildCrossCitySearchPlanQuery,
  buildEnrichedSearchPlanQuery,
  buildGuidePlanQuery,
  isSameCityRegion,
  parseClarifyLockFromHandoff,
  parseTravelSearchIntent,
} from '@/lib/map/planQueryBuilder';
import type { TrailWallGuide } from '@/types/domain/trailWall';

describe('parseTravelSearchIntent', () => {
  it('extracts days, budget and preferences', () => {
    const intent = parseTravelSearchIntent('扬州三天游，预算600元，美食');
    expect(intent.days).toBe(3);
    expect(intent.budgetYuan).toBe(600);
    expect(intent.preferences).toContain('美食');
    expect(intent.destinationHint).toBe('扬州');
  });

  it('extracts trailing budget number', () => {
    const intent = parseTravelSearchIntent('济南 三天 1500');
    expect(intent.days).toBe(3);
    expect(intent.budgetYuan).toBe(1500);
  });

  it('parses the locked Qingdao couple food sentence', () => {
    const intent = parseTravelSearchIntent('济南情侣青岛3天人均4000美食游');
    expect(intent.destinationHint).toBe('青岛');
    expect(intent.days).toBe(3);
    expect(intent.budgetYuan).toBe(4000);
    expect(intent.preferences).toContain('美食');
  });

  it('keeps Hangzhou as the only destination when preference is 自然山水', () => {
    const intent = parseTravelSearchIntent('杭州3天自然山水');
    expect(intent.destinationHint).toBe('杭州');
    expect(intent.days).toBe(3);
    expect(intent.multiStops).toEqual([]);
  });
});

describe('isSameCityRegion', () => {
  it('treats district label as same city', () => {
    expect(isSameCityRegion('济南市历下区', '济南')).toBe(true);
    expect(isSameCityRegion('济南市历下区', '莆田')).toBe(false);
  });
});

describe('buildCrossCitySearchPlanQuery', () => {
  it('includes origin and destination with budget', () => {
    const intent = parseTravelSearchIntent('济南到莆田 三天 1500');
    const query = buildCrossCitySearchPlanQuery('济南市', '莆田', intent);
    expect(query).toContain('从济南市出发');
    expect(query).toContain('莆田');
    expect(query).toContain('门到门');
    expect(query).toContain('上车站');
    expect(query).toContain('换车');
    expect(query).toContain('下车站');
    expect(query).toContain('大交通');
    expect(query).toContain('1500');
  });
});

describe('buildEnrichedSearchPlanQuery', () => {
  it('builds structured query from intent', () => {
    const intent = parseTravelSearchIntent('西安 三天 1500 美食');
    const query = buildEnrichedSearchPlanQuery('西安 三天 1500 美食', '西安', intent);
    expect(query).toContain('想去西安');
    expect(query).toContain('行程3天');
    expect(query).toContain('人均预算约1500元');
    expect(query).toContain('偏好：美食');
  });

  it('keeps suburb camping focused and avoids door-to-door ledger tone', () => {
    const intent = parseTravelSearchIntent('济南周边露营');
    const query = buildEnrichedSearchPlanQuery('济南周边露营', '济南', intent);
    expect(query).toContain('周边');
    expect(query).toContain('露营');
    expect(query).toContain('交通从简');
    expect(query).not.toMatch(/每段须写三方案/);
  });
});

describe('parseClarifyLockFromHandoff', () => {
  it('parses five clarify fields from home handoff', () => {
    const raw = [
      '去杭州玩，3天，同行：亲子，预算约2500元，偏好：近郊轻游',
      '【目的地锁定】杭州',
      '【旅行偏好】近郊轻游（玩法倾向，不是地名）',
    ].join('。');
    expect(parseClarifyLockFromHandoff(raw)).toEqual({
      city: '杭州',
      days: 3,
      party: '亲子',
      budgetYuan: 2500,
      preference: '近郊轻游',
    });
  });

  it('rejects fake city names from style tags', () => {
    expect(parseClarifyLockFromHandoff('【目的地锁定】约偏，3天，同行：亲子，预算约800元，偏好：近郊轻游')).toBeNull();
    expect(
      parseClarifyLockFromHandoff(
        '【目的地锁定】美食探店，3天，同行：单人，预算约2500元，偏好：美食探店',
      ),
    ).toBeNull();
  });

  it('keeps Qingdao when lock city is glued with 海景/民俗', () => {
    const lock = parseClarifyLockFromHandoff(
      '【目的地锁定】青岛→海景→民俗，3天，同行：情侣，预算约1500元，偏好：自然山水',
    );
    expect(lock?.city).toBe('青岛');
    expect(lock?.days).toBe(3);
  });
});

describe('buildClarifyLockedSearchPlanQuery', () => {
  it('locks single city and bans fake destination names', () => {
    const query = buildClarifyLockedSearchPlanQuery('济南市历下区', {
      city: '杭州',
      days: 3,
      party: '亲子',
      budgetYuan: 2500,
      preference: '近郊轻游',
    });
    expect(query).toContain('杭州');
    expect(query).toContain('3天');
    expect(query).toContain('近郊轻游');
    expect(query).toBe('从济南市历下区出发，去杭州玩3天，同行亲子，人均预算约2500元，近郊轻游');
    expect(query).not.toContain('一共');
    expect(query).not.toContain('只写');
    expect(query).not.toContain('单城锁定');
  });
});

describe('buildGuidePlanQuery', () => {
  it('includes guide title, days and budget', () => {
    const guide: TrailWallGuide = {
      id: 'g1',
      title: '硬壳穷游大理',
      start_city: '北京',
      end_city: '大理',
      start_coords: [116.4074, 39.9042],
      end_coords: [100.2257, 25.5894],
      days: 4,
      budget: '¥1200',
      summary: '洱海环线 · 预算参考 ¥1200',
      tag: 'budget',
      colorStart: '#000',
      colorEnd: '#fff',
    };

    const query = buildGuidePlanQuery('北京', guide);
    expect(query).toContain('硬壳穷游大理');
    expect(query).toContain('4天行程');
    expect(query).toContain('参考预算 ¥1200');
    expect(query).not.toContain('card_click');
  });
});
