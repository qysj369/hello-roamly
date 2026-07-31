import { describe, expect, it } from 'vitest';
import { AI_CHAT_FEATURED_CITIES } from '@/data/aiChatHotCities';
import { HOME_HOT_CITY_COUNT, homeHotCities } from '@/data/homeHotCities';
import { resolveCityCoverUrl } from '@/data/cityCoverImages';

describe('homeHotCities', () => {
  it('lists 12 launch cities aligned with ai chat featured row', () => {
    expect(HOME_HOT_CITY_COUNT).toBe(12);
    expect(homeHotCities.map((city) => city.label)).toEqual(
      AI_CHAT_FEATURED_CITIES.map((city) => city.name),
    );
  });

  it('assigns a cover for every hot city', () => {
    for (const city of homeHotCities) {
      expect(resolveCityCoverUrl(city.label), city.label).toBeTruthy();
    }
  });
});
