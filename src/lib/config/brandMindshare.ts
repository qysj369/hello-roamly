/**
 * 蜗牛旅行 · 三大品牌议题落地（文案 / 注释 / 站内引导层）
 *
 * ---------------------------------------------------------------------------
 * 【落地1 · 目标用户分层】都市短途年轻人 / 亲子家庭 / 文艺中老年漫行爱好者
 * 【落地2 · 心智触点】全站统一「纯免费小众漫行」话术，无 OTA 推销感
 * 【落地3 · 品牌故事与价值观】松弛优先 · 真实在地 · 纯粹免费 · 轻量漫行
 * ---------------------------------------------------------------------------
 *
 * 约束：本文件只承载文案与规则常量；禁止改动攻略流式管道、弹窗交互、商业插槽逻辑。
 * AI 人群适配仅通过提示词约束注入（见 AI_AUDIENCE_ADAPTATION_CONSTRAINTS）。
 */

/** ---------------------------------------------------------------------------
 * 落地1 · 三类核心用户（写入注释，供内容定向引用）
 * --------------------------------------------------------------------------- */

export type BrandAudienceId = 'young_short_trip' | 'family' | 'culture_elder';

export type BrandAudienceProfile = {
  id: BrandAudienceId;
  label: string;
  ageHint: string;
  summary: string;
  /** 漫游灵感卡轻量标签（与卡片角标一致） */
  inspireTag: '近郊轻游' | '亲子时光' | '人文慢逛';
  preferences: readonly string[];
  avoid: readonly string[];
};

/**
 * 全站内容定向匹配的三类核心人群。
 * ① 都市短途年轻人（22–35）② 亲子家庭 ③ 文艺中老年漫行爱好者
 */
export const BRAND_AUDIENCE_SEGMENTS: readonly BrandAudienceProfile[] = [
  {
    id: 'young_short_trip',
    label: '都市短途年轻人',
    ageHint: '22–35 岁上班族',
    summary: '偏好 1–3 天近郊、城市人文慢逛、低成本松弛出行',
    inspireTag: '近郊轻游',
    preferences: ['轻徒步', '夜市老街', '小众展馆', '近郊一日或周末'],
    avoid: ['多日高强度赶场', '高消费打卡清单'],
  },
  {
    id: 'family',
    label: '亲子家庭用户',
    ageHint: '亲子同行',
    summary: '山野农家、采摘、平缓环湖骑行；节奏宽松，避开拥挤景区',
    inspireTag: '亲子时光',
    preferences: ['山野农家', '采摘体验', '平缓环湖骑行', '宽松空档'],
    avoid: ['拥挤热门景区硬挤', '长距离强徒步'],
  },
  {
    id: 'culture_elder',
    label: '文艺中老年漫行爱好者',
    ageHint: '中老年慢游',
    summary: '古城、茶园、非遗市集、老城街巷；弱化高强度户外',
    inspireTag: '人文慢逛',
    preferences: ['古城街巷', '茶园闲坐', '非遗市集', '老城慢逛'],
    avoid: ['高强度漂流攀岩', '赶场式特种兵行程'],
  },
] as const;

/** ---------------------------------------------------------------------------
 * 落地2 · 全触点心智统一话术
 * --------------------------------------------------------------------------- */

/** 全站心智一句（首页 / 分享 / 引导统一引用） */
export const BRAND_MINDSHARE_LINE =
  '纯免费小众漫行规划工具，无 OTA 推销套路，本地人松弛短途出行参考';

/** 首页 slogan 下风景辅助标语（与 Hero 副标题对齐，勿改字序） */
export const BRAND_HERO_SCENIC_LINE = '缓步山河，遇见不期而遇的风景';

/** 城市弹窗简介末尾慢游价值观（柔和植入，不另起硬广段） */
export const BRAND_CITY_INTRO_VALUE_TAIL =
  '慢游不必追人流：把空档留给街巷与一杯茶，比赶完清单更接近这座城。';

/** AI 攻略结果区 · 开篇轻提示 */
export const BRAND_AI_TIP_OPEN =
  '以下为本地视角的松弛路线参考：预留闲逛空档，不做流水线打卡清单。';

