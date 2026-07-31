import type { GuestSessionId } from '@/types/domain/user/userId';
import type { UserTravelInfo } from '@/types/domain/user/userTravel';
import type { User } from '@/types/interfaces/user';

export type { User, UserRole } from '@/types/interfaces/user';

/** 游客会话（字段子集，无 email / 社交） */
export type GuestUser = {
  sessionId: GuestSessionId;
  role: 'guest';
  username: string;
  avatar?: string;
  travelPersonality: UserTravelInfo['travelPersonality'];
  visitedCountries: UserTravelInfo['visitedCountries'];
  interests: UserTravelInfo['interests'];
};

/** 已登录注册用户 */
export type RegisteredUser = User & {
  role: 'member' | 'creator' | 'admin';
  email: string;
};

export function isGuestUser(
  subject: User | GuestUser,
): subject is GuestUser {
  return 'sessionId' in subject && subject.role === 'guest';
}

export function isRegisteredUser(subject: User | GuestUser): subject is RegisteredUser {
  return !isGuestUser(subject) && Boolean((subject as User).email);
}
