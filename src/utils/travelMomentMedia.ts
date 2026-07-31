export const TRAVEL_MOMENT_MEDIA_LIMITS = {
  maxImages: 9,
  maxImageBytes: 4 * 1024 * 1024,
  maxVideoBytes: 20 * 1024 * 1024,
  maxContentLength: 2000,
  maxTitleLength: 120,
} as const;

export type TravelMomentMediaKind = 'image' | 'video';

export type TravelMomentMediaFile = {
  id: string;
  file: File;
  previewUrl: string;
  kind: TravelMomentMediaKind;
};

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

export function validateMomentMediaFile(file: File): string | null {
  if (isImageFile(file)) {
    if (file.size > TRAVEL_MOMENT_MEDIA_LIMITS.maxImageBytes) {
      return `图片「${file.name}」超过 4MB 上限`;
    }
    return null;
  }
  if (isVideoFile(file)) {
    if (file.size > TRAVEL_MOMENT_MEDIA_LIMITS.maxVideoBytes) {
      return `视频「${file.name}」超过 20MB 上限`;
    }
    return null;
  }
  return '仅支持图片或视频文件';
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('无法读取文件'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('无法读取文件'));
    reader.readAsDataURL(file);
  });
}

export function revokeMediaPreviewUrls(files: TravelMomentMediaFile[]): void {
  for (const item of files) {
    if (item.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(item.previewUrl);
    }
  }
}

export function createMediaFileEntry(file: File): TravelMomentMediaFile {
  return {
    id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    kind: isVideoFile(file) ? 'video' : 'image',
  };
}
