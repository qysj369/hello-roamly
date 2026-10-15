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

  it('switches narration by progress', () => {
    expect(narrationAt(route, 0).title).toContain('济南历下');
    expect(narrationAt(route, 0.22).title).toContain('章丘');
    expect(narrationAt(route, 0.45).title).toContain('淄博');
    expect(narrationAt(route, 0.65).title).toContain('潍坊');
    expect(narrationAt(route, 0.88).title).toContain('青岛');
    expect(narrationAt(route, 0.95).title).toContain('落地');
  });

  it('keeps a low sightseeing altitude over Shandong', () => {
    const mid = sampleFlightPose(route, 0.5);
    expect(mid.height).toBeGreaterThan(800);
    expect(mid.height).toBeLessThan(2000);
    expect(mid.lon).toBeGreaterThan(117);
    expect(mid.lon).toBeLessThan(121);
  });

  it('rejects same-city custom routes', () => {
    expect(buildSnailFlightRoute('qingdao', 'qingdao')).toBeNull();
  });
});
