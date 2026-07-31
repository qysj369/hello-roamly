import type { UserId } from '@/types/domain/user/userId';

/** 各用户演示收藏的计划 id */
export const DEMO_USER_FAVORITE_PLAN_IDS: Partial<Record<UserId, string[]>> = {
  'user-roamly-demo': ['plan-xiamen', 'plan-hangzhou', 'plan-chengdu'],
  'user-maple': ['plan-xian', 'plan-hangzhou'],
  'user-nomad': ['plan-chengdu'],
};

/** 关注 / 粉丝关系（用户 id 列表） */
export const DEMO_USER_CONNECTIONS: Partial<
  Record<UserId, { following: UserId[]; followers: UserId[] }>
> = {
  'user-roamly-demo': {
    following: ['user-maple', 'user-nomad'],
    followers: ['user-maple', 'user-nomad'],
  },
  'user-maple': {
    following: ['user-roamly-demo'],
    followers: ['user-roamly-demo', 'user-nomad'],
  },
  'user-nomad': {
    following: ['user-roamly-demo', 'user-maple'],
    followers: ['user-roamly-demo'],
  },
};
