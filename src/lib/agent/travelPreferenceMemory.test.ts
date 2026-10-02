import { beforeEach, describe, expect, it } from 'vitest';
import {
  TRAVEL_PREFERENCE_MEMORY_KEY,
  applyMemoryToExtract,
  learnPreferenceFromEdit,
  readTravelPreferenceMemory,
  rememberTravelPreference,
  resetTravelPreferenceMemory,
} from '@/lib/agent/travelPreferenceMemory';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';

describe('travelPreferenceMemory', () => {
  beforeEach(() => {
    window.localStorage.removeItem(TRAVEL_PREFERENCE_MEMORY_KEY);
  });

  it('remembers party and fills it into a later extract', () => {
    const plan = matchSearchPlanGoldExample({
      startCity: '济南',
      targetCity: '上海',
      days: 3,
      peopleType: '好友结伴',
      budget: null,
      theme: null,
    })!;
    rememberTravelPreference(plan);
    expect(readTravelPreferenceMemory().peopleType).toBe('好友结伴');
    expect(applyMemoryToExtract({ targetCity: '上海', days: 3 }).peopleType).toBe('好友结伴');
    learnPreferenceFromEdit('spots');
    expect(readTravelPreferenceMemory().weights.viralPenalty).toBe(1);
    resetTravelPreferenceMemory();
    expect(readTravelPreferenceMemory().peopleType).toBeNull();
    expect(readTravelPreferenceMemory().weights.viralPenalty).toBe(0);
    expect(applyMemoryToExtract({ targetCity: '上海', days: 3 }, { peopleType: '亲子' }).peopleType).toBe(
      '亲子',
    );
  });
});
