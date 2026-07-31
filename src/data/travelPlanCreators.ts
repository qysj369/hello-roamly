import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import type { TravelPlanCreator } from '@/types/domain/travelPlan';

const AVATAR_BASE = 'https://api.dicebear.com/7.x/notionists/svg';

/** 演示用创建者池（id 与演示用户 id 对齐，便于主页筛选计划） */
export const TRAVEL_PLAN_CREATORS: TravelPlanCreator[] = [
  {
    id: DEMO_CURRENT_USER_ID,
    nickname: '轻游小鹿',
    avatarUrl: `${AVATAR_BASE}?seed=roam-deer&backgroundColor=b6e3f4,c0aede`,
  },
  {
    id: 'user-maple',
    nickname: '枫叶旅人',
    avatarUrl: `${AVATAR_BASE}?seed=maple-travel&backgroundColor=ffd5dc,ffdfbf`,
  },
  {
    id: 'user-nomad',
    nickname: '/nomad阿青',
    avatarUrl: `${AVATAR_BASE}?seed=nomad-qing&backgroundColor=d1f4d1,c0aede`,
  },
  {
    id: 'creator-budget',
    nickname: '穷游记事本',
    avatarUrl: `${AVATAR_BASE}?seed=budget-note&backgroundColor=ffdfbf,b6e3f4`,
  },
];

export function getTravelPlanCreator(guideId: string): TravelPlanCreator {
  const index =
    [...guideId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % TRAVEL_PLAN_CREATORS.length;
  return TRAVEL_PLAN_CREATORS[index]!;
}
