/** 是否微信内置浏览器 */
export function isWechatInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /MicroMessenger/i.test(navigator.userAgent);
}

/** 中国版社交分享：优先引导保存海报到相册后发朋友圈 */
export function getWechatShareHint(): string {
  if (isWechatInAppBrowser()) {
    return '长按图片保存到相册，即可分享到朋友圈或发送给好友';
  }
  return '保存图片后，在微信中扫码或发送给好友';
}
