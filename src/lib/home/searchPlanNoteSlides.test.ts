import { describe, expect, it } from 'vitest';
import { getSearchPlanXhsPosterInput } from '@/lib/home/buildSearchPlanPoster';
import { getSearchPlanNoteCoverUrl, getSearchPlanNoteSlides } from '@/lib/home/searchPlanNoteSlides';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';

const friends = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: null,
})!;

describe('searchPlanNoteSlides', () => {
  it('maps the Shanghai friends gold sample to day photos', () => {
    const slides = getSearchPlanNoteSlides(friends);
    expect(slides).toHaveLength(3);
    expect(slides[0]).toMatchObject({
      eyebrow: 'Day 1',
      imageUrl: expect.stringMatching(/natural-museum|museum/),
    });
    expect(slides[1]?.imageUrl).toMatch(/yuyuan|xintiandi|xiaolong/);
    expect(slides[2]?.imageUrl).toMatch(/wukang|cafe/);
    expect(slides.map((slide) => slide.imageUrl)).toEqual([...new Set(slides.map((slide) => slide.imageUrl))]);
    expect(slides[0]?.caption).toContain('南京东路');
  });

  it('puts fragment cards on the Xiaohongshu poster input', () => {
    const input = getSearchPlanXhsPosterInput(friends, 'https://helloroamly.com/s');
    expect(input.badgeLabel).toBe('蜗牛旅行');
    expect(input.noteSlides).toHaveLength(3);
    expect(input.noteSlides?.some((slide) => /Day\s*[123]/i.test(`${slide.eyebrow}${slide.title}`))).toBe(false);
    expect(input.slideImageUrls).toEqual(input.noteSlides?.map((slide) => slide.imageUrl));
    expect(input.summarySlide).toBeUndefined();
    expect(input.coverImageUrl).toBe('/city-kit/shanghai/spot-bund.jpg');
    expect(getSearchPlanNoteCoverUrl(friends)).toBe('/city-kit/shanghai/spot-bund.jpg');
  });
});