/** AI 攻略结果区 · 收束轻提示 */
export const BRAND_AI_TIP_CLOSE =
  '蜗牛提醒：核心规划永久免费。按心情微调节奏即可，不必一次走完。';

/** 游记发布 / 反馈页底部温和短句 */
export const BRAND_PAGE_VALUE_WHISPER =
  '蜗牛旅行：松弛优先 · 真实在地 · 纯粹免费 · 轻量漫行 — 只做出行参考，不做交易推销。';

/** 分享外链标题心智标签 */
export const BRAND_SHARE_TITLE_TAG = '免费漫行规划，拒绝流水线打卡';

/** 分享标题统一带上心智标签（已含则不重复） */
export function withBrandShareTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return BRAND_SHARE_TITLE_TAG;
  if (trimmed.includes(BRAND_SHARE_TITLE_TAG) || trimmed.includes('免费漫行规划')) {
    return trimmed;
  }
  return `${trimmed} · ${BRAND_SHARE_TITLE_TAG}`;
}

/** 城市简介末尾植入价值观（已含则不重复） */
export function withCityIntroValueTail(intro: string): string {
  const trimmed = intro.trim();
  if (!trimmed) return BRAND_CITY_INTRO_VALUE_TAIL;
  if (trimmed.includes('慢游不必追人流') || trimmed.includes(BRAND_CITY_INTRO_VALUE_TAIL)) {
    return trimmed;
  }
  return `${trimmed}${trimmed.endsWith('。') || trimmed.endsWith('.') ? '' : '。'}${BRAND_CITY_INTRO_VALUE_TAIL}`;
}

/** ---------------------------------------------------------------------------
 * 落地3 · 品牌故事与四大价值观
 * --------------------------------------------------------------------------- */

export const BRAND_STORY_TITLE = '关于蜗牛';

export const BRAND_STORY_BODY =
  '蜗牛代表慢行、松弛、不追赶人流。品牌初衷是跳出流水线旅游，让普通人不用远途、不用高消费，就能在城市与近郊找到舒服的出行方式。我们坚持只做免费出行信息工具，不做交易推销，专注本地人真实游玩路线。';

export type BrandCoreValueId = 'relax_first' | 'local_real' | 'pure_free' | 'light_roam';

export type BrandCoreValue = {
  id: BrandCoreValueId;
  title: string;
  line: string;
};

/** 四大核心价值观（注释 + 静态文案统一引用） */
export const BRAND_CORE_VALUES: readonly BrandCoreValue[] = [
  {
    id: 'relax_first',
    title: '松弛优先',
    line: '旅行不必打卡赶路',
  },
  {
    id: 'local_real',
    title: '真实在地',
    line: '深挖本地老店、小众原生点位，拒绝网红流水线',
  },
  {
    id: 'pure_free',
    title: '纯粹免费',
    line: '核心规划工具永久无付费门槛',
  },
  {
    id: 'light_roam',
    title: '轻量漫行',
    line: '主打近郊、短途、低成本日常出游',
  },
] as const;

export const BRAND_CORE_VALUES_LINE = BRAND_CORE_VALUES.map(
  (item) => `${item.title}：${item.line}`,
).join('；');

/**
 * 注入 AI 提示的人群适配规则（不改流式管道，仅约束输出）
 * 当用户消息含亲子/单人/结伴/中老年等提示时，自动匹配对应松弛行程。
 */
export const AI_AUDIENCE_ADAPTATION_CONSTRAINTS = [
  '【人群适配】识别用户人群后匹配节奏，禁止一刀切特种兵清单：',
  `- ${BRAND_AUDIENCE_SEGMENTS[0].label}（${BRAND_AUDIENCE_SEGMENTS[0].ageHint}）：侧重 1–3 天近郊、轻徒步、夜市老街、小众展馆；低成本松弛。`,
  `- ${BRAND_AUDIENCE_SEGMENTS[1].label}：侧重山野农家、采摘、平缓环湖；节奏宽松，避开拥挤景区与危险户外。`,
  `- ${BRAND_AUDIENCE_SEGMENTS[2].label}：侧重古城、茶园、非遗市集、老城街巷；弱化高强度运动与长距离强徒步。`,
  '未明确人群时，默认按「都市短途年轻人」给出可微调的近郊松弛方案，并在简介中点明可按亲子/慢游再收紧节奏。',
].join('\n');
