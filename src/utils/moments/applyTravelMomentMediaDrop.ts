import {
  createMediaFileEntry,
  revokeMediaPreviewUrls,
  TRAVEL_MOMENT_MEDIA_LIMITS,
  validateMomentMediaFile,
  type TravelMomentMediaFile,
} from '@/utils/travelMomentMedia';

export type ApplyTravelMomentMediaDropResult =
  | { ok: true; files: TravelMomentMediaFile[] }
  | { ok: false; error: string; revokeEntries?: TravelMomentMediaFile[] };

/**
 * 瞬间媒体规则（产品约束，非技术限制）：
 * - 单条瞬间仅 1 个视频或若干图片，不可混传（小红书式）
 * - 新选视频会替换已有列表；已有视频时禁止再叠图片
 */
export function applyTravelMomentMediaDrop(
  prev: TravelMomentMediaFile[],
  accepted: File[],
): ApplyTravelMomentMediaDropResult {
  if (accepted.length === 0) {
    return { ok: true, files: prev };
  }

  const entries: TravelMomentMediaFile[] = [];
  for (const file of accepted) {
    const validationError = validateMomentMediaFile(file);
    if (validationError) {
      return { ok: false, error: validationError };
    }
    entries.push(createMediaFileEntry(file));
  }

  const incomingVideo = entries.find((item) => item.kind === 'video');
  const incomingImages = entries.filter((item) => item.kind === 'image');

  if (incomingVideo && incomingImages.length > 0) {
    revokeMediaPreviewUrls(entries);
    return { ok: false, error: '请分次上传：单次仅支持 1 个视频，或若干图片' };
  }

  if (incomingVideo) {
    revokeMediaPreviewUrls(prev);
    return { ok: true, files: [incomingVideo] };
  }

  if (prev.some((item) => item.kind === 'video')) {
    revokeMediaPreviewUrls(entries);
    return { ok: false, error: '已选择视频，无法再添加图片' };
  }

  const merged = [...prev, ...incomingImages];
  if (merged.length > TRAVEL_MOMENT_MEDIA_LIMITS.maxImages) {
    revokeMediaPreviewUrls(incomingImages);
    return { ok: false, error: `最多上传 ${TRAVEL_MOMENT_MEDIA_LIMITS.maxImages} 张图片` };
  }

  return { ok: true, files: merged };
}
