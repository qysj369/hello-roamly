import { describe, expect, it } from 'vitest';
import {
  narrationAt,
  defaultSnailFlightRoute,
  buildSnailFlightRoute,
  sampleFlightPose,
} from '@/lib/snail-flight/routes';

describe('snail-flight demo route', () => {
  const route = defaultSnailFlightRoute();

  it('flies Jinan Lixia to Qingdao via Zhangqiu Zibo Weifang', () => {
    expect(route.origin.label).toBe('济南历下');
    expect(route.dest.label).toBe('青岛');
    expect(route.waypoints.map((item) => item.label)).toEqual([
      '济南历下',
      '章丘',
      '淄博',
      '潍坊',
      '青岛',
    ]);
  });

  it('switches narration by fixed progress bands', () => {
    expect(narrationAt(route, 0).title).toBe('【起飞｜济南历下】');
    expect(narrationAt(route, 0.13).title).toBe('【掠过湖泽】');
    expect(narrationAt(route, 0.16).title).toBe('【飞越章丘】');
    expect(narrationAt(route, 0.36).title).toBe('【途经淄博】');
    expect(narrationAt(route, 0.36).lines[0]).toBe('前方抵达淄博上空。');
    expect(narrationAt(route, 0.62).title).toContain('潍坊');
    expect(narrationAt(route, 0.77).title).toContain('莱州湾');
    expect(narrationAt(route, 0.95).title).toBe('【抵达青岛｜降落阶段】');
  });

  it('keeps a low sightseeing altitude over Shandong', () => {
    const takeoff = sampleFlightPose(route, 0);
    const mid = sampleFlightPose(route, 0.5);
    expect(takeoff.height).toBeGreaterThan(1200);
    expect(mid.height).toBeGreaterThan(2000);
    expect(mid.height).toBeLessThan(3600);
    expect(mid.lon).toBeGreaterThan(117);
    expect(mid.lon).toBeLessThan(121);
  });

  it('rejects same-city custom routes', () => {
    expect(buildSnailFlightRoute('qingdao', 'qingdao')).toBeNull();
  });
});
