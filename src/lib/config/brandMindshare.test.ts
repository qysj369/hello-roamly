import { describe, expect, it } from 'vitest';
import {
  AI_AUDIENCE_ADAPTATION_CONSTRAINTS,
  BRAND_AUDIENCE_SEGMENTS,
  BRAND_CORE_VALUES,
  BRAND_MINDSHARE_LINE,
  BRAND_SHARE_TITLE_TAG,
  BRAND_STORY_BODY,
  withBrandShareTitle,
  withCityIntroValueTail,
} from '@/lib/config/brandMindshare';
import { AI_SLOW_TRAVEL_PROMPT_CONSTRAINTS } from '@/lib/config/productPositioning';
import { holoDreamTripCards } from '@/data/holoDreamTripCards';

describe('brand mindshare / audience / story', () => {
  it('defines three core audiences with inspire tags', () => {
    expect(BRAND_AUDIENCE_SEGMENTS).toHaveLength(3);
    expect(BRAND_AUDIENCE_SEGMENTS.map((s) => s.inspireTag).sort()).toEqual(
      ['人文慢逛', '亲子时光', '近郊轻游'].sort(),
    );
  });

  it('maps inspire cards onto audience segments', () => {
    const ids = new Set(holoDreamTripCards.map((c) => c.audienceId));
    expect(ids.has('young_short_trip')).toBe(true);
    expect(ids.has('family')).toBe(true);
    expect(ids.has('culture_elder')).toBe(true);
    expect(holoDreamTripCards.every((c) => Boolean(c.liteTag))).toBe(true);
  });

  it('keeps four core values and story copy', () => {
    expect(BRAND_CORE_VALUES).toHaveLength(4);
    expect(BRAND_STORY_BODY.includes('免费出行信息工具')).toBe(true);
    expect(BRAND_MINDSHARE_LINE.includes('纯免费小众漫行')).toBe(true);
  });

  it('appends city intro value tail without duplicating', () => {
    const once = withCityIntroValueTail('泉城因水而活。');
    expect(once.includes('慢游不必追人流')).toBe(true);
    expect(withCityIntroValueTail(once)).toBe(once);
  });

  it('tags share titles with mindshare label', () => {
    expect(withBrandShareTitle('杭州三日')).toContain(BRAND_SHARE_TITLE_TAG);
    expect(withBrandShareTitle(BRAND_SHARE_TITLE_TAG)).toBe(BRAND_SHARE_TITLE_TAG);
  });

  it('injects audience adaptation into AI slow-travel constraints', () => {
    expect(AI_AUDIENCE_ADAPTATION_CONSTRAINTS.includes('人群适配')).toBe(true);
    expect(AI_SLOW_TRAVEL_PROMPT_CONSTRAINTS.includes('人群适配')).toBe(true);
  });
});
