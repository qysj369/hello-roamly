import { cannotProgrammaticDownload } from '@/lib/share/deviceShare';
import { downloadBlob } from '@/lib/share/download';
import { blobToShareFile, canShareImageFiles, shareImageFiles } from '@/lib/share/shareImageFiles';
import { isWechatInAppBrowser } from '@/lib/share/wechat';

export type SaveImageBlobResult = 'saved' | 'cancelled' | 'needs-long-press' | 'failed';

type SaveFilePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName?: string;
    startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    types?: Array<{ description?: string; accept: Record<string, string[]> }>;
  }) => Promise<{
    createWritable: () => Promise<{
      write: (data: Blob) => Promise<void>;
      close: () => Promise<void>;
    }>;
  }>;
};

function suggestedPngType() {
  return {
    description: 'PNG 图片',
    accept: { 'image/png': ['.png'] },
  };
}

/**
 * 保存海报。微信 / iOS 不能靠 blob 下载，优先系统分享（相册里的「存储图像」），
 * 否则让调用方出示大图并提示长按。
 */
export async function saveImageBlob(blob: Blob, filename: string): Promise<SaveImageBlobResult> {
  if (cannotProgrammaticDownload() || isWechatInAppBrowser()) {
    const file = blobToShareFile(blob, filename);
    if (canShareImageFiles([file])) {
      const shared = await shareImageFiles({ files: [file], title: filename });
      if (shared === 'shared') {
        return 'saved';
      }
      if (shared === 'cancelled') {
        return 'cancelled';
      }
    }
    return 'needs-long-press';
  }

  const picker = typeof window !== 'undefined' ? (window as SaveFilePickerWindow).showSaveFilePicker : undefined;
  if (typeof picker === 'function') {
    try {
      const handle = await picker({
        suggestedName: filename,
        startIn: 'downloads',
        types: [suggestedPngType()],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return 'saved';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled';
      }
    }
  }

  try {
    downloadBlob(blob, filename);
    return 'saved';
  } catch {
    return 'failed';
  }
}
