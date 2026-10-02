/**
 * 蜗牛旅行 · 产品底层定位（文案 / 规则层）
 *
 * 心智区隔：纯免费小众漫行规划工具（≠ OTA、≠ 种草带货社区）
 * 核心标签：无推销 · 本地人视角 · 近郊松弛慢游
 *
 * 【内容质量】城市弹窗四段模板（见 cityPreviewTemplate）；AI 输出约束见 AI_SLOW_TRAVEL_PROMPT_CONSTRAINTS；
 * UGC 广告过滤见 localPreflight + UGC_SOFT_AD_PATTERNS。
 * 【算力防护】AI 攻略：每分钟配额 + 每日免费上限 + 恶意刷临时拉黑（server/lib/aiRateLimit.ts）。
 * 【分阶段 / 素材】见 `@/lib/config/rolloutPhases`（阶段一内测 → 四成熟期；8 城优先实景）。
 * 【用户分层 / 心智 / 故事】见 `@/lib/config/brandMindshare`。
 *
 * ---------------------------------------------------------------------------
 * 【刚性产品底线 · 永久免费 · 禁止上锁收费】
 * 以下三项核心能力永久免费，未来付费只做增量增值，原有免费功能绝不上锁：
 * 1) 热门城市弹窗查询（含地图联动，覆盖规划中的城市场景）
 * 2) 基础 AI 漫行攻略生成
 * 3) 出行预算测算
 * ---------------------------------------------------------------------------
 */

import { AI_AUDIENCE_ADAPTATION_CONSTRAINTS } from '@/lib/config/brandMindshare';
import { SNAIL_OFFICIAL_PLAN_SYSTEM_PROMPT } from '@/lib/config/snailOfficialPlanPrompt';

/** 永久免费核心能力（文档 / 注释 / 对外口径统一引用） */
export const FREE_FOREVER_CORE_FEATURES = [
  {
    id: 'city-preview',
    label: '城市弹窗查询',
    note: '含地图双向联动与本地视角文案；不因账号/付费上锁',
  },
  {
    id: 'ai-slow-guide',
    label: '基础 AI 漫行攻略',
    note: '结构化行程与花费参考；不因账号/付费上锁',
  },
  {
    id: 'budget-estimate',
    label: '出行预算测算',
    note: '分项花费与结余参考；不因账号/付费上锁',
  },
] as const;

export const FREE_FOREVER_POLICY_LINE =
  '72 城城市弹窗查询、基础 AI 漫行攻略、出行预算测算永久免费；未来付费只做增量，原有免费功能绝不上锁收费。';

/** 与 OTA / 种草电商区隔的一句话定位 */
export const PRODUCT_DIFFERENTIATION =
  '蜗牛旅行是纯免费的小众漫行规划工具：无推销、本地人视角、近郊松弛慢游——不是订票下单平台，也不是种草带货社区。';

/** 全站禁用的电商 / 促销话术（文案与 AI 输出均禁止） */
export const BANNED_ECOMMERCE_WORDS = [
  '特惠',
  '抢购',
  '预订',
  '下单',
  '优惠券',
  '限时折扣',
  '爆款',
  '立即购买',
  '开通会员',
  '付费解锁',
] as const;

/** 推荐替换用语 */
export const PREFERRED_SLOW_TRAVEL_WORDS = [
  '漫行',
  '闲逛',
  '路线参考',
  '出行规划',
  '本地老店',
  '街巷门店',
  '松弛空档',
] as const;

/**
 * 商业入口策略：当前阶段全部关闭（不渲染促销 Banner / 邀请奖励 / 支付演示入口）。
 * 总开关：`isOpenBusiness` ← `VITE_OPEN_BUSINESS`（默认 false）。
 * 子开关仍须显式 env；总开关关闭时子开关一律无效。
 */
export const COMMERCIAL_UI_POLICY = {
  /** 侧栏广告 / 合作位：配置层保持 null */
  sideRailsDefaultOff: true,
  /** 邀请裂变：仅 VITE_INVITE_ENABLED=1，不打开支付 */
  inviteDefaultOff: true,
  /** 支付演示：须 isOpenBusiness + VITE_PAYMENT_UI_ENABLED=1 */
  paymentDefaultOff: true,
  /** 禁止弹窗广告、促销 Banner */
  forbidPromoBanner: true,
  /** 视觉：低饱和简约松弛，禁止促销霓虹 */
  visualTone: 'low-saturation-calm' as const,
  /** 商业插槽仅底部/侧边附属位；首屏/地图/攻略主体禁止 */
  slotsOnlyPeripheral: true,
} as const;

/** 城市弹窗内容结构（顺序固定，勿改组件树，只约束文案） */
export const CITY_PREVIEW_SECTION_ORDER = [
  '城市简介',
  '核心地标',
  '本地美食与街巷',
  '出行贴士',
] as const;

export const CITY_PREVIEW_CONTENT_RULES = [
  '结构固定：城市简介 → 核心地标 → 本地美食与街巷门店 → 出行贴士。',
  '优先老街、古巷、本地老店；弱化流水线网红打卡点。',
  '美食须带街区或门店参考（shop / area / note）。',
  '语气：本地人视角、松弛慢游；禁止特惠/抢购/预订/下单等电商词。',
  '兼顾三类人群：都市短途年轻人、亲子家庭、文艺中老年漫行爱好者（见 brandMindshare）。',
].join('\n');

/**
 * 注入 AI 系统提示的漫行约束（地图规划 / AI蜗牛 / 行程 JSON 共用）
 * 正文以正式固定提示词为准，不再夹带测试人设或虚拟地名示例。
 * 人群适配见 `@/lib/config/brandMindshare` → AI_AUDIENCE_ADAPTATION_CONSTRAINTS。
 */
export const AI_SLOW_TRAVEL_PROMPT_CONSTRAINTS = [
  SNAIL_OFFICIAL_PLAN_SYSTEM_PROMPT,
  AI_AUDIENCE_ADAPTATION_CONSTRAINTS,
  `【禁词】禁止出现：${BANNED_ECOMMERCE_WORDS.join('、')}；禁止营销推销与商家软广。`,
  '【免费底线】城市查询、基础攻略、预算测算对用户永久免费——正文勿暗示「开通会员才能看完整行程」。',
].join('\n\n');

/** UGC 游记：疑似商家广告软文的本地预检关键词 */
export const UGC_SOFT_AD_PATTERNS = [
  /特惠/,
  /抢购/,
  /立即下单/,
  /点击预订/,
  /优惠券/,
  /限时折扣/,
  /爆款推荐/,
  /同款低价/,
  /私聊下单/,
  /加微信.*优惠/,
  /商家合作/,
  /广告合作/,
  /推广链接/,
] as const;

export const UGC_CONTENT_RULE_LINE =
  'UGC 只保留普通人真实短途松弛出行分享；过滤商家广告软文与电商推销话术。';

/** 交互底线：核心能力不强制登录 */
export const GUEST_ACCESS_POLICY_LINE =
  '不强制登录：打开网站即可直接使用 AI 漫行攻略、城市弹窗地图、预算测算。';
