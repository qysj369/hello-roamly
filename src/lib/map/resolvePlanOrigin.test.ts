import { describe, expect, it } from 'vitest';
import type { MapRouteEndpoint } from '@/hooks/map/useMapPlanningAssistant';
import {
  resolvePlanOriginEndpoint,
  shouldAttachOriginToPlan,
  type ResolvedPlanOrigin,
} from '@/lib/map/resolvePlanOrigin';

const manualOrigin: MapRouteEndpoint = {
  label: '济南市历下区中林路绿城百合花园',
  gcjLng: 117.12,
  gcjLat: 36.65,
  wgsLng: 117.11,
  wgsLat: 36.64,
};

describe('shouldAttachOriginToPlan', () => {
  it('allows manual origin when query has explicit route', () => {
    const origin: ResolvedPlanOrigin = {
      endpoint: manualOrigin,
      labelForAi: manualOrigin.label,
      source: 'manual',
    };
    expect(shouldAttachOriginToPlan(origin, '济南历下区', '莆田')).toBe(true);
  });

  it('uses silent fallback home for destination-only search like 成都', () => {
    const fallback: ResolvedPlanOrigin = {
      endpoint: manualOrigin,
      labelForAi: manualOrigin.label,
      source: 'fallback',
    };
    expect(shouldAttachOriginToPlan(fallback, null, '成都')).toBe(true);
    expect(shouldAttachOriginToPlan(fallback, null, '济南')).toBe(false);
  });

  it('uses manual home for natural destination-only search like 成都火锅', () => {
    const manual: ResolvedPlanOrigin = {
      endpoint: manualOrigin,
      labelForAi: manualOrigin.label,
      source: 'manual',
    };
    expect(shouldAttachOriginToPlan(manual, null, '成都')).toBe(true);
    expect(shouldAttachOriginToPlan(manual, null, '济南')).toBe(false);
  });

  it('blocks unreliable GPS when query has no route', () => {
    const gps: ResolvedPlanOrigin = {
      endpoint: manualOrigin,
      labelForAi: '济南市历下区舜华路街道经十路6777路',
      source: 'gps',
    };
    expect(shouldAttachOriginToPlan(gps, null, '成都')).toBe(false);
  });

  it('allows GPS when query explicitly contains origin city', () => {
    const origin: ResolvedPlanOrigin = {
      endpoint: manualOrigin,
      labelForAi: '济南市历下区舜华路街道经十路6777路',
      source: 'gps',
    };
    expect(shouldAttachOriginToPlan(origin, '济南历下区', '莆田')).toBe(true);
  });

  it('allows manual origin for multi-stop out-of-town route', () => {
    const manual: ResolvedPlanOrigin = {
      endpoint: manualOrigin,
      labelForAi: manualOrigin.label,
      source: 'manual',
    };
    expect(shouldAttachOriginToPlan(manual, null, '曲阜→微山湖→台儿庄')).toBe(true);
  });

  it('allows GPS origin for multi-stop out-of-town route', () => {
    const gps: ResolvedPlanOrigin = {
      endpoint: manualOrigin,
      labelForAi: '济南市历下区舜华路街道经十路6777路',
      source: 'gps',
    };
    expect(shouldAttachOriginToPlan(gps, null, '曲阜→微山湖→台儿庄')).toBe(true);
  });
});

describe('resolvePlanOriginEndpoint', () => {
  it('prefers manual origin over search district hint', async () => {
    const resolved = await resolvePlanOriginEndpoint('济南历下区', manualOrigin, 'manual');
    expect(resolved.source).toBe('manual');
    expect(resolved.labelForAi).toBe('济南市历下区中林路绿城百合花园');
  });
});
