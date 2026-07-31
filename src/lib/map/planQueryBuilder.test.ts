import { describe, expect, it } from 'vitest';
import {
  buildCrossCitySearchPlanQuery,
  buildEnrichedSearchPlanQuery,
  buildGuidePlanQuery,
  isSameCityRegion,
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
