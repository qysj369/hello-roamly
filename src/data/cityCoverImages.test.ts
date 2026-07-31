import { describe, expect, it } from 'vitest';
import { AI_CHAT_ALL_CITIES } from '@/data/aiChatHotCities';
import { CITY_COORDINATES } from '@/data/cityCoordinates';
import { homeHotCities } from '@/data/homeHotCities';
import {
  getMissingCityCoverKeys,
  getMissingCityCoverNames,
  resolveCityCoverUrl,
  resolveCoverFromPlaceText,
} from '@/data/cityCoverImages';

describe('cityCoverImages', () => {
  it('covers every city in CITY_COORDINATES', () => {
    expect(getMissingCityCoverKeys()).toEqual([]);
  });

  it('covers every ai chat hot city', () => {
    const names = AI_CHAT_ALL_CITIES.map((city) => city.name);
    expect(getMissingCityCoverNames(names)).toEqual([]);
  });

  it('maps landmark aliases to distinct covers', () => {
    expect(resolveCoverFromPlaceText('西湖 · 杭州')).toContain('1747798678108');
    expect(resolveCoverFromPlaceText('灵隐 · 杭州')).toContain('1676487419872');
    expect(resolveCoverFromPlaceText('清迈夜市')).toContain('1773484133112');
    expect(resolveCoverFromPlaceText('蓝湖 · 冰岛')).toContain('1576090674370');
    expect(resolveCoverFromPlaceText('维克 · 冰岛')).toContain('1705630547844');
    expect(resolveCoverFromPlaceText('下龙湾 · 越南')).toContain('1761127138372');
  });

  it('assigns iconic landmarks for major cities', () => {
    expect(resolveCityCoverUrl('上海')).toContain('1697776518314');
    expect(resolveCityCoverUrl('武汉')).toContain('1682082435544');
    expect(resolveCityCoverUrl('广州')).toContain('1746880866377');
    expect(resolveCityCoverUrl('桂林')).toContain('1659233306527');
    expect(resolveCityCoverUrl('大理')).toContain('1725378673587');
    expect(resolveCityCoverUrl('沈阳')).toContain('1770347258014');
    expect(resolveCityCoverUrl('长春')).toContain('1515125997599');
    expect(resolveCityCoverUrl('温州')).toContain('1694355045290');
    expect(resolveCityCoverUrl('珠海')).toContain('1772867342647');
    expect(resolveCityCoverUrl('贵阳')).toContain('1768802871132');
    expect(resolveCityCoverUrl('洛阳')).toContain('1764333944777');
    expect(resolveCityCoverUrl('乐山')).toContain('1694565166352');
    expect(resolveCityCoverUrl('九寨沟')).toContain('1763484207971');
    expect(resolveCityCoverUrl('张家界')).toContain('1769007462035');
    expect(resolveCityCoverUrl('黄山')).toContain('/city-covers/huangshan.jpg');
    expect(resolveCityCoverUrl('曲阜')).toContain('/city-covers/qufu.jpg');
    expect(resolveCityCoverUrl('泰山')).toContain('/city-covers/taishan.jpg');
    expect(resolveCityCoverUrl('泉州')).toContain('/city-covers/quanzhou.jpg');
    expect(resolveCityCoverUrl('郑州')).toContain('/city-covers/zhengzhou.jpg');
    expect(resolveCityCoverUrl('镇江')).toContain('1773534536899');
    expect(resolveCityCoverUrl('台儿庄')).toContain('1779850562330');
    expect(resolveCityCoverUrl('敦煌')).toContain('1755417288480');
    expect(resolveCityCoverUrl('拉萨')).toContain('1741257091145');
    expect(resolveCityCoverUrl('张掖')).toContain('1755417288788');
    expect(resolveCityCoverUrl('大同')).toContain('1758079789347');
    expect(resolveCityCoverUrl('香格里拉')).toContain('1769695239369');
  });

  it('maps confucian and sacred mountain aliases', () => {
    expect(resolveCoverFromPlaceText('孔庙 · 曲阜')).toContain('/city-covers/qufu.jpg');
    expect(resolveCoverFromPlaceText('南天门 · 泰山')).toContain('/city-covers/taishan.jpg');
    expect(resolveCoverFromPlaceText('开元寺 · 泉州')).toContain('/city-covers/quanzhou.jpg');
    expect(resolveCoverFromPlaceText('洱海 · 大理')).toContain('1725378673587');
    expect(resolveCoverFromPlaceText('月牙泉 · 敦煌')).toContain('1755417288480');
    expect(resolveCoverFromPlaceText('布达拉宫 · 拉萨')).toContain('1741257091145');
  });

  it('gives home hot cities distinct cover ids', () => {
    const ids = homeHotCities.map((city) => resolveCityCoverUrl(city.label));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('registers all coordinate cities with reachable URLs', () => {
    for (const city of Object.keys(CITY_COORDINATES)) {
      const url = resolveCityCoverUrl(city);
      expect(url, `${city} should have cover`).toBeTruthy();
      expect(url!.startsWith('http') || url!.startsWith('/'), city).toBe(true);
    }
  });
});
