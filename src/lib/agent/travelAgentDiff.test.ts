import { describe, expect, it } from 'vitest';
import { describePlanFieldChanges, diffSearchPlanFields } from '@/lib/agent/travelAgentDiff';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';
import { resizeSearchPlanDays } from '@/lib/agent/patchSearchPlanLocal';

const friends = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: null,
})!;

describe('travelAgentDiff', () => {
  it('labels day count changes as 天数, not Dlength', () => {
    const next = resizeSearchPlanDays(friends, 2)!;
    const fields = diffSearchPlanFields(friends, next);
    expect(fields).toContain('dayList.length');
    expect(describePlanFieldChanges(fields)).toContain('天数');
    expect(describePlanFieldChanges(fields)).not.toContain('Dlength');
  });
});
