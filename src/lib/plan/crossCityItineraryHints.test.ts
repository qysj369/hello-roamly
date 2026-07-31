import { describe, expect, it } from 'vitest';
import { buildCrossCityDay1LocalTransitHint } from '@/lib/plan/doorToDoorTransit';

describe('buildCrossCityDay1LocalTransitHint', () => {
  it('requires door-to-door chain for Jinan to Putian', () => {
    const hint = buildCrossCityDay1LocalTransitHint('济南市历下区', '莆田');
    expect(hint).toContain('历下');
    expect(hint).toContain('济南西站');
    expect(hint).toContain('抵达');
    expect(hint).toContain('落地最佳');
  });
});
