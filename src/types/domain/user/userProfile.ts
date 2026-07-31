import type { TravelPlanCreator } from '@/types/interfaces/travelPlan';
import type { User, UserPublicProfile } from '@/types/interfaces/user';
import type { UserId } from '@/types/domain/user/userId';

export type { UserBadge, UserProfile, UserPublicProfile } from '@/types/interfaces/user';

export function toTravelPlanCreator(
  user: Pick<User, 'id' | 'username' | 'avatar'>,
): TravelPlanCreator {
  return {
    id: user.id,
    nickname: user.username,
    avatarUrl: user.avatar,
  };
}

export function fromTravelPlanCreator(creator: TravelPlanCreator): Pick<User, 'id' | 'username' | 'avatar'> {
  return {
    id: creator.id as UserId,
    username: creator.nickname,
    avatar: creator.avatarUrl,
  };
}

export function toUserPublicProfile(user: User): UserPublicProfile {
  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    travelPersonality: user.travelPersonality,
    visitedCountries: user.visitedCountries,
    interests: user.interests,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    travelMoments: user.travelMoments,
  };
}
