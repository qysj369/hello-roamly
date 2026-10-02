import { isIosDevice } from '@/lib/share/deviceShare';
import { shouldUseNativeShare } from '@/utils/copyTextToClipboard';

export type ShareImageResult = 'shared' | 'cancelled' | 'unsupported';

export function blobToShareFile(blob: Blob, filename: string): File {
  const type = blob.type || 'image/png';
  return new File([blob], filename, { type });
}

/** 手机 / iPad 走文件分享；Windows 桌面带图常变成另存为 */
export function canShareImageFiles(files: File[]): boolean {
  if (files.length === 0 || (!shouldUseNativeShare() && !isIosDevice())) {
    return false;
  }
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return false;
  }
  if (typeof navigator.canShare !== 'function') {
    return false;
  }
  try {
    return navigator.canShare({ files });
  } catch {
    return false;
  }
}

export async function shareImageFiles(options: {
  files: File[];
  title: string;
  text?: string;
  url?: string;
}): Promise<ShareImageResult> {
  const files = options.files.filter(Boolean);
  if (!canShareImageFiles(files)) {
    return 'unsupported';
  }

  const tryShare = async (data: ShareData): Promise<ShareImageResult> => {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled';
      }
      return 'unsupported';
    }
  };

  const withMeta: ShareData = { files, title: options.title };
  if (options.text?.trim()) {
    withMeta.text = options.text.trim();
  }
  if (options.url?.trim()) {
    withMeta.url = options.url.trim();
  }

  const first = await tryShare(withMeta);
  if (first !== 'unsupported') {
    return first;
  }
  return tryShare({ files, title: options.title });
}
