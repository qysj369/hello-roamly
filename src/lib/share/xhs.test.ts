import { afterEach, describe, expect, it, vi } from 'vitest';
import { getXhsShareHint } from '@/lib/share/xhs';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('xhs share hint', () => {
  it('uses the desktop copy-image label', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
      platform: 'Win32',
      maxTouchPoints: 0,
    });
    expect(getXhsShareHint()).toContain('复制图片');
    expect(getXhsShareHint(3)).toContain('共 3 张图');
    expect(getXhsShareHint(3)).toContain('复制图片');
  });
});
