import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDouyinShareHint } from '@/lib/share/douyin';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('douyin share hint', () => {
  it('asks desktop users to copy the image, matching the button label', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
      platform: 'Win32',
      maxTouchPoints: 0,
    });
    expect(getDouyinShareHint()).toContain('复制图片');
    expect(getDouyinShareHint()).not.toContain('「分享图片」');
  });

  it('asks WeChat in-app users to long-press instead of tapping share', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) MicroMessenger/8.0.0',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    expect(getDouyinShareHint()).toContain('长按');
    expect(getDouyinShareHint()).toContain('抖音');
    expect(getDouyinShareHint()).not.toContain('「分享图片」');
  });
});
