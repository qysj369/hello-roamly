import type { TravelPlanStyleTag } from '@/types/domain/travelPlanStyleTag';

export const TRAVEL_PLAN_STYLE_TAGS_BY_GUIDE_ID: Record<string, TravelPlanStyleTag[]> = {
  hangzhou: [
    { id: 'nature', label: '自然慢行', tone: 'emerald' },
    { id: 'weekend', label: '周末轻旅', tone: 'brand' },
  ],
  xiamen: [
    { id: 'island', label: '海岛摄影', tone: 'cyan' },
    { id: 'slow', label: '慢旅行', tone: 'violet' },
  ],
  xian: [
    { id: 'food', label: '美食之旅', tone: 'amber' },
    { id: 'culture', label: '文化探寻', tone: 'rose' },
  ],
  chengdu: [
    { id: 'food', label: '美食之旅', tone: 'amber' },
    { id: 'citywalk', label: '城市漫步', tone: 'violet' },
  ],
};

const DEFAULT_STYLE_TAGS: TravelPlanStyleTag[] = [
  { id: 'explore', label: '冒险探索', tone: 'brand' },
  { id: 'budget', label: '穷游精选', tone: 'emerald' },
];

export function getTravelPlanStyleTags(guideId: string): TravelPlanStyleTag[] {
  return TRAVEL_PLAN_STYLE_TAGS_BY_GUIDE_ID[guideId] ?? DEFAULT_STYLE_TAGS;
}
