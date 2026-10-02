/** 是否微信内置浏览器 */
export function isWechatInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /MicroMessenger/i.test(navigator.userAgent);
}

/** 微信电脑客户端内置浏览器（下载会被拦截成「打开 / 另存为」） */
export function isWechatDesktopBrowser(): boolean {
  if (!isWechatInAppBrowser() || typeof navigator === 'undefined') {
    return false;
  }
  return !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** 中国版社交分享：微信里长按发图，不引导先下载 */
export function getWechatShareHint(): string {
  if (isWechatDesktopBrowser()) {
    return '点「复制图片」后到微信聊天里粘贴，或把上方图片拖进对话框；不要点下载';
  }
  if (isWechatInAppBrowser()) {
    return '长按上方图片，发到朋友圈或发给好友即可，不必先下载';
  }
  return '电脑点「复制图片」粘贴到微信；手机可点「分享图片」或长按发朋友圈';
}
