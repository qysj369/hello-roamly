import { getDouyinShareHint } from '@/lib/share/douyin';
import { getWechatShareHint } from '@/lib/share/wechat';
import { getXhsShareHint } from '@/lib/share/xhs';
import type { SharePosterVariant, XhsNoteCopyText } from '@/lib/share/xhsPosterTypes';
import type { ShareChannel } from '@/types/domain/shareAnalytics';

export function shareChannelFromPosterVariant(
  id: SharePosterVariant['id'] | undefined,
): ShareChannel {
  if (id === 'xhs') return 'xhs';
  if (id === 'douyin') return 'douyin';
  return 'wechat';
}

export function createChinaPosterVariants(options: {
  baseFilename: string;
  buildWechat: () => Promise<Blob>;
  buildXhs: () => Promise<Blob>;
  buildXhsSlides?: () => Promise<Blob[]>;
  buildDouyin?: () => Promise<Blob>;
  getXhsCopyText?: () => XhsNoteCopyText;
  getDouyinCopyText?: () => XhsNoteCopyText;
}): SharePosterVariant[] {
  const safe = options.baseFilename.replace(/[\\/:*?"<>|]/g, '_').slice(0, 36);
  const douyinCopy = options.getDouyinCopyText ?? options.getXhsCopyText;

  return [
    {
      id: 'wechat',
      label: '朋友圈',
      hint: getWechatShareHint(),
      downloadFilename: `${safe}-微信海报.png`,
      generatePoster: options.buildWechat,
    },
    {
      id: 'xhs',
      label: '小红书',
      hint: getXhsShareHint(),
      downloadFilename: `${safe}-小红书笔记-1.png`,
      generatePoster: options.buildXhs,
      generatePosterSlides: options.buildXhsSlides,
      getXhsCopyText: options.getXhsCopyText,
    },
    {
      id: 'douyin',
      label: '抖音',
      hint: getDouyinShareHint(),
      downloadFilename: `${safe}-抖音封面.png`,
      generatePoster: options.buildDouyin ?? options.buildWechat,
      getXhsCopyText: douyinCopy,
    },
  ];
}

export function xhsSlideDownloadFilename(base: string, index: number): string {
  const stem = base
    .replace(/\.png$/i, '')
    .replace(/-(微信海报|小红书[^/]*|抖音封面)$/u, '');
  const safe = stem.replace(/[\\/:*?"<>|]/g, '_').slice(0, 32);
  return `${safe}-小红书-${index + 1}.png`;
}
