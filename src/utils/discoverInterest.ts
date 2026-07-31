import { TRAVEL_INTEREST_OPTIONS, type TravelInterest } from '@/types/domain/aiTravelParams';

/** 兴趣 ID 与中文标签/关键词映射（用于内容标签匹配） */
export const INTEREST_TAG_HINTS: Record<TravelInterest, string[]> = {
  food: ['美食', '小吃', '夜市', '市井'],
  culture: ['文化', '历史', '人文', '博物馆', '古迹'],
  adventure: ['冒险', '户外', '骑行', '徒步', '探险'],
  shopping: ['购物', '市集', '逛街'],
  nature: ['自然', '海岛', '风光', '摄影', '徒步'],
};

export function getInterestLabel(interest: TravelInterest): string {
  return TRAVEL_INTEREST_OPTIONS.find((item) => item.id === interest)?.label ?? interest;
}

export function formatInterestList(interests: TravelInterest[]): string {
  if (interests.length === 0) {
    return '旅行';
  }
  return interests.map(getInterestLabel).join('、');
}

/** 统计用户兴趣与内容标签的重合度（0–1） */
export function scoreInterestTagOverlap(
  userInterests: TravelInterest[],
  contentTags: string[],
): { score: number; matchedInterests: TravelInterest[] } {
  if (userInterests.length === 0 || contentTags.length === 0) {
    return { score: 0, matchedInterests: [] };
  }

  const matched = new Set<TravelInterest>();

  for (const interest of userInterests) {
    const hints = INTEREST_TAG_HINTS[interest];
    // 标签文案不统一（「美食」vs「小吃」），双向 includes 提高召回，分数仍按命中兴趣数归一
    const hit = contentTags.some((tag) =>
      hints.some((hint) => tag.includes(hint) || hint.includes(tag)),
    );
    if (hit) {
      matched.add(interest);
    }
  }

  return {
    score: matched.size / userInterests.length,
    matchedInterests: [...matched],
  };
}

export function contentTagsMatchPersonalityTraits(
  contentTags: string[],
  traits: string[],
): boolean {
  return contentTags.some((tag) => traits.some((trait) => tag.includes(trait) || trait.includes(tag)));
}
