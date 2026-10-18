import { describe, expect, it } from 'vitest';
import { buildSearchPlanAssetPack, buildSearchPlanDouyinScenes, buildSearchPlanXhsScenes } from '@/lib/home/searchPlanAssetPack';
import { SEARCH_PLAN_SHARE_REF } from '@/lib/home/searchPlanShareChannels';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';

const friends = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: null,
})!;

describe('searchPlanAssetPack', () => {
  it('builds Douyin motion scenes from a single-day fragment, not a 3-day list', () => {
    const scenes = buildSearchPlanDouyinScenes(friends);
    expect(scenes.length).toBeGreaterThanOrEqual(2);
    expect(scenes.length).toBeLessThanOrEqual(3);
    expect(scenes.some((scene) => /博物馆|外滩|沈大成|小笼/.test(`${scene.title}${scene.caption}`))).toBe(
      true,
    );
    expect(scenes.some((scene) => /Day\s*[123]/i.test(`${scene.kicker}${scene.title}${scene.caption}`))).toBe(
      false,
    );
    expect(scenes.map((scene) => scene.title)).toEqual(['沈大成柜台', '蟹粉小笼', '老城街巷']);
    expect(scenes[0]?.imageUrl).toMatch(/xiaolong|food/);
  });

  it('keeps spoken script, subtitles and Xiaohongshu notes in sync after packing', () => {
    const pack = buildSearchPlanAssetPack(friends, 'https://helloroamly.com/?share=1');
    expect(pack.douyinSpoken).toContain(SEARCH_PLAN_SHARE_REF);
    expect(pack.douyinSpoken).not.toContain('旅行社组团');
    expect(pack.douyinSpoken).not.toContain('【口播】');
    expect(pack.douyinSpoken).not.toContain('#蜗牛旅行');
    expect(pack.douyinSpoken).not.toContain('一键定制');
    expect(pack.douyinSpoken).not.toContain('Day 2');
    expect(pack.douyinSpoken).not.toContain('helloroamly.com');
    expect(pack.douyinSpoken).not.toMatch(/1210|1800/);
    expect(pack.douyinSpoken).toContain('沈大成');
    expect(pack.douyinSpoken).toContain('蟹粉小笼');
    expect(pack.xhsNote).toContain('沈大成');
    expect(pack.xhsNote).toContain('上海博物馆');
    expect(pack.xhsNote).toContain(SEARCH_PLAN_SHARE_REF);
    expect(pack.xhsNote).not.toContain('旅行社组团');
    expect(pack.xhsNote).not.toContain('Day 1');
    expect(pack.wechatNote).toContain('上海博物馆');
    expect(pack.plainText).not.toContain('Day 1');
    expect(pack.plainText).toContain(SEARCH_PLAN_SHARE_REF);
  });

  it('uses Hangzhou seed shots on the Douyin motion card', () => {
    const hangzhou: typeof friends = {
      ...friends,
      baseInfo: { ...friends.baseInfo, targetCity: '杭州' },
      dayList: [
        {
          ...friends.dayList[0]!,
          title: '西湖苏堤慢逛',
          spots: [{ name: '西湖苏堤', intro: '必体验：沿堤散步' }],
          foods: [],
        },
      ],
    };
    const scenes = buildSearchPlanDouyinScenes(hangzhou);
    expect(scenes.map((scene) => scene.title)).toEqual(['苏堤', '湖边长椅', '雷峰塔远景']);
    expect(scenes.some((scene) => /Day\s*[123]/i.test(`${scene.kicker}${scene.title}${scene.caption}`))).toBe(
      false,
    );
    expect(scenes[0]?.imageUrl).toContain('westlake');
  });

  it('pads Xiaohongshu scenes to exactly three city-matched slides', () => {
    const thin: typeof friends = {
      ...friends,
      baseInfo: { ...friends.baseInfo, targetCity: '杭州' },
      dayList: [
        {
          ...friends.dayList[0]!,
          title: '西湖慢逛',
          spots: [{ name: '西湖', intro: '必体验：湖边走走。定制行程见完整攻略 https://helloroamly.com' }],
          foods: [],
        },
      ],
    };
    const slides = buildSearchPlanXhsScenes(thin);
    expect(slides).toHaveLength(3);
    expect(slides[0]?.title).toBe('西湖');
    expect(slides[0]?.imageUrl).toContain('westlake');
    expect(new Set(slides.map((slide) => slide.imageUrl)).size).toBe(3);
    for (const slide of slides) {
      const blob = `${slide.kicker}${slide.title}${slide.caption}`;
      expect(blob).not.toMatch(/Day\s*[123]/i);
      expect(blob).not.toContain('helloroamly.com');
      expect(blob).not.toContain('完整攻略');
      expect(blob).not.toContain('定制行程');
      expect(blob).not.toContain('游玩灵感');
    }
  });

  it('matches Shanghai itinerary spots instead of a canned three-shot script', () => {
    const scenes = buildSearchPlanXhsScenes(friends);
    expect(scenes.map((scene) => scene.title)).toEqual(['上海博物馆', '外滩滨江', '沈大成']);
    expect(scenes[0]?.imageUrl).toMatch(/natural-museum|museum/);
    expect(scenes[0]?.imageUrl).not.toMatch(/peoples-square/);
    expect(scenes[1]?.imageUrl).toMatch(/bund/);
    expect(scenes[2]?.imageUrl).toMatch(/shendacheng|xiaolong/);
  });
});
