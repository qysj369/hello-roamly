/** 弹窗顶层里挂到 body 的下载常被浏览器丢掉，优先挂到当前 dialog */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  const host = document.querySelector('dialog[open]') ?? document.body;
  host.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 依次下载多张图片（避免浏览器拦截批量点击） */
export async function downloadBlobsSequential(
  blobs: Blob[],
  filenameForIndex: (index: number, total: number) => string,
  delayMs = 280,
): Promise<void> {
  for (let index = 0; index < blobs.length; index += 1) {
    downloadBlob(blobs[index]!, filenameForIndex(index, blobs.length));
    if (index < blobs.length - 1) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, delayMs);
      });
    }
  }
}
