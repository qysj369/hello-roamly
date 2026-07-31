import { describe, expect, it } from 'vitest';
import { buildMultiStopDayAssignments } from '@/lib/map/multiStopDayAssignments';
import { parseTravelSearchIntent } from '@/lib/map/planQueryBuilder';
import { resolveMapPlanContext } from '@/lib/map/resolveMapPlanContext';
import { extractMultiStopDestinations } from '@/lib/map/travelQueryParsing';
import { correctAdvisorSpeechIntent } from '@/lib/speech/advisorSpeechIntentCorrections';

/** 下午 E 验收：5 条复杂搜索词回归 */
describe('afternoon regression cases', () => {
  it('曲阜微山湖台儿庄三日1500', () => {
    const query = '曲阜微山湖台儿庄三日1500';
    const stops = extractMultiStopDestinations(query);
    const intent = parseTravelSearchIntent(query);
    expect(stops).toEqual(['曲阜', '微山湖', '台儿庄']);
    expect(intent.days).toBe(3);
    const ctx = resolveMapPlanContext('enriched', stops.join('→'), {
      searchQuery: query,
      originName: '济南市历下区',
    });
    expect(ctx.locationName).toBe('曲阜→微山湖→台儿庄');
    expect(buildMultiStopDayAssignments(stops, 3)).toHaveLength(3);
  });

  it('周村古城青州潍坊四天自驾', () => {
    const query = '周村古城青州潍坊四天游自驾';
    const stops = extractMultiStopDestinations(query);
    const intent = parseTravelSearchIntent(query);
    expect(stops).toEqual(['周村古城', '青州', '潍坊']);
    expect(intent.days).toBe(4);
    expect(intent.transportMode).toBe('self_drive');
    expect(intent.selfDrive).toBe(true);
    expect(buildMultiStopDayAssignments(stops, 4)).toHaveLength(4);
  });

  it('济南到成都美食穷游', () => {
    const query = '济南到成都美食穷游';
    const intent = parseTravelSearchIntent(query);
    expect(intent.preferences).toContain('美食');
    expect(intent.transportMode).toBe('auto');
  });

  it('微山湖垂钓露营亲子', () => {
    const query = '微山湖垂钓露营亲子';
    const intent = parseTravelSearchIntent(query);
    expect(intent.preferences).toEqual(
      expect.arrayContaining(['垂钓', '露营', '亲子']),
    );
  });

  it('语音：曲府微山胡台二庄三天一千五', () => {
    const query = correctAdvisorSpeechIntent('曲府微山胡台二庄三天一千五');
    expect(query).toBe('曲阜微山湖台儿庄三天1500');
    const stops = extractMultiStopDestinations(query);
    expect(stops).toEqual(['曲阜', '微山湖', '台儿庄']);
  });
});
