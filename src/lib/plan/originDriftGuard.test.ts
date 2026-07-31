import { describe, expect, it } from 'vitest';
import { scrubOriginDriftInPlan } from '@/lib/plan/originDriftGuard';

describe('scrubOriginDriftInPlan', () => {
  it('replaces wrong GPS Jingshi Road address with locked origin', () => {
    const raw =
      '### 1. 出发·家门口→出发站\n从「济南市历下区舜华路街道经十路6777路」到「济南西站」';
    const locked = '济南市历下区中林路绿城百合花园';
    const out = scrubOriginDriftInPlan(raw, locked);
    expect(out).toContain('绿城百合花园');
    expect(out).not.toContain('经十路6777');
  });

  it('leaves content when locked origin is the wrong GPS point', () => {
    const raw = '从「济南市历下区舜华路街道经十路6777路」出发';
    expect(scrubOriginDriftInPlan(raw, '济南市历下区舜华路街道经十路6777路')).toBe(raw);
  });
});
