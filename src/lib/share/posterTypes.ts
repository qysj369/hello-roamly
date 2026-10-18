/** 通用分享海报输入（行程 / 攻略等） */
export type SharePosterInput = {
  /** 角标，如「穷游攻略」「AI 行程」 */
  badge: string;
  title: string;
  /** 副标题一行，如「成都 · 3 天 · ¥1500」 */
  subtitle: string;
  summary: string;
  /** 行程海报可多行列出每日要点；默认 3 行以免挤掉二维码 */
  summaryMaxLines?: number;
  shareUrl: string;
  coverImageUrl?: string;
  qrCaption?: string;
  qrFooter?: string;
  /** brand = 浅米白 + 品牌绿，给首页行程海报用 */
  tone?: 'default' | 'brand';
};

export type TravelPlanPosterInput = SharePosterInput;
