import type { SharePosterVariant } from '@/lib/share/xhsPosterTypes';

/** 按样式生成海报 Blob（单张或多张小红书轮播） */
export async function generatePosterBlobs(activeVariant: SharePosterVariant): Promise<Blob[]> {
  if (activeVariant.id === 'xhs' && activeVariant.generatePosterSlides) {
    return activeVariant.generatePosterSlides();
  }
  return [await activeVariant.generatePoster()];
}
