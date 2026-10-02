import { describe, expect, it } from 'vitest';
import { runTravelAgentTurn } from '@/lib/agent/runTravelAgentTurn';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';

const friends = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: null,
})!;

describe('runTravelAgentTurn', () => {
  it('assembles Hangzhou locally from city knowledge', async () => {
    const result = await runTravelAgentTurn({
      text: '杭州3天亲子',
      plan: null,
    });
    expect(result.kind).toBe('plan');
    if (result.kind !== 'plan') return;
    expect(result.patch).toBe(false);
    expect(result.plan.baseInfo.targetCity).toBe('杭州');
    expect(result.plan.dayList).toHaveLength(3);
    expect(result.plan.dayList.some((day) => day.spots.some((spot) => /博物馆/.test(spot.name)))).toBe(true);
  });

  it('generates the Shanghai 3-day friends gold sample', async () => {
    const result = await runTravelAgentTurn({
      text: '上海3天好友结伴',
      plan: null,
    });
    expect(result.kind).toBe('plan');
    if (result.kind !== 'plan') return;
    expect(result.patch).toBe(false);
    expect(result.plan.dayList[0]?.foods[0]?.shop).toBe('沈大成');
    expect(result.plan.globalTips[1]).toContain('北外滩');
    expect(result.message).toContain('发给朋友');
    expect(result.recommended).toEqual([]);
  });

  it('refuses off-topic chat', async () => {
    const result = await runTravelAgentTurn({
      text: '今天股市怎么样',
      plan: null,
    });
    expect(result.kind).toBe('ask');
    if (result.kind !== 'ask') return;
    expect(result.message).toContain('办完');
  });

  it('opens share as a site tool', async () => {
    const result = await runTravelAgentTurn({
      text: '发给朋友',
      plan: friends,
    });
    expect(result).toMatchObject({ kind: 'tool', tool: 'share' });
  });

  it('patches party in place', async () => {
    const result = await runTravelAgentTurn({
      text: '改成亲子',
      plan: friends,
    });
    expect(result.kind).toBe('plan');
    if (result.kind !== 'plan') return;
    expect(result.patch).toBe(true);
    expect(result.plan.dayList[0]?.tips).toContain('少走路');
    expect(result.message).toContain('没有整页重绘');
    expect(friends.baseInfo.peopleType).toMatch(/好友/);
    expect(friends.dayList[0]?.foods[0]?.shop).toBe('沈大成');
  });

  it('answers a suitability question without rewriting the plan', async () => {
    const result = await runTravelAgentTurn({
      text: '这条路线适合亲子吗？',
      plan: friends,
    });
    expect(result.kind).toBe('ask');
    if (result.kind !== 'ask') return;
    expect(result.message).toContain('改成亲子');
  });

  it('shrinks days without a full regenerate', async () => {
    const result = await runTravelAgentTurn({
      text: '改成2天',
      plan: friends,
    });
    expect(result.kind).toBe('plan');
    if (result.kind !== 'plan') return;
    expect(result.patch).toBe(true);
    expect(result.plan.dayList).toHaveLength(2);
    expect(result.changedFields.length).toBeGreaterThan(0);
    expect(result.message).toContain('天数');
    expect(result.message).not.toContain('Dlength');
    expect(result.message).not.toMatch(/。。/);
  });

  it('rewrites day 1 indoor when asked about rain', async () => {
    const result = await runTravelAgentTurn({
      text: '下雨怎么走',
      plan: friends,
    });
    expect(result.kind).toBe('plan');
    if (result.kind !== 'plan') return;
    expect(result.patch).toBe(true);
    expect(result.plan.dayList[0]?.spots[0]?.name).toBe('上海城市规划展示馆');
    expect(result.plan.dayList[0]?.title).toContain('上海城市规划展示馆');
    expect(result.plan.globalTips.some((tip) => tip.startsWith('雨天替代'))).toBe(true);
    expect(result.message).toMatch(/室内|雨天/);
  });

  it('rewrites day 1 to a quieter spot when asked about crowds', async () => {
    const result = await runTravelAgentTurn({
      text: '人多怎么走',
      plan: friends,
    });
    expect(result.kind).toBe('plan');
    if (result.kind !== 'plan') return;
    expect(result.patch).toBe(true);
    expect(result.plan.dayList[0]?.spots[0]?.name).toBe('北外滩滨江');
    expect(result.plan.dayList[0]?.title).toContain('北外滩滨江');
    expect(result.message).toContain('分流');
  });

  it('swaps restaurants from city knowledge without rewriting spots', async () => {
    const result = await runTravelAgentTurn({
      text: '换馆子',
      plan: friends,
    });
    expect(result.kind).toBe('plan');
    if (result.kind !== 'plan') return;
    expect(result.patch).toBe(true);
    expect(result.plan.dayList[0]?.foods[0]?.shop).not.toBe('沈大成');
    expect(result.plan.dayList[0]?.title).toBe(friends.dayList[0]?.title);
    expect(result.message).toContain('餐饮');
  });

  it('rewrites spots locally when asked to walk less', async () => {
    const result = await runTravelAgentTurn({
      text: '少走路',
      plan: friends,
    });
    expect(result.kind).toBe('plan');
    if (result.kind !== 'plan') return;
    expect(result.patch).toBe(true);
    expect(result.message).toContain('少走路');
    expect(result.plan.dayList[0]?.tips).toContain('少走路');
  });

  it('exposes save as a site tool', async () => {
    const result = await runTravelAgentTurn({
      text: '帮我保存行程',
      plan: friends,
    });
    expect(result).toMatchObject({ kind: 'tool', tool: 'save' });
  });
});
