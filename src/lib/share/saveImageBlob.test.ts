import { afterEach, describe, expect, it, vi } from 'vitest';
import { saveImageBlob } from '@/lib/share/saveImageBlob';

const downloadBlob = vi.fn();

vi.mock('@/lib/share/download', () => ({
  downloadBlob: (...args: unknown[]) => downloadBlob(...args),
}));

afterEach(() => {
  downloadBlob.mockReset();
  vi.unstubAllGlobals();
});

describe('saveImageBlob', () => {
  it('does not trigger a download inside WeChat', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MicroMessenger/3.9.0',
      platform: 'Win32',
      maxTouchPoints: 0,
    });
    await expect(
      saveImageBlob(new Blob(['png'], { type: 'image/png' }), '杭州3天好友结伴-微信海报.png'),
    ).resolves.toBe('needs-long-press');
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it('does not trigger a download on iPhone', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      platform: 'iPhone',
      maxTouchPoints: 5,
    });
    await expect(
      saveImageBlob(new Blob(['png'], { type: 'image/png' }), 'poster.png'),
    ).resolves.toBe('needs-long-press');
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it('opens the computer folder picker on desktop Chrome', async () => {
    const close = vi.fn();
    const write = vi.fn();
    const picker = vi.fn(async () => ({
      createWritable: async () => ({ write, close }),
    }));
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
      platform: 'Win32',
      maxTouchPoints: 0,
    });
    vi.stubGlobal('showSaveFilePicker', picker);
    await expect(
      saveImageBlob(new Blob(['png'], { type: 'image/png' }), '上海3天情侣-微信海报.png'),
    ).resolves.toBe('saved');
    expect(picker).toHaveBeenCalledWith(
      expect.objectContaining({
        suggestedName: '上海3天情侣-微信海报.png',
        startIn: 'downloads',
      }),
    );
    expect(write).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(downloadBlob).not.toHaveBeenCalled();
  });

  it('falls back to a regular download when the folder picker is missing', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
      platform: 'Win32',
      maxTouchPoints: 0,
    });
    await expect(
      saveImageBlob(new Blob(['png'], { type: 'image/png' }), 'poster.png'),
    ).resolves.toBe('saved');
    expect(downloadBlob).toHaveBeenCalledTimes(1);
  });
});
