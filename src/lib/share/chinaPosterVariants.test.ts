import { describe, expect, it } from 'vitest';
import {
  createChinaPosterVariants,
  shareChannelFromPosterVariant,
} from '@/lib/share/chinaPosterVariants';

describe('chinaPosterVariants', () => {
  it('includes moments, xhs and douyin tabs', () => {
    const variants = createChinaPosterVariants({
      baseFilename: '杭州3天',
      buildWechat: async () => new Blob(),
      buildXhs: async () => new Blob(),
    });
    expect(variants.map((item) => item.id)).toEqual(['wechat', 'xhs', 'douyin']);
    expect(variants[0]?.label).toBe('朋友圈');
    expect(variants[2]?.label).toBe('抖音');
    expect(variants[2]?.downloadFilename).toContain('抖音封面');
  });

  it('maps poster tabs to analytics channels', () => {
    expect(shareChannelFromPosterVariant('wechat')).toBe('wechat');
    expect(shareChannelFromPosterVariant('xhs')).toBe('xhs');
    expect(shareChannelFromPosterVariant('douyin')).toBe('douyin');
  });
});
