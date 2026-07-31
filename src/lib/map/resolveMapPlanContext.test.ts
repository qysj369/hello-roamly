import { describe, expect, it } from 'vitest';
import { resolveMapPlanContext } from '@/lib/map/resolveMapPlanContext';

describe('resolveMapPlanContext', () => {
  it('parses three-stop query on server fallback', () => {
    const ctx = resolveMapPlanContext(
      '从济南市历下区出发，用户要去曲阜、微山湖、台儿庄共3个目的地',
      '山东省济宁市曲阜市',
      {
        searchQuery: '曲阜微山湖台儿庄三天预算1500',
        originName: '济南市历下区',
      },
    );
    expect(ctx.locationName).toBe('曲阜→微山湖→台儿庄');
    expect(ctx.multiStops).toEqual(['曲阜', '微山湖', '台儿庄']);
    expect(ctx.query).toContain('从济南市历下区出发');
    expect(ctx.query).toContain('第3天主玩台儿庄');
  });

  it('trusts client multi-stop locationName over geocode address', () => {
    const ctx = resolveMapPlanContext('enriched', '济宁→曲阜', {
      searchQuery: '曲阜微山湖台儿庄三天',
      originName: '济南市历下区',
    });
    expect(ctx.locationName).toBe('曲阜→微山湖→台儿庄');
    expect(ctx.multiStops).toHaveLength(3);
  });

  it('parses Zhoucun-Qingzhou-Weifang four-day self-drive', () => {
    const ctx = resolveMapPlanContext('想去周村古城', '周村古城', {
      searchQuery: '周村古城青州潍坊四天游自驾',
      originName: '济南市历下区',
    });
    expect(ctx.locationName).toBe('周村古城→青州→潍坊');
    expect(ctx.multiStops).toEqual(['周村古城', '青州', '潍坊']);
    expect(ctx.query).toContain('共4天');
    expect(ctx.query).toContain('自驾');
    expect(ctx.query).toContain('周村古城');
    expect(ctx.query).toContain('青州');
    expect(ctx.query).toContain('潍坊');
  });
});
