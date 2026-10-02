import { describe, expect, it } from 'vitest';
import { SHANGHAI_SHARE_PHOTO_KIT } from '@/data/shanghaiSharePhotoKit';

describe('shanghaiSharePhotoKit', () => {
  it('covers the Shanghai pilot spots, food and vibe names with share frames', () => {
    const names = SHANGHAI_SHARE_PHOTO_KIT.map((item) => item.name);
    for (const name of [
      '上海博物馆',
      '外滩滨江',
      '武康路',
      '豫园',
      '新天地',
      '沈大成点心',
      '本帮菜馆',
      '咖啡馆',
      '梧桐老街',
      '江边日落',
      '老弄堂街巷',
    ]) {
      expect(names).toContain(name);
    }
    expect(SHANGHAI_SHARE_PHOTO_KIT.every((item) => item.city === '上海')).toBe(true);
    expect(
      SHANGHAI_SHARE_PHOTO_KIT.every((item) =>
        item.frames.includes('xhs') && item.frames.includes('douyin') && item.frames.includes('wechat'),
      ),
    ).toBe(true);
    expect(SHANGHAI_SHARE_PHOTO_KIT.some((item) => item.kind === 'spot')).toBe(true);
    expect(SHANGHAI_SHARE_PHOTO_KIT.some((item) => item.kind === 'food')).toBe(true);
    expect(SHANGHAI_SHARE_PHOTO_KIT.some((item) => item.kind === 'vibe')).toBe(true);
    expect(SHANGHAI_SHARE_PHOTO_KIT.find((item) => item.id === 'sh-shendacheng')?.photoPath).toContain(
      'shendacheng',
    );
  });
});
