import { describe, expect, it } from 'vitest';
import { SEARCH_PLAN_SHARE_CTA } from '@/lib/home/searchPlanShareChannels';
import { buildSearchPlanShareNote } from '@/lib/home/searchPlanShareNote';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';

const friends = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: null,
})!;

describe('searchPlanShareNote', () => {
  it('packs the Shanghai friends gold sample into a snail long note', () => {
    const note = buildSearchPlanShareNote(friends, { density: 'full' });
    expect(note).toMatch(/^【蜗牛旅行】/);
    expect(note).toContain('Day 1');
    expect(note).toContain('上海博物馆');
    expect(note).toContain('沈大成');
    expect(note).toContain('小贴士');
    expect(note).toContain('和朋友来上海');
    expect(note).toContain('先去武康路');
    expect(note).not.toMatch(/梧桐老洋房小众街巷。梧桐老洋房/);
    expect(note).not.toContain('必体验：');
    expect(note).not.toContain('吃：');
    expect(note).not.toContain('亮点：');
    expect(note).not.toContain(SEARCH_PLAN_SHARE_CTA);
  });

  it('keeps short and spoken notes compact but branded', () => {
    const short = buildSearchPlanShareNote(friends, { density: 'short' });
    const spoken = buildSearchPlanShareNote(friends, { density: 'spoken' });
    const publicSpoken = buildSearchPlanShareNote(friends, { density: 'spoken', publicSafe: true });
    expect(short).toMatch(/^【蜗牛旅行】/);
    expect(short).toContain('Day 1');
    expect(short).toContain('沈大成');
    expect(short).not.toContain('贴士');
    expect(spoken).toContain('【口播】');
    expect(spoken).toContain('【蜗牛旅行】');
    expect(spoken).toContain('上海博物馆');
    expect(spoken).not.toContain('Day 2');
    expect(spoken).not.toContain('Day 3');
    expect(spoken).not.toMatch(/1210|1800/);
    expect(publicSpoken).toContain('别被网红点位');
    expect(publicSpoken).not.toContain('【口播】');
    expect(publicSpoken).not.toMatch(/1210/);
    expect(publicSpoken).not.toContain('一键定制');
    expect(publicSpoken).not.toContain('Day 1');
    const seed = buildSearchPlanShareNote(friends, { density: 'seed', publicSafe: true });
    expect(seed).toContain('上海博物馆');
    expect(seed).toContain('沈大成');
    expect(seed).not.toContain('Day 1');
    expect(seed).not.toMatch(/1210|1800/);
  });

  it('leads Dianping with shops while keeping the snail brand', () => {
    const note = buildSearchPlanShareNote(friends, { density: 'dianping' });
    expect(note).toMatch(/^【蜗牛旅行】/);
    expect(note).toContain('沈大成');
    expect(note).toContain('南翔馒头店');
    expect(note).toContain('顺便逛');
  });
});
