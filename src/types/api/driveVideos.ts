export type DriveVideoStatus = 'pending' | 'approved' | 'rejected';

export type DriveVideoMeta = {
  id: string;
  cityLabel: string;
  title: string;
  mimeType: string;
  byteSize: number;
  fileName: string;
  status: DriveVideoStatus;
  createdAt: string;
  updatedAt: string;
};

export type DriveVideoListResponse = {
  items: DriveVideoMeta[];
  total: number;
};
