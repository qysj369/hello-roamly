import { isWechatInAppBrowser } from '@/lib/share/wechat';
import { shouldUseNativeShare } from '@/utils/copyTextToClipboard';

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  if (/iP(hone|od|ad)/i.test(navigator.userAgent)) {
    return true;
  }
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}

/** 桌面多为复制到剪贴板，手机才走系统「分享图片」 */
export function posterImageActionLabel(): '分享图片' | '复制图片' {
  return shouldUseNativeShare() || isIosDevice() ? '分享图片' : '复制图片';
}

/** 微信 / iOS 无法可靠触发 blob 下载，只能系统分享或长按图片 */
export function cannotProgrammaticDownload(): boolean {
  return isWechatInAppBrowser() || isIosDevice();
}

export function getOpenDialog(): HTMLDialogElement | null {
  if (typeof document === 'undefined') {
    return null;
  }
  return document.querySelector('dialog[open]');
}
