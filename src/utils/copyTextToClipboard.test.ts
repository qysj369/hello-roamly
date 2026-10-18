import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyTextToClipboardSync, copyVisibleText } from '@/utils/copyTextToClipboard';

describe('copyTextToClipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('copies from a visible textarea, not a clipped ghost', () => {
    const exec = vi.fn(() => true);
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: exec,
    });
    const field = document.createElement('textarea');
    field.value = '上海博物馆 · 沈大成';
    document.body.appendChild(field);

    expect(copyVisibleText(field)).toBe('copied');
    expect(exec).toHaveBeenCalledWith('copy');
    expect(field.value).toBe('上海博物馆 · 沈大成');
  });

  it('uses an on-screen contenteditable host instead of a 2px hidden box', () => {
    const exec = vi.fn(() => {
      const live = document.querySelector('[contenteditable="true"]');
      expect(live).toBeTruthy();
      expect((live as HTMLElement).style.width).not.toBe('2px');
      return true;
    });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: exec,
    });
    expect(copyTextToClipboardSync('完整每日行程')).toBe('copied');
    expect(document.querySelector('[contenteditable="true"]')).toBeNull();
  });
});
