import { getWechatShareHint } from '@/lib/share/wechat';
import { getXhsShareHint } from '@/lib/share/xhs';
import type { SharePosterVariant, XhsNoteCopyText } from '@/lib/share/xhsPosterTypes';

export function createChinaPosterVariants(options: {
  baseFilename: string;
  buildWechat: () => Promise<Blob>;
  buildXhs: () => Promise<Blob>;
  buildXhsSlides?: () => Promise<Blob[]>;
  getXhsCopyText?: () => XhsNoteCopyText;
}): SharePosterVariant[] {
  const safe = options.baseFilename.replace(/[\\/:*?"<>|]/g, '_').slice(0, 36);

  return [
    {
      id: 'wechat',
      label: '微信海报',
      hint: getWechatShareHint(),
      downloadFilename: `${safe}-微信海报.png`,
      generatePoster: options.buildWechat,
    },
    {
      id: 'xhs',
      label: '小红书笔记',
      hint: getXhsShareHint(),
      downloadFilename: `${safe}-小红书笔记-1.png`,
      generatePoster: options.buildXhs,
      generatePosterSlides: options.buildXhsSlides,
      getXhsCopyText: options.getXhsCopyText,
    },
  ];
}

export function xhsSlideDownloadFilename(base: string, index: number): string {
  const stem = base
    .replace(/\.png$/i, '')
    .replace(/-(微信海报|小红书[^/]*)$/u, '');
  const safe = stem.replace(/[\\/:*?"<>|]/g, '_').slice(0, 32);
  return `${safe}-小红书-${index + 1}.png`;
}
