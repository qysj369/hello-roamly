import { describe, expect, it } from 'vitest';
import {
  assertCityPreviewMediaBound,
  getCityPreviewGallery,
  listHotCitiesWithPreviewMedia,
} from '@/data/holoCityPreviewMedia';
import { getLocalPhotoCandidates } from '@/data/holoCityPreviewGalleryResolve';
import { getHoloCityPreviewPanel, listHoloCityPreviewPanelCities } from '@/data/holoCityPreviewPanel';
import { findHoloHomeCityKit, getHoloHomeCityNames } from '@/data/holoHotCityKit';
import { MEDIA_PRIORITY_HOT_CITIES } from '@/lib/config/rolloutPhases';

describe('holo city preview media binding', () => {
  it('covers all 13 hot cities with panel drafts', () => {
    const hot = getHoloHomeCityNames();
    expect(hot).toHaveLength(13);
    for (const city of hot) {
      expect(getHoloCityPreviewPanel(city), city).not.toBeNull();
    }
    expect(listHoloCityPreviewPanelCities().sort()).toEqual([...hot].sort());
  });

  it('binds gallery src only under the same city media prefix', () => {
    for (const city of listHotCitiesWithPreviewMedia()) {
      const gallery = getCityPreviewGallery(city);
      for (const item of gallery) {
        expect(assertCityPreviewMediaBound(city, item.src), `${city} ${item.src}`).toBe(true);
      }
    }
  });

  it('hangzhou gallery keeps west-lake photos for priority rail', () => {
    const gallery = getCityPreviewGallery('杭州');
    expect(gallery.length).toBeGreaterThanOrEqual(1);
    expect(gallery.every((item) => item.src.startsWith('/city-kit/hangzhou/'))).toBe(true);
    const hangzhou = findHoloHomeCityKit('杭州');
    expect(hangzhou?.spots.every((s) => Boolean(s.photoPath))).toBe(true);
  });

  it('jinan gallery keeps in-city photos for image rail', () => {
    const gallery = getCityPreviewGallery('济南');
    expect(gallery.length).toBeGreaterThanOrEqual(1);
    expect(gallery.every((item) => item.src.startsWith('/city-kit/jinan/'))).toBe(true);
  });

  it('guangzhou gallery stays in-city and covers tower + dimsum', () => {
    const gallery = getCityPreviewGallery('广州');
    expect(gallery.length).toBeGreaterThanOrEqual(4);
    expect(gallery.every((item) => item.src.startsWith('/city-kit/guangzhou/'))).toBe(true);
    expect(gallery.some((item) => /广州塔|珠江/.test(item.label))).toBe(true);
    expect(gallery.some((item) => /早茶|点心/.test(item.label))).toBe(true);
  });

  it('chengdu gallery keeps in-city photos for priority rail', () => {
    const gallery = getCityPreviewGallery('成都');
    expect(gallery.length).toBeGreaterThanOrEqual(1);
    expect(gallery.every((item) => item.src.startsWith('/city-kit/chengdu/'))).toBe(true);
  });

  it('uses unified mood title format 城·主题漫行', () => {
    for (const city of getHoloHomeCityNames()) {
      const panel = getHoloCityPreviewPanel(city);
      expect(panel?.moodTitle.startsWith(`${city}·`), city).toBe(true);
      expect(panel?.moodTitle.endsWith('漫行'), city).toBe(true);
    }
  });

  it('hangzhou foods and intro render contract', () => {
    const panel = getHoloCityPreviewPanel('杭州');
    expect(panel?.moodTitle).toBe('杭州·西湖漫行');
    expect(panel?.intro.length).toBeGreaterThan(20);
    expect(panel?.foods.length).toBeGreaterThanOrEqual(3);
    expect(panel?.foods.every((f) => f.name && (f.shop || f.note))).toBe(true);
  });

  it('foods prefer street/shop references over vague notes', () => {
    for (const city of getHoloHomeCityNames()) {
      const panel = getHoloCityPreviewPanel(city);
      expect(
        panel?.foods.every((f) => Boolean(f.shop && f.area)),
        city,
      ).toBe(true);
    }
  });

  it('only priority 8 cities expose local photo candidates', () => {
    for (const city of MEDIA_PRIORITY_HOT_CITIES) {
      expect(getLocalPhotoCandidates(city).length, city).toBeGreaterThan(0);
    }
    expect(getLocalPhotoCandidates('黄山')).toEqual([]);
    expect(getLocalPhotoCandidates('泉州')).toEqual([]);
    expect(getLocalPhotoCandidates('不存在的城')).toEqual([]);
  });
});
