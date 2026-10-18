import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyImageBlobToClipboard } from '@/lib/share/copyImageBlob';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('copyImageBlobToClipboard', () => {
  it('writes the png blob to the clipboard', async () => {
    const write = vi.fn(async () => undefined);
    vi.stubGlobal('ClipboardItem', class ClipboardItem {
      constructor(public items: Record<string, Blob>) {}
    });
    vi.stubGlobal('navigator', { clipboard: { write } });
    const blob = new Blob(['png'], { type: 'image/png' });
    await expect(copyImageBlobToClipboard(blob)).resolves.toBe(true);
    expect(write).toHaveBeenCalledTimes(1);
  });

  it('returns false when clipboard write is unavailable', async () => {
    vi.stubGlobal('navigator', { clipboard: {} });
    await expect(copyImageBlobToClipboard(new Blob(['x'], { type: 'image/png' }))).resolves.toBe(
      false,
    );
  });
});
