/** 把海报图写入剪贴板，方便粘贴到微信 / 小红书 / 抖音 */
export async function copyImageBlobToClipboard(blob: Blob): Promise<boolean> {
  if (typeof navigator === 'undefined' || typeof ClipboardItem === 'undefined') {
    return false;
  }
  if (!navigator.clipboard?.write) {
    return false;
  }

  const type = blob.type || 'image/png';
  try {
    try {
      window.focus();
      document.querySelector('dialog[open]')?.focus();
    } catch {
      /* jsdom / embedded webview may not implement focus */
    }
    await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
    return true;
  } catch {
    if (type === 'image/png') {
      return false;
    }
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return true;
    } catch {
      return false;
    }
  }
}
