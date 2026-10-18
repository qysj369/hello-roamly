import { afterEach, describe, expect, it, vi } from 'vitest';
import { blobToShareFile, canShareImageFiles, shareImageFiles } from '@/lib/share/shareImageFiles';

function mockMobilePointer() {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockReturnValue({ matches: true }),
  });
}

function mockDesktopPointer() {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockReturnValue({ matches: false }),
  });
}

afterEach(() => {
  mockDesktopPointer();
  vi.unstubAllGlobals();
});

describe('shareImageFiles', () => {
  it('treats iPhone as file-share capable even without a coarse pointer', () => {
    mockDesktopPointer();
    const file = blobToShareFile(new Blob(['x'], { type: 'image/png' }), 'a.png');
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      platform: 'iPhone',
      maxTouchPoints: 5,
      canShare: () => true,
      share: async () => undefined,
    });
    expect(canShareImageFiles([file])).toBe(true);
  });

  it('does not treat desktop as file-share capable', () => {
    mockDesktopPointer();
    const file = blobToShareFile(new Blob(['x'], { type: 'image/png' }), 'a.png');
    expect(canShareImageFiles([file])).toBe(false);
  });

  it('shares files on mobile when canShare allows it', async () => {
    mockMobilePointer();
    const share = vi.fn(async () => undefined);
    const file = blobToShareFile(new Blob(['x'], { type: 'image/png' }), 'a.png');
    vi.stubGlobal('navigator', {
      share,
      canShare: () => true,
    });
    await expect(
      shareImageFiles({ files: [file], title: '海报', text: '行程' }),
    ).resolves.toBe('shared');
    expect(share).toHaveBeenCalled();
  });

  it('returns cancelled when the user dismisses the sheet', async () => {
    mockMobilePointer();
    const file = blobToShareFile(new Blob(['x'], { type: 'image/png' }), 'a.png');
    vi.stubGlobal('navigator', {
      canShare: () => true,
      share: vi.fn(async () => {
        throw new DOMException('dismissed', 'AbortError');
      }),
    });
    await expect(shareImageFiles({ files: [file], title: '海报' })).resolves.toBe('cancelled');
  });
});
