import { describe, expect, it } from 'vitest';
import {
  SEARCH_PLAN_SHARE_CTA,
  SEARCH_PLAN_SHARE_REF,
  sanitizeShareExportText,
} from '@/lib/home/searchPlanShareChannels';
import { buildSearchPlanXhsNoteSlides, buildSearchPlanXhsSeedCopy } from '@/lib/home/buildSearchPlanXhsNotePack';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';

const friends = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: null,
})!;

const SENSITIVE = /Day\s*[123]|人均|\d+\s*元|helloroamly\.com|AI定制|全套攻略|一键定制/;

describe('buildSearchPlanXhsNotePack', () => {
  it('builds cover / fragment / food slides from the Shanghai itinerary', () => {
    const slides = buildSearchPlanXhsNoteSlides(friends);
    expect(slides.map((slide) => slide.role)).toEqual(['cover', 'fragments', 'food']);
    expect(slides[0]?.title).toContain('周末不用赶');
    expect(slides[0]?.imageUrl).toMatch(/old-street|cover|bund|wukang/);
    expect(slides[1]?.title).toContain('上海博物馆');
    expect(slides[1]?.title).toContain('外滩滨江');
    expect(slides[1]?.imageUrl).toMatch(/natural-museum/);
    expect(slides[2]?.title).toContain('沈大成');
    expect(slides[2]?.imageUrl).toMatch(/shendacheng/);
    for (const slide of slides) {
      expect(`${slide.eyebrow}${slide.title}${slide.caption}`).not.toMatch(SENSITIVE);
    }
  });

  it('writes a soft Xiaohongshu note with tags and the shared disclaimer', () => {
    const copy = buildSearchPlanXhsSeedCopy(friends);
    expect(copy).toContain(SEARCH_PLAN_SHARE_REF);
    expect(copy).toMatch(/#上海慢游|#城市漫游|#周末去哪/);
    expect(copy.match(/#/g)?.length).toBeGreaterThanOrEqual(3);
    expect(copy.match(/#/g)?.length).toBeLessThanOrEqual(5);
    expect(copy).not.toMatch(SENSITIVE);
    expect(copy).not.toContain(SEARCH_PLAN_SHARE_CTA);
    expect(sanitizeShareExportText(copy)).toBe(copy);
  });
});
