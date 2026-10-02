import { posterImageActionLabel } from '@/lib/share/deviceShare';
import { isWechatInAppBrowser } from '@/lib/share/wechat';

/** 抖音封面分享引导：不接官方 SDK，走系统分享 / 保存后发布 */
export function getDouyinShareHint(): string {
  if (isWechatInAppBrowser()) {
    return '长按上方图片保存到相册，再打开抖音发布';
  }
  const action = posterImageActionLabel();
  if (action === '复制图片') {
    return '点「复制图片」后到抖音发图粘贴；也可先「保存图片」再打开抖音';
  }
  return '点「分享图片」选抖音；也可先保存图片，再打开抖音发布';
}
