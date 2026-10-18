import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWechatShareHint, isWechatDesktopBrowser, isWechatInAppBrowser } from '@/lib/share/wechat';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('wechat share hint', () => {
  it('asks mobile WeChat users to long-press instead of download', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) MicroMessenger/8.0.0',
    });
    expect(isWechatInAppBrowser()).toBe(true);
    expect(isWechatDesktopBrowser()).toBe(false);
    expect(getWechatShareHint()).toContain('长按');
    expect(getWechatShareHint()).toContain('朋友圈');
    expect(getWechatShareHint()).toContain('不必先下载');
  });

  it('asks desktop WeChat to drag the image into chat', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MicroMessenger/3.9.0',
    });
    expect(isWechatDesktopBrowser()).toBe(true);
    expect(getWechatShareHint()).toContain('复制图片');
    expect(getWechatShareHint()).toContain('粘贴');
  });
});
