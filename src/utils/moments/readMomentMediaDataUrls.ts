import { readFileAsDataUrl, type TravelMomentMediaFile } from '@/utils/travelMomentMedia';

export type MomentMediaDataUrls = {
  imageUrls: string[];
  videoUrl?: string;
};

/** 将本地媒体文件读为 data URL，供演示 store 持久化 */
// TODO: 改为先上传 OSS/CDN 拿 HTTPS URL，避免 data URL 撑爆 localStorage
export async function readMomentMediaDataUrls(
  mediaFiles: TravelMomentMediaFile[],
): Promise<MomentMediaDataUrls> {
  const imageUrls: string[] = [];
  let videoUrl: string | undefined;

  for (const item of mediaFiles) {
    const dataUrl = await readFileAsDataUrl(item.file);
    if (item.kind === 'video') {
      videoUrl = dataUrl;
    } else {
      imageUrls.push(dataUrl);
    }
  }

  return { imageUrls, videoUrl };
}
