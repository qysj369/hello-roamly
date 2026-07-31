export const DRIVE_VIDEO_LIMITS = {
  maxBytes: 80 * 1024 * 1024,
  maxTitleLength: 40,
  acceptMime: ['video/mp4', 'video/webm', 'video/quicktime'],
} as const;

export function validateDriveVideoFile(file: File): string | null {
  if (!file.type.startsWith('video/')) {
    return '请上传视频文件（推荐 mp4）';
  }
  const mimeOk = (DRIVE_VIDEO_LIMITS.acceptMime as readonly string[]).includes(file.type);
  const extOk = /\.(mp4|webm|mov)$/i.test(file.name);
  if (file.type && !mimeOk && !extOk) {
    return '仅支持 mp4 / webm / mov';
  }
  if (file.size > DRIVE_VIDEO_LIMITS.maxBytes) {
    return `视频超过 ${Math.round(DRIVE_VIDEO_LIMITS.maxBytes / (1024 * 1024))}MB 上限`;
  }
  return null;
}
