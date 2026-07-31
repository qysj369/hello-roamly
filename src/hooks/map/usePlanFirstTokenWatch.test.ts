import { describe, expect, it } from 'vitest';
import { PLAN_FIRST_TOKEN_SLOW_MS } from '@/hooks/map/usePlanFirstTokenWatch';

describe('usePlanFirstTokenWatch', () => {
  it('uses a soft threshold above typical first-token latency', () => {
    expect(PLAN_FIRST_TOKEN_SLOW_MS).toBeGreaterThanOrEqual(8_000);
    expect(PLAN_FIRST_TOKEN_SLOW_MS).toBeLessThanOrEqual(20_000);
  });
});
