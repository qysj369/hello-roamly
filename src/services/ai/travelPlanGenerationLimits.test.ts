import { describe, expect, it } from 'vitest';

import {
  estimateTravelPlanSeconds,
  resolveTravelPlanMaxTokens,
} from '@/services/ai/travelPlanGenerationLimits';

describe('travelPlanGenerationLimits', () => {
  it('scales max tokens with days', () => {
    expect(resolveTravelPlanMaxTokens(1)).toBe(720);
    expect(resolveTravelPlanMaxTokens(3)).toBe(1320);
    expect(resolveTravelPlanMaxTokens(5)).toBe(1920);
    expect(resolveTravelPlanMaxTokens(14)).toBe(2800);
  });

  it('estimates wait time for UI hints', () => {
    expect(estimateTravelPlanSeconds(3)).toBe(31);
    expect(estimateTravelPlanSeconds(5)).toBe(45);
    expect(estimateTravelPlanSeconds(14)).toBe(55);
  });
});
