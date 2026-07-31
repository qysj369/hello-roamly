import type { TravelInterest } from '@/types/domain/aiTravelParams';

/**
 * 旅行人格枚举（Travel DNA）
 * 用于用户画像、旅伴匹配与推荐
 */
export enum TravelPersonalityKind {
  Adventurer = 'Adventurer',
  Foodie = 'Foodie',
  CultureExplorer = 'CultureExplorer',
  Relaxer = 'Relaxer',
  Photographer = 'Photographer',
  /** 极致性价比、青旅与公共交通 */
  BudgetNomad = 'BudgetNomad',
  /** 乐于结伴与社交型出行 */
  SocialButterfly = 'SocialButterfly',
}

/** @deprecated 使用 TravelPersonalityKind */
export type TravelPersonalityId = `${TravelPersonalityKind}`;

/** 旅行人格完整描述 */
export type TravelPersonality = {
  kind: TravelPersonalityKind;
  /** 展示标题，如「探险家」 */
  title: string;
  /** 一句话描述 */
  summary: string;
  /** 特征标签，如 户外、美食、摄影 */
  traits: string[];
};

export const TRAVEL_PERSONALITY_PRESETS: Record<TravelPersonalityKind, TravelPersonality> = {
  [TravelPersonalityKind.Adventurer]: {
    kind: TravelPersonalityKind.Adventurer,
    title: '探险家',
    summary: '偏爱自然与户外，愿意为多走几步的风景买单。',
    traits: ['户外', '冒险', '自然'],
  },
  [TravelPersonalityKind.Foodie]: {
    kind: TravelPersonalityKind.Foodie,
    title: '美食家',
    summary: '行程围绕在地小吃与夜市，预算灵活留给味蕾。',
    traits: ['美食', '市井', '夜市'],
  },
  [TravelPersonalityKind.CultureExplorer]: {
    kind: TravelPersonalityKind.CultureExplorer,
    title: '文化探索者',
    summary: '博物馆、古迹与本地故事优先于打卡速度。',
    traits: ['文化', '历史', '博物馆'],
  },
  [TravelPersonalityKind.Relaxer]: {
    kind: TravelPersonalityKind.Relaxer,
    title: '悠闲度假者',
    summary: '慢节奏、少景点，留白给咖啡馆与街角。',
    traits: ['悠闲', 'Citywalk', '咖啡'],
  },
  [TravelPersonalityKind.Photographer]: {
    kind: TravelPersonalityKind.Photographer,
    title: '摄影师',
    summary: '追逐光线与构图，行程服务于黄金时段与机位。',
    traits: ['摄影', '日出', '街拍'],
  },
  [TravelPersonalityKind.BudgetNomad]: {
    kind: TravelPersonalityKind.BudgetNomad,
    title: '穷游/nomad',
    summary: '极致性价比，青旅与公共交通是主旋律。',
    traits: ['穷游', '青旅', '公交'],
  },
  [TravelPersonalityKind.SocialButterfly]: {
    kind: TravelPersonalityKind.SocialButterfly,
    title: '社交型旅人',
    summary: '乐于结伴与拼团，旅途中的相遇同样重要。',
    traits: ['结伴', '夜生活', '社交'],
  },
};

/** UI 选项列表（下拉 / 人格测试） */
export const TRAVEL_PERSONALITY_OPTIONS: {
  kind: TravelPersonalityKind;
  label: string;
  hint: string;
}[] = [
  {
    kind: TravelPersonalityKind.Adventurer,
    label: '探险家',
    hint: TRAVEL_PERSONALITY_PRESETS[TravelPersonalityKind.Adventurer].summary,
  },
  {
    kind: TravelPersonalityKind.Foodie,
    label: '美食家',
    hint: TRAVEL_PERSONALITY_PRESETS[TravelPersonalityKind.Foodie].summary,
  },
  {
    kind: TravelPersonalityKind.CultureExplorer,
    label: '文化探索者',
    hint: TRAVEL_PERSONALITY_PRESETS[TravelPersonalityKind.CultureExplorer].summary,
  },
  {
    kind: TravelPersonalityKind.Relaxer,
    label: '悠闲度假者',
    hint: TRAVEL_PERSONALITY_PRESETS[TravelPersonalityKind.Relaxer].summary,
  },
  {
    kind: TravelPersonalityKind.Photographer,
    label: '摄影师',
    hint: TRAVEL_PERSONALITY_PRESETS[TravelPersonalityKind.Photographer].summary,
  },
  {
    kind: TravelPersonalityKind.BudgetNomad,
    label: '穷游/nomad',
    hint: TRAVEL_PERSONALITY_PRESETS[TravelPersonalityKind.BudgetNomad].summary,
  },
  {
    kind: TravelPersonalityKind.SocialButterfly,
    label: '社交型旅人',
    hint: TRAVEL_PERSONALITY_PRESETS[TravelPersonalityKind.SocialButterfly].summary,
  },
];

export function isTravelPersonalityKind(value: string): value is TravelPersonalityKind {
  return Object.values(TravelPersonalityKind).includes(value as TravelPersonalityKind);
}

export function getTravelPersonalityPreset(kind: TravelPersonalityKind): TravelPersonality {
  return TRAVEL_PERSONALITY_PRESETS[kind];
}

/** ISO 3166-1 alpha-2 国家/地区代码，如 CN、JP */
export type VisitedCountryCode = string;

/** 用户旅行信息块 */
export type UserTravelInfo = {
  travelPersonality: TravelPersonality;
  visitedCountries: VisitedCountryCode[];
  interests: TravelInterest[];
};

export const DEFAULT_USER_TRAVEL_INFO: UserTravelInfo = {
  travelPersonality: TRAVEL_PERSONALITY_PRESETS[TravelPersonalityKind.BudgetNomad],
  visitedCountries: [],
  interests: ['food', 'culture'],
};
