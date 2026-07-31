/** 小红书风格分享引导文案 */
export function getXhsShareHint(slideCount = 1): string {
  if (slideCount > 1) {
    return `共 ${slideCount} 张图：第 1 张为封面笔记，其余为配图/要点。可「保存全部」后按顺序发到小红书`;
  }
  return '保存图片后，可发布到小红书；建议「复制文案」粘贴标题与正文';
}
