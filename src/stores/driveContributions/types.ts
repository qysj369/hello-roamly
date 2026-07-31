export type DriveContributionMeta = {
  id: string;
  cityLabel: string;
  title: string;
  createdAt: number;
  byteSize: number;
  mimeType: string;
};

export type DriveContributionRecord = DriveContributionMeta & {
  /** 播放用 blob URL（会话内创建，离开需 revoke） */
  objectUrl: string;
};
