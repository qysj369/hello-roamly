/**
 * 商业扩展字段（城市 / 景点 / 美食 / 攻略等共用）
 * 字段为空或未配置 → 不渲染任何商业 UI。
 * 消费方必须经 `@/lib/business` 判断；禁止在地图 / AI 核心流程硬编码。
 */
export type BusinessExtensionFields = {
  /** 分销跳转链接 */
  distributeLink?: string | null;
  /** 付费路书 ID */
  paidGuideId?: string | null;
  /** 合作活动标签 */
  activityTag?: string | null;
  /** 是否会员专属（仅商业开且会员链路叠加；不影响免费基座） */
  memberOnly?: boolean | null;
};

/** 可挂载商业扩展的实体类型 */
export type BusinessExtensibleKind = 'city' | 'spot' | 'food' | 'guide';
