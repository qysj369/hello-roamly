import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildPlaceholderGallery,
  getLocalPhotoCandidates,
  resolveCityPreviewGallery,
} from '@/data/holoCityPreviewGalleryResolve';
import { getCityPreviewGallery } from '@/data/holoCityPreviewMedia';
import { findHoloHomeCityKit } from '@/data/holoHotCityKit';

describe('city preview gallery three-tier resolve', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('jinan has local photo whitelist', () => {
    expect(getCityPreviewGallery('济南').length).toBeGreaterThanOrEqual(1);
    expect(getLocalPhotoCandidates('济南').length).toBeGreaterThanOrEqual(1);
  });

  it('chengdu priority photos win over AI companion fallback', () => {
    expect(getCityPreviewGallery('成都').length).toBeGreaterThanOrEqual(1);
    expect(getLocalPhotoCandidates('成都').length).toBeGreaterThanOrEqual(1);
    const kit = findHoloHomeCityKit('成都');
    expect(kit?.spots.every((s) => Boolean(s.photoPath))).toBe(true);
  });

  it('hangzhou priority photos load for 8-city rail', () => {
    expect(getCityPreviewGallery('杭州').length).toBeGreaterThanOrEqual(1);
    expect(getLocalPhotoCandidates('杭州').length).toBeGreaterThanOrEqual(1);
  });

  it('non-priority cities skip local photo candidates', () => {
    expect(getLocalPhotoCandidates('黄山')).toEqual([]);
    expect(getLocalPhotoCandidates('泉州')).toEqual([]);
  });

  it('placeholder gallery shows city name under each card', () => {
    const items = buildPlaceholderGallery('霞浦');
    expect(items).toHaveLength(4);
    expect(items.every((item) => item.src.startsWith('data:image/svg+xml'))).toBe(true);
    expect(items.every((item) => item.src.includes(encodeURIComponent('霞浦')))).toBe(true);
    expect(items.every((item) => item.label === '霞浦')).toBe(true);
  });

  it('resolve prefers photo → ai → placeholder', async () => {
    class FakeImage {
      naturalWidth = 0;
      naturalHeight = 0;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(value: string) {
        queueMicrotask(() => {
          if (value.startsWith('data:')) {
            this.naturalWidth = 800;
            this.naturalHeight = 600;
            this.onload?.();
            return;
          }
          if (
            value.includes('/city-kit/jinan/') ||
            value.includes('/city-kit/hangzhou/') ||
            value.includes('/city-kit/chengdu/')
          ) {
            this.naturalWidth = 800;
            this.naturalHeight = 600;
            this.onload?.();
            return;
          }
          if (value.includes('/city-ai/')) {
            this.naturalWidth = 800;
            this.naturalHeight = 600;
            this.onload?.();
            return;
          }
          this.onerror?.();
        });
      }
    }
    vi.stubGlobal('Image', FakeImage);

    const jinan = await resolveCityPreviewGallery('济南');
    expect(jinan.tier).toBe('photo');
    expect(jinan.items.length).toBeGreaterThan(0);

    const hangzhou = await resolveCityPreviewGallery('杭州');
    expect(hangzhou.tier).toBe('photo');
    expect(hangzhou.items.every((item) => item.src.includes('/city-kit/hangzhou/'))).toBe(true);

    const chengdu = await resolveCityPreviewGallery('成都');
    expect(chengdu.tier).toBe('photo');
    expect(chengdu.items.every((item) => item.src.includes('/city-kit/chengdu/'))).toBe(true);

    const niche = await resolveCityPreviewGallery('黄山');
    expect(niche.tier).toBe('placeholder');
    expect(niche.items.length).toBe(4);
    expect(niche.items.every((item) => item.src.startsWith('data:image/svg+xml'))).toBe(true);
  });
});
