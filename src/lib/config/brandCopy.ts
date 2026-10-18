/**
 * 「蜗牛旅行」品牌文案体系
 * 首页头区：品牌名 → 精神口号 → 功能描述
 *
 * 定位：纯免费小众漫行规划工具（无推销 · 本地人视角 · 近郊松弛慢游）
 * 刚性底线见 `@/lib/config/productPositioning`：城市弹窗 / 基础 AI 攻略 / 预算测算永久免费。
 * 用户分层 / 心智触点 / 品牌故事见 `@/lib/config/brandMindshare`。
 */

import {
  FREE_FOREVER_POLICY_LINE,
  PRODUCT_DIFFERENTIATION,
} from '@/lib/config/productPositioning';
import {
  BRAND_CORE_VALUES,
  BRAND_MINDSHARE_LINE,
  BRAND_STORY_BODY,
  BRAND_STORY_TITLE,
} from '@/lib/config/brandMindshare';

/** 品牌中文名 */
export const BRAND_NAME = '蜗牛旅行';

/** 品牌英文名（SEO、对外介绍） */
export const BRAND_NAME_EN = 'HelloRoamly';

/** 官网域名（不含协议） */
export const BRAND_DOMAIN = 'helloroamly.com';

/** 浏览器标签 / SEO 标题后缀 */
export const APP_TITLE_SUFFIX = `${BRAND_NAME} | ${BRAND_NAME_EN}`;

/** 品牌展示（含符号） */
export const BRAND_MARK = `🐌 ${BRAND_NAME}`;

/** 精神口号（顶栏副标题 · 首页标语） */
export const BRAND_SPIRIT_SLOGAN = '极简于心，慢行致远';

/**
 * 品牌定稿锁排文案（阶段1静态）：蜗牛旅行｜极简于心
 * 全角分隔符｜；勿改字序与分隔符
 */
export const BRAND_LOCKUP = `${BRAND_NAME}｜极简于心`;

/** @deprecated 使用 BRAND_SPIRIT_SLOGAN */
export const BRAND_SLOGAN = BRAND_SPIRIT_SLOGAN;

/** 功能描述（直白告诉用户这是什么） */
export const BRAND_FUNCTION_DESC = BRAND_MINDSHARE_LINE;

/** @deprecated 使用 BRAND_FUNCTION_DESC */
export const BRAND_VALUE_PROPOSITION = BRAND_FUNCTION_DESC;

/** 品类定位（地图页 / SEO 等） */
export const BRAND_POSITIONING = '纯免费小众漫行规划工具';

/** 与 OTA / 种草社区的区隔口径 */
export const BRAND_DIFFERENTIATION = PRODUCT_DIFFERENTIATION;

/** 永久免费政策一句 */
export const BRAND_FREE_FOREVER_LINE = FREE_FOREVER_POLICY_LINE;

/** 底层能力一句话（能力条 / 页脚） */
export const BRAND_PILLARS_LINE =
  '城市弹窗查询 · AI 漫行攻略 · 出行预算测算 — 核心能力永久免费';

export const BRAND_PILLARS = [
  {
    title: '城市弹窗与地图',
    desc: '本地视角简介、老街古巷地标、街巷门店与出行贴士，打开即用',
  },
  {
    title: 'AI 漫行攻略',
    desc: '松弛节奏的路线参考：预留闲逛与近郊轻体验，不推销、不带货',
  },
  {
    title: '出行预算测算',
    desc: '交通餐饮住宿分项参考，帮你把花费花在刀刃上',
  },
] as const;

/** 页脚「关于蜗牛」故事标题 / 正文（与 brandMindshare 同源） */
export const BRAND_ABOUT_SNAIL_TITLE = BRAND_STORY_TITLE;
export const BRAND_ABOUT_SNAIL_BODY = BRAND_STORY_BODY;
export const BRAND_ABOUT_VALUES = BRAND_CORE_VALUES;

export {
  CURRENT_ROLLOUT_PHASE as BRAND_ROLLOUT_PHASE,
  MEDIA_TIER_STRATEGY_DOC as BRAND_MEDIA_TIER_STRATEGY_DOC,
  ROLLOUT_STRATEGY_DOC as BRAND_ROLLOUT_STRATEGY_DOC,
} from '@/lib/config/rolloutPhases';

export {
  BRAND_AUDIENCE_SEGMENTS,
  BRAND_MINDSHARE_LINE,
  BRAND_SHARE_TITLE_TAG,
  withBrandShareTitle,
} from '@/lib/config/brandMindshare';
