/** 从 object URL 读取 Blob（用于下载已生成的海报预览） */
export async function fetchBlobFromObjectUrl(objectUrl: string): Promise<Blob> {
  const response = await fetch(objectUrl);
  if (!response.ok) {
    throw new Error('读取海报失败');
  }
  return response.blob();
}
