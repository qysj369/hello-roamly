/** 小红书风格图文笔记海报 */
export type XhsPosterInput = {
  title: string;
  /** 正文（可多行逻辑由渲染器截断） */
  body: string;
  hashtags: string[];
  coverImageUrl?: string;
  /** 封面角标，默认「小红书笔记」 */
  badgeLabel?: string;
  /** 笔记卡片后的全屏配图（最多 8 张，加封面卡共最多 9 张） */
  slideImageUrls?: string[];
  /** 点点式每日图卡：有则优先生成带标题的实拍页 */
  noteSlides?: Array<{
    imageUrl: string;
    eyebrow?: string;
    title?: string;
    caption?: string;
  }>;
  /** 末尾文字要点页（适合攻略/行程） */
  summarySlide?: {
    title: string;
    lines: string[];
  };
  /** 如 @旅人昵称 */
  authorLabel?: string;
  locationLabel?: string;
  shareUrl?: string;
};

export type XhsNoteCopyText = {
  title: string;
  body: string;
  hashtags: string[];
  shareUrl?: string;
};

export type SharePosterVariant = {
  id: 'wechat' | 'xhs' | 'douyin';
  label: string;
  hint: string;
  downloadFilename: string;
  generatePoster: () => Promise<Blob>;
  /** 多图笔记（第 1 张为封面卡，其余为配图/要点页） */
  generatePosterSlides?: () => Promise<Blob[]>;
  getXhsCopyText?: () => XhsNoteCopyText;
};
