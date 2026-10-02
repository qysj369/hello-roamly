import { describe, expect, it } from 'vitest';
import { switchSearchPlanPartyLocal } from '@/lib/agent/patchSearchPlanLocal';
import {
  popDistinctPlanSnapshot,
  popPlanSnapshot,
  pushPlanSnapshot,
} from '@/lib/agent/travelAgentSession';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';
import { searchPlanHeaderLine } from '@/lib/home/searchPlanShareCopy';

const friends = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: null,
})!;

describe('travelAgentSession snapshots', () => {
  it('pushes and pops a previous itinerary', () => {
    const snapshots = pushPlanSnapshot([], friends, '上海3天好友结伴');
    const popped = popPlanSnapshot(snapshots);
    expect(popped?.label).toBe('上海3天好友结伴');
    expect(popped?.plan.dayList[0]?.foods[0]?.shop).toBe('沈大成');
    expect(popped?.snapshots).toHaveLength(0);
  });

  it('clones on push so later edits cannot poison rollback', () => {
    const source = matchSearchPlanGoldExample({
      startCity: '济南',
      targetCity: '上海',
      days: 3,
      peopleType: '好友结伴',
      budget: null,
      theme: null,
    })!;
    const snapshots = pushPlanSnapshot([], source, searchPlanHeaderLine(source));
    source.baseInfo.peopleType = '亲子';
    const popped = popPlanSnapshot(snapshots);
    expect(popped?.plan.baseInfo.peopleType).toBe('好友结伴');
    expect(popped?.plan.dayList[0]?.foods[0]?.shop).toBe('沈大成');
  });

  it('skips consecutive duplicate snapshots', () => {
    const once = pushPlanSnapshot([], friends, 'a');
    const twice = pushPlanSnapshot(once, friends, 'b');
    expect(twice).toHaveLength(1);
    expect(twice[0]?.label).toBe('a');
  });

  it('rolls friends → 亲子 back to 沈大成 even if a duplicate 亲子 snapshot sits on top', () => {
    const family = switchSearchPlanPartyLocal(friends, '亲子')!;
    const stacked = pushPlanSnapshot(
      pushPlanSnapshot(
        pushPlanSnapshot([], friends, searchPlanHeaderLine(friends)),
        family,
        '上一版行程',
      ),
      family,
      '上一版行程',
    );
    const popped = popDistinctPlanSnapshot(stacked, family);
    expect(popped?.plan.baseInfo.peopleType).toMatch(/好友/);
    expect(popped?.plan.dayList[0]?.foods[0]?.shop).toBe('沈大成');
    expect(searchPlanHeaderLine(popped!.plan)).toContain('好友结伴');
  });
});
