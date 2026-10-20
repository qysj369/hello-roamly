import { describe, expect, it } from 'vitest';
import { listSnailFlightImagerySources } from '@/lib/snail-flight/imagery';

describe('snail-flight imagery', () => {
  it('does not use Esri World Imagery over China', () => {
    const sources = listSnailFlightImagerySources();
    expect(sources.some((source) => source.url.includes('arcgisonline'))).toBe(false);
    expect(sources.some((source) => source.kind === 'esri')).toBe(false);
  });

  it('falls back to same-origin Amap satellite tiles when Tianditu is unset', () => {
    const sources = listSnailFlightImagerySources();
    if (sources[0]?.kind === 'tianditu') {
      return;
    }
    expect(sources[0]?.kind).toBe('amap');
    expect(sources[0]?.url).toContain('cesium-sat/amap/r2/{z}/{x}/{y}');
  });
});
