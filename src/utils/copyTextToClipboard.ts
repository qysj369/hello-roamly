export type CopyTextResult = 'copied' | 'failed';

export function shouldUseNativeShare(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return false;
  }
  // 桌面端（尤其 Windows）的 Web Share 对纯文本不稳定，容易闪退；移动端再用系统分享。
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

/** 同步复制 — 在用户点击瞬间执行，避免 async 导致剪贴板权限丢失 */
export function copyTextToClipboardSync(text: string): CopyTextResult {
  const trimmed = text.trim();
  if (!trimmed || typeof window === 'undefined') {
    return 'failed';
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = trimmed;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2px';
    textarea.style.height = '2px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, trimmed.length);
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (copied) {
      return 'copied';
    }
  } catch {
    // fallback below
  }

  return 'failed';
}

/** 复制文本 — clipboard API 失败时回退到 textarea */
export async function copyTextToClipboard(text: string): Promise<CopyTextResult> {
  const trimmed = text.trim();
  if (!trimmed || typeof window === 'undefined') {
    return 'failed';
  }

  const syncResult = copyTextToClipboardSync(trimmed);
  if (syncResult === 'copied') {
    return 'copied';
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(trimmed);
      return 'copied';
    }
  } catch {
    // already tried sync
  }

  return 'failed';
}

export type ShareTextResult = 'shared' | 'copied' | 'cancelled' | 'failed';

/** 移动端优先系统分享；桌面端直接复制，避免 Windows 共享面板一闪而过 */
export async function sharePlainText(text: string, title: string): Promise<ShareTextResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return 'failed';
  }

  if (shouldUseNativeShare()) {
    try {
      await navigator.share({ title, text: trimmed });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled';
      }
    }
  }

  const copied = await copyTextToClipboard(trimmed);
  return copied === 'copied' ? 'copied' : 'failed';
}
