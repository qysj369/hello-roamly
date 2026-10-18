import { describe, expect, it } from 'vitest';
import {
  DeepSeekUnconfiguredError,
  runMapPlanGeneration,
} from '@/services/ai/runMapPlanGeneration';

describe('runMapPlanGeneration', () => {
  it('refuses mock fallback and requires a real model completer', async () => {
    await expect(
      runMapPlanGeneration(
        {
          lng: 120.15,
          lat: 30.28,
          query: '去杭州玩3天，同行单人，人均预算约2500元，自然山水',
          locationName: '杭州',
        },
        null,
      ),
    ).rejects.toBeInstanceOf(DeepSeekUnconfiguredError);
  });
});
