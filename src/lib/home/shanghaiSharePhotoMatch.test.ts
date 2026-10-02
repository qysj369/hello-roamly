import { describe, expect, it } from 'vitest';
import { matchSearchPlanGoldExample } from '@/lib/home/searchPlanGoldExamples';
import { matchShanghaiSharePhoto, pickShanghaiAtmospherePhoto } from '@/lib/home/shanghaiSharePhotoMatch';

const friends = matchSearchPlanGoldExample({
  startCity: '济南',
  targetCity: '上海',
  days: 3,
  peopleType: '好友结伴',
  budget: null,
  theme: null,
})!;

describe('shanghaiSharePhotoMatch', () => {
  it('matches itinerary names to the same-spot Shanghai photos', () => {
    const used = new Set<string>();
    const museum = matchShanghaiSharePhoto(friends, '上海博物馆', used, 'spot');
    const bund = matchShanghaiSharePhoto(friends, '外滩滨江', used, 'spot');
    const food = matchShanghaiSharePhoto(friends, '沈大成', used, 'food');
    expect(museum).toMatch(/natural-museum/);
    expect(museum).not.toMatch(/peoples-square|bund/);
    expect(bund).toMatch(/spot-bund\.jpg|shanghai\/spot-bund/);
    expect(food).toMatch(/shendacheng/);
    expect(new Set([museum, bund, food]).size).toBe(3);
  });

  it('falls back to a city atmosphere photo when the name is unknown', () => {
    const used = new Set<string>();
    const vibe = matchShanghaiSharePhoto(friends, '没有这座园', used);
    expect(vibe).toMatch(/old-street|cover|bund|wukang|peoples-square|century-park/);
  });

  it('picks a unused atmosphere frame for the cover', () => {
    const used = new Set<string>();
    const cover = pickShanghaiAtmospherePhoto(friends, used);
    expect(cover).toBeTruthy();
    expect(used.has(cover)).toBe(true);
  });
});
