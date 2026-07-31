/** 释放 createObjectURL 创建的预览地址 */
export function revokeObjectUrls(urls: string[]): void {
  urls.forEach((url) => {
    URL.revokeObjectURL(url);
  });
}

/** 将 Blob 列表转为 object URL（调用方负责 revoke） */
export function createObjectUrlsFromBlobs(blobs: Blob[]): string[] {
  return blobs.map((blob) => URL.createObjectURL(blob));
}
