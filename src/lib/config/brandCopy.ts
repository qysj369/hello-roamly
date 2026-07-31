/**
 * 「蜗牛旅行」品牌文案体系
 * 首页头区：品牌名 → 精神口号 → 功能描述
 */

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
export const BRAND_FUNCTION_DESC = '最真实的穷游攻略库，每一分花费都有出处';

/** @deprecated 使用 BRAND_FUNCTION_DESC */
export const BRAND_VALUE_PROPOSITION = BRAND_FUNCTION_DESC;

/** 品类定位（地图页 / SEO 等） */
export const BRAND_POSITIONING = 'AI 可视化智能穷游地图平台';

/** 底层能力一句话（能力条 / 页脚） */
export const BRAND_PILLARS_LINE =
  '高德地图 LBS 可视化 · 穷游省钱攻略库 · 全链路 AI 智能决策';

export const BRAND_PILLARS = [
  {
    title: '高德地图底座',
    desc: '景点美食青旅 POI、公交地铁、路线导航与轨迹绘制',
  },
  {
    title: '穷游攻略数据库',
    desc: '免费景点、平价吃住、避坑贴士与 1–7 天行程模板',
  },
  {
    title: 'AI 智能引擎',
    desc: '行程编排、路线优化、预算精算与智能问答',
  },
] as const;
