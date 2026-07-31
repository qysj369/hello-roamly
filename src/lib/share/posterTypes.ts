/** 通用分享海报输入（行程 / 攻略等） */
export type SharePosterInput = {
  /** 角标，如「穷游攻略」「AI 行程」 */
  badge: string;
  title: string;
  /** 副标题一行，如「成都 · 3 天 · ¥1500」 */
  subtitle: string;
  summary: string;
  shareUrl: string;
  coverImageUrl?: string;
  qrCaption?: string;
  qrFooter?: string;
};

export type TravelPlanPosterInput = SharePosterInput;
