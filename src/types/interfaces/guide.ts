import type { AiSnailGuideResult } from '@/types/domain/aiSnailGuide';
import type { UserId } from '@/types/domain/user/userId';
export type GuideKind = 'template' | 'structured';

/** 列表/瀑布流卡片展示字段 */
export type GuideListCardMeta = {
  coverImageUrl?: string;
  excerpt: string;
  authorName: string;
  /** 例：西安 · 3天 · ¥1500 */
  metaTag: string;
};

/**
 * 攻略实体（GET /guides、GET /guides/:id 列表项与详情共用）。
 * 用户发布的结构化攻略在详情接口携带 `structured` 三大板块字段。
 */
export interface Guide {
  id: string;
  city: string;
  title: string;
  budget: string;
  days: string;
  tags: string[];
  /** ISO 8601 */
  updatedAt: string;
  kind?: GuideKind;
  structured?: AiSnailGuideResult;
  aiAssisted?: boolean;
  authorId?: UserId;
  publishedAt?: string;
  /** 首页瀑布流等列表场景可选携带 */
  listCard?: GuideListCardMeta;
}