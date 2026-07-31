import type { User } from '@/types/domain/user/user';
import type { UserId } from '@/types/domain/user/userId';
import { DEFAULT_USER_SETTINGS } from '@/types/domain/user/userSettings';
import { EMPTY_USER_SOCIAL_INFO } from '@/types/domain/user/userSocial';
import { EMPTY_USER_STATS } from '@/types/domain/user/userStats';
import { DEFAULT_USER_TRAVEL_INFO } from '@/types/domain/user/userTravel';

export function createDefaultUser(id: UserId, overrides?: Partial<User>): User {
  const now = new Date().toISOString();

  return {
    id,
    username: overrides?.username ?? 'roamly_traveler',
    email: overrides?.email ?? '',
    avatar: overrides?.avatar,
    ...DEFAULT_USER_TRAVEL_INFO,
    ...EMPTY_USER_SOCIAL_INFO,
    stats: EMPTY_USER_STATS,
    badges: [],
    contributionScore: 0,
    ...DEFAULT_USER_SETTINGS,
    role: 'member',
    accountStatus: 'active',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
