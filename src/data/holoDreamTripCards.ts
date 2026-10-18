import { resolvePublicAssetUrl } from '@/lib/cdn';
import type { BrandAudienceId } from '@/lib/config/brandMindshare';
import { paths } from '@/router/paths';

export type DreamTripIcon =
  | 'cabin'
  | 'tent'
  | 'pottery'
  | 'raft'
  | 'bike'
  | 'moon';

/** 漫游灵感轻量化场景标签（对齐三类核心用户） */
export type DreamTripLiteTag = '近郊轻游' | '人文慢逛' | '亲子时光';

export type DreamTripCard = {
  key: string;
  icon: DreamTripIcon;
  title: string;
  subtitle: string;
  /** 轻量化场景标签：近郊轻游 / 人文慢逛 / 亲子时光 */
  liteTag: DreamTripLiteTag;
  /** 对应品牌用户分层（见 brandMindshare） */
  audienceId: BrandAudienceId;
  cover: string;
  /** 封面焦点，避免 cover 裁切压住人物头部等关键区域 */
  objectPosition?: string;
  to: string;
};

function localCover(filename: string): string {
  return resolvePublicAssetUrl(`/trip-covers/${filename}`);
}

/**
 * 首页「梦幻之旅」六宫格
 * 封面使用站内静态图（public/trip-covers），保证主题匹配与国内可加载
 * 文案对齐四大价值观：松弛优先 · 真实在地 · 纯粹免费 · 轻量漫行（剔除高强度商业化表述）
 */
export const holoDreamTripCards: readonly DreamTripCard[] = [
  {
    key: 'farmstay',
    icon: 'cabin',
    title: '山野农家',
    subtitle: '采摘闲坐·亲子时光',
    liteTag: '亲子时光',
    audienceId: 'family',
    cover: localCover('farmstay.jpg'),
    to: paths.inspire,
  },
  {
    key: 'camping',
    icon: 'tent',
    title: '星空露营',
    subtitle: '近郊过夜·枕星而眠',
    liteTag: '近郊轻游',
    audienceId: 'young_short_trip',
    cover: localCover('camping.jpg'),
    to: paths.inspire,
  },
  {
    key: 'heritage',
    icon: 'pottery',
    title: '非遗市集',
    subtitle: '手作慢逛·老街烟火',
    liteTag: '人文慢逛',
    audienceId: 'culture_elder',
    cover: localCover('heritage.jpg'),
    to: paths.inspire,
  },
  {
    key: 'rafting',
    icon: 'raft',
    title: '溪谷轻游',
    subtitle: '浅水缓行·近郊半日',
    liteTag: '近郊轻游',
    audienceId: 'young_short_trip',
    cover: localCover('rafting.jpg'),
    to: paths.inspire,
  },
  {
    key: 'cycling',
    icon: 'bike',
    title: '环湖骑行',
    subtitle: '平缓绿道·亲子可随',
    liteTag: '亲子时光',
    audienceId: 'family',
    cover: localCover('cycling.jpg'),
    objectPosition: '50% 32%',
    to: paths.inspire,
  },
  {
    key: 'nighttown',
    icon: 'moon',
    title: '古镇夜游',
    subtitle: '灯影街巷·慢步夜色',
    liteTag: '人文慢逛',
    audienceId: 'culture_elder',
    cover: localCover('nighttown.jpg'),
    to: paths.inspire,
  },
] as const;
