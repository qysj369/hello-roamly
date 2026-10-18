import { describe, expect, it } from 'vitest';

import {
  estimateTravelPlanSeconds,
  resolveTravelPlanMaxTokens,
} from '@/services/ai/travelPlanGenerationLimits';

describe('travelPlanGenerationLimits', () => {
  it('scales max tokens with days', () => {
    expect(resolveTravelPlanMaxTokens(1)).toBe(500);
    expect(resolveTravelPlanMaxTokens(3)).toBe(940);
    expect(resolveTravelPlanMaxTokens(5)).toBe(1380);
    expect(resolveTravelPlanMaxTokens(14)).toBe(2200);
  });

  it('estimates wait time for UI hints', () => {
    expect(estimateTravelPlanSeconds(3)).toBe(22);
    expect(estimateTravelPlanSeconds(5)).toBe(32);
    expect(estimateTravelPlanSeconds(14)).toBe(42);
  });
});
