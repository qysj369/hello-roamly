import { posterImageActionLabel } from '@/lib/share/deviceShare';

/** 小红书风格分享引导文案 */
export function getXhsShareHint(slideCount = 1): string {
  const action = posterImageActionLabel();
  if (slideCount > 1) {
    return `共 ${slideCount} 张图：点「${action}」发给小红书，或「复制文案」后按顺序贴图`;
  }
  return `点「${action}」发到小红书；建议同时「复制文案」粘贴标题与正文`;
}
