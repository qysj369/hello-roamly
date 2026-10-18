import { describe, expect, it } from 'vitest';
import { validateCityPreviewTemplate } from '@/data/cityPreviewTemplate';
import { buildPlaceholderGallery } from '@/data/holoCityPreviewGalleryResolve';
import { getCityPreviewGallery } from '@/data/holoCityPreviewMedia';
import { getHoloCityPreviewPanel } from '@/data/holoCityPreviewPanel';
import { findHoloHomeCityKit } from '@/data/holoHotCityKit';

const DEMO_CITIES = ['北京', '杭州', '济南', '苏州'] as const;

describe('示范城市弹窗内容（北京/杭州/济南/苏州）', () => {
  it.each(DEMO_CITIES)('%s 四段模板完整且地标含坐标', (city) => {
    const panel = getHoloCityPreviewPanel(city);
    expect(panel).toBeTruthy();
    expect(validateCityPreviewTemplate(city, panel!)).toEqual([]);
    expect(panel!.spots.length).toBeGreaterThanOrEqual(3);
    expect(panel!.foods.length).toBeGreaterThanOrEqual(3);
    expect(panel!.foods.every((f) => Boolean(f.shop?.trim()) && Boolean(f.area?.trim()))).toBe(
      true,
    );
    expect(panel!.intro).toMatch(/地铁|步行|骑行|走路|公交/);
    expect(panel!.intro).toMatch(/馆|居|店|碗|面|肉|川|鱼/);
    expect(panel!.spots.every((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng))).toBe(true);
    expect(findHoloHomeCityKit(city)).toBeTruthy();
    expect(getCityPreviewGallery(city).length).toBeGreaterThanOrEqual(3);
    expect(buildPlaceholderGallery(city).length).toBeGreaterThanOrEqual(3);
    expect(buildPlaceholderGallery(city)[0]?.src.startsWith('data:image/svg+xml')).toBe(true);
  });
});
