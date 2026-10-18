import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  androidIntentUrl,
  isLikelyMobileShareDevice,
  openSocialApp,
  openSocialWebPage,
  resolveSocialLaunchUrl,
} from '@/lib/share/openSocialApp';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.querySelectorAll('iframe').forEach((node) => node.remove());
  document.querySelectorAll('a[aria-hidden="true"]').forEach((node) => node.remove());
});

describe('openSocialApp', () => {
  it('builds Android intent with a stay-on-page fallback, not a third-party site', () => {
    expect(androidIntentUrl('xhsdiscover://home', 'com.xingin.xhs', 'https://helloroamly.com/')).toBe(
      'intent://home#Intent;scheme=xhsdiscover;package=com.xingin.xhs;S.browser_fallback_url=https%3A%2F%2Fhelloroamly.com%2F;end',
    );
  });

  it('opens the official site only on desktop', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    openSocialWebPage('https://www.xiaohongshu.com/');
    expect(open).toHaveBeenCalledWith('https://www.xiaohongshu.com/', '_blank', 'noopener');
  });

  it('does not jump on desktop', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' });
    const assign = vi.fn();
    vi.stubGlobal('location', { assign });
    expect(isLikelyMobileShareDevice()).toBe(false);
    openSocialApp('xhsdiscover://home', 'https://www.xiaohongshu.com/', 'com.xingin.xhs', {
      text: 'copy',
    });
    expect(assign).not.toHaveBeenCalled();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('uses a tap-target link on Android instead of replacing the page', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel) AppleWebKit/537.36',
      share: async () => undefined,
    });
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    openSocialApp('weixin://', 'https://wx.qq.com/', 'com.tencent.mm', {
      text: '上海3天好友结伴',
      iosComposeUrl: 'weixin://',
      skipWebFallback: true,
    });
    expect(assign).not.toHaveBeenCalled();
    const link = document.querySelector('a[aria-hidden="true"]');
    expect(link?.getAttribute('href')).toBe(
      androidIntentUrl('weixin://', 'com.tencent.mm', window.location.href),
    );
    expect(link?.getAttribute('href')).not.toContain('wx.qq.com');
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('does not open a third-party website after launching Xiaohongshu', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel) AppleWebKit/537.36',
      share: async () => undefined,
    });
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    openSocialApp('xhsdiscover://home', 'https://www.xiaohongshu.com/', 'com.xingin.xhs', {
      text: 'copy',
      iosComposeUrl: 'xhsdiscover://post',
    });
    expect(open).not.toHaveBeenCalled();
    const link = document.querySelector('a[aria-hidden="true"]');
    expect(link?.getAttribute('href')).not.toContain('xiaohongshu.com');
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('keeps desktop UA on a narrow viewport as PC, and iPhone landscape as mobile', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 400 });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      platform: 'Win32',
      maxTouchPoints: 0,
    });
    expect(isLikelyMobileShareDevice()).toBe(false);

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 844 });
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    expect(isLikelyMobileShareDevice()).toBe(true);
  });
});
