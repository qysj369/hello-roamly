import { getWechatShareHint } from '@/lib/share/wechat';
import type { SharePosterVariant } from '@/lib/share/xhsPosterTypes';

export type ResolveSharePosterVariantsInput = {
  posterVariants?: SharePosterVariant[];
  generatePoster?: () => Promise<Blob>;
  downloadFilename: string;
};

/** 合并 props，得到当前可用的海报样式列表 */
export function resolveSharePosterVariants(
  input: ResolveSharePosterVariantsInput,
): SharePosterVariant[] {
  if (input.posterVariants && input.posterVariants.length > 0) {
    return input.posterVariants;
  }
  if (input.generatePoster) {
    return [
      {
        id: 'wechat',
        label: '微信海报',
        hint: getWechatShareHint(),
        downloadFilename: input.downloadFilename,
        generatePoster: input.generatePoster,
      },
    ];
  }
  return [];
}
