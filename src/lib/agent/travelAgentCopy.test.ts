import { describe, expect, it } from 'vitest';
import { buildAgentNextActions, buildFreshPlanMessage } from '@/lib/agent/travelAgentCopy';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';

const friends = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: null,
})!;

describe('travelAgentCopy', () => {
  it('offers family, rain, crowd and share after a friends plan', () => {
    const actions = buildAgentNextActions(friends);
    expect(actions.map((item) => item.id)).toEqual(['family', 'rain', 'holiday', 'share']);
    expect(buildFreshPlanMessage(friends)).toContain('改成亲子');
    expect(buildFreshPlanMessage(friends)).toContain('发给朋友');
  });

  it('offers rain, crowd and share after a family plan', () => {
    const family = matchSearchPlanGoldExample({
      startCity: '济南',
      targetCity: '上海',
      days: 3,
      peopleType: '亲子',
      budget: null,
      theme: null,
    })!;
    expect(buildAgentNextActions(family).map((item) => item.id)).toEqual([
      'rain',
      'holiday',
      'share',
      'budget',
    ]);
  });
});
