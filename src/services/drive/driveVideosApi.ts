import type { DriveVideoListResponse, DriveVideoMeta } from '@/types/api/driveVideos';

export type CloudDriveVideoItem = DriveVideoMeta & { playUrl: string };

export async function fetchCloudDriveVideos(
  cityLabel: string,
  options?: { signal?: AbortSignal },
): Promise<CloudDriveVideoItem[]> {
  const params = new URLSearchParams({
    city: cityLabel,
    status: 'approved',
  });
  const response = await fetch(`/api/drive-videos?${params.toString()}`, {
    signal: options?.signal,
  });
  if (!response.ok) {
    throw new Error(`拉取云端投稿失败 (${response.status})`);
  }
  const payload = (await response.json()) as DriveVideoListResponse & {
    items: CloudDriveVideoItem[];
  };
  return Array.isArray(payload.items) ? payload.items : [];
}

export async function uploadCloudDriveVideo(input: {
  cityLabel: string;
  title: string;
  file: File;
}): Promise<{ item: CloudDriveVideoItem; autoApproved: boolean }> {
  const response = await fetch('/api/drive-videos', {
    method: 'POST',
    headers: {
      'Content-Type': input.file.type || 'video/mp4',
      'x-city-label': encodeURIComponent(input.cityLabel),
      'x-title': encodeURIComponent(input.title),
      'x-filename': encodeURIComponent(input.file.name),
      'x-mime': input.file.type || 'video/mp4',
    },
    body: input.file,
  });
  if (!response.ok) {
    let message = `上传失败 (${response.status})`;
    try {
      const err = (await response.json()) as { error?: string };
      if (err.error) {
        message = err.error;
      }
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return (await response.json()) as { item: CloudDriveVideoItem; autoApproved: boolean };
}

export async function moderateCloudDriveVideo(input: {
  id: string;
  action: 'approve' | 'reject';
  adminKey: string;
}): Promise<CloudDriveVideoItem> {
  const response = await fetch('/api/drive-videos/moderate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': input.adminKey,
    },
    body: JSON.stringify({ id: input.id, action: input.action }),
  });
  if (!response.ok) {
    throw new Error(`审核失败 (${response.status})`);
  }
  const payload = (await response.json()) as { item: CloudDriveVideoItem };
  return payload.item;
}
