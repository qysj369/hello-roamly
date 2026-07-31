import { describe, expect, it } from 'vitest';
import { parseTravelSearchIntent } from '@/lib/map/planQueryBuilder';
import { resolveCityCenterSync, resolveMultiStopFromLocalTable } from '@/lib/map/parseTrailSearchQuery';
import {
  extractMultiStopDestinations,
  extractPrimaryLocation,
  extractRouteEndpoints,
  extractSearchDestination,
} from '@/lib/map/travelQueryParsing';

describe('extractPrimaryLocation', () => {
  it('picks earliest city in multi-city query', () => {
    expect(extractPrimaryLocation('扬州镇江溧阳三天游，预算600元')).toBe('扬州');
  });

  it('recognizes Jinan', () => {
    expect(extractPrimaryLocation('济南 三天 1500')).toBe('济南');
  });

  it('returns null for empty input', () => {
    expect(extractPrimaryLocation('   ')).toBeNull();
  });
});

describe('extractRouteEndpoints', () => {
  it('parses Jinan to Putian', () => {
    expect(extractRouteEndpoints('济南到莆田 三天 1500')).toEqual({
      origin: '济南',
      destination: '莆田',
    });
  });

  it('parses district-level origin', () => {
    expect(extractRouteEndpoints('济南历下区到莆田 三天 1500')).toEqual({
      origin: '济南历下区',
      destination: '莆田',
    });
  });

  it('parses colloquial phrasing', () => {
    expect(extractRouteEndpoints('从济南去成都吃火锅')).toEqual({
      origin: '济南',
      destination: '成都',
    });
    expect(extractRouteEndpoints('济南飞成都 三天 1200')).toEqual({
      origin: '济南',
      destination: '成都',
    });
    expect(extractRouteEndpoints('济南去莆田')).toEqual({
      origin: '济南',
      destination: '莆田',
    });
  });
});

describe('extractSearchDestination', () => {
  it('uses route destination not origin', () => {
    expect(extractSearchDestination('济南到莆田 三天 1500')).toBe('莆田');
  });

  it('prefers multi-stop over truncated route destination', () => {
    expect(extractSearchDestination('从济南历下区去曲阜微山湖台儿庄三天1500')).toBe(
      '曲阜→微山湖→台儿庄',
    );
  });

  it('resolves Putian sync', () => {
    const resolved = resolveCityCenterSync('济南到莆田');
    expect(resolved?.label).toBe('莆田');
  });
});

describe('extractMultiStopDestinations', () => {
  it('parses three-stop Shandong route', () => {
    expect(extractMultiStopDestinations('曲阜微山湖台儿庄三日游预算1500')).toEqual([
      '曲阜',
      '微山湖',
      '台儿庄',
    ]);
  });

  it('returns empty for single destination', () => {
    expect(extractMultiStopDestinations('济南三天1500')).toEqual([]);
  });

  it('still parses three stops when query includes origin route', () => {
    expect(extractMultiStopDestinations('从济南历下区去曲阜微山湖台儿庄三天1500')).toEqual([
      '曲阜',
      '微山湖',
      '台儿庄',
    ]);
  });

  it('ignores prefecture embedded in reverse geocode address', () => {
    expect(extractMultiStopDestinations('山东省济宁市曲阜市')).toEqual([]);
    expect(extractMultiStopDestinations('济宁市曲阜市')).toEqual([]);
  });

  it('parses Zhoucun-Qingzhou-Weifang self-drive loop', () => {
    expect(extractMultiStopDestinations('周村古城青州潍坊四天游自驾')).toEqual([
      '周村古城',
      '青州',
      '潍坊',
    ]);
  });

  it('dedupes overlapping 周村 vs 周村古城', () => {
    expect(extractMultiStopDestinations('周村古城青州')).toEqual(['周村古城', '青州']);
  });
});

describe('resolveCityCenterSync', () => {
  it('resolves Jinan from plain city name', () => {
    const resolved = resolveCityCenterSync('济南');
    expect(resolved?.label).toBe('济南');
    expect(resolved?.longitude).toBeCloseTo(117.1205, 3);
    expect(resolved?.latitude).toBeCloseTo(36.6519, 3);
  });

  it('resolves Kaifeng from family trip query', () => {
    const resolved = resolveCityCenterSync('开封亲子游四天');
    expect(resolved?.label).toBe('开封');
    expect(resolved?.longitude).toBeCloseTo(114.307, 3);
  });
});

describe('resolveMultiStopFromLocalTable', () => {
  it('resolves all stops from local city table without geocode', () => {
    const resolved = resolveMultiStopFromLocalTable(['曲阜', '微山湖', '台儿庄']);
    expect(resolved?.routeLabel).toBe('曲阜→微山湖→台儿庄');
    expect(resolved?.stops).toHaveLength(3);
    expect(resolved?.primary.label).toBe('曲阜');
  });

  it('returns null when any stop is missing from local table', () => {
    expect(resolveMultiStopFromLocalTable(['曲阜', '未知小村'])).toBeNull();
  });
});

describe('开封亲子游四天', () => {
  it('does not treat 亲子 as a travel stop', () => {
    expect(extractMultiStopDestinations('开封亲子游四天')).toEqual([]);
    expect(extractPrimaryLocation('开封亲子游四天')).toBe('开封');
  });

  it('parses four days in travel intent', () => {
    const intent = parseTravelSearchIntent('开封亲子游四天');
    expect(intent.days).toBe(4);
    expect(intent.preferences).toContain('亲子');
  });
});
