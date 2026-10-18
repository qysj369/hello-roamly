import { afterEach, describe, expect, it, vi } from 'vitest';
import { cannotProgrammaticDownload, isIosDevice, posterImageActionLabel } from '@/lib/share/deviceShare';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('deviceShare', () => {
  it('treats iPhone as unable to download blobs', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    expect(isIosDevice()).toBe(true);
    expect(cannotProgrammaticDownload()).toBe(true);
  });

  it('allows desktop Chrome to download', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
      platform: 'Win32',
      maxTouchPoints: 0,
    });
    expect(isIosDevice()).toBe(false);
    expect(cannotProgrammaticDownload()).toBe(false);
    expect(posterImageActionLabel()).toBe('复制图片');
  });

  it('labels iPhone as share image', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    expect(posterImageActionLabel()).toBe('分享图片');
  });
});
