export type CopyTextResult = 'copied' | 'failed';

export function shouldUseNativeShare(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return false;
  }
  // 桌面端（尤其 Windows）的 Web Share 对纯文本不稳定，容易闪退；移动端再用系统分享。
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

/** 从页面上看得见的输入框复制。隐藏 1px 框会报成功但剪贴板仍是空的。 */
export function copyVisibleText(node: HTMLTextAreaElement | HTMLInputElement): CopyTextResult {
  const text = node.value.trim();
  if (!text || typeof window === 'undefined') {
    return 'failed';
  }
  const wasReadOnly = node.readOnly;
  try {
    node.readOnly = false;
    node.focus();
    node.select();
    node.setSelectionRange(0, node.value.length);
    if (document.execCommand('copy')) {
      return 'copied';
    }
  } catch {
    /* fall through */
  } finally {
    node.readOnly = wasReadOnly;
  }
  return copyTextToClipboardSync(text);
}

/** 同步复制 — 在用户点击瞬间执行，避免 async 导致剪贴板权限丢失 */
export function copyTextToClipboardSync(text: string): CopyTextResult {
  const trimmed = text.trim();
  if (!trimmed || typeof window === 'undefined') {
    return 'failed';
  }

  const selection = typeof window.getSelection === 'function' ? window.getSelection() : null;
  const saved: Range[] = [];
  if (selection) {
    for (let index = 0; index < selection.rangeCount; index += 1) {
      saved.push(selection.getRangeAt(index));
    }
  }

  const host = document.createElement('div');
  host.setAttribute('contenteditable', 'true');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:min(90vw, 640px)',
    'height:auto',
    'max-height:30vh',
    'opacity:0.01',
    'z-index:2147483647',
    'white-space:pre-wrap',
    'overflow:hidden',
    'font-size:16px',
    'pointer-events:none',
  ].join(';');
  host.textContent = trimmed;
  document.body.appendChild(host);

  try {
    const range = document.createRange();
    range.selectNodeContents(host);
    selection?.removeAllRanges();
    selection?.addRange(range);
    host.focus();
    if (document.execCommand('copy')) {
      return 'copied';
    }
  } catch {
    /* fall through */
  } finally {
    document.body.removeChild(host);
    selection?.removeAllRanges();
    for (const range of saved) {
      selection?.addRange(range);
    }
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
