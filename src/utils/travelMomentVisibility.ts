import { DEMO_USER_CONNECTIONS } from '@/data/demoUserProfileContent';
import type { UserId } from '@/types/domain/user/userId';
import type { TravelMoment, TravelMomentVisibility } from '@/types/domain/user/userSocial';

export type TravelMomentVisibilityOption = {
  value: TravelMomentVisibility;
  label: string;
  hint: string;
};

/** 发布瞬间时的可见范围选项 */
export const TRAVEL_MOMENT_VISIBILITY_OPTIONS: TravelMomentVisibilityOption[] = [
  { value: 'public', label: '公开', hint: '所有人可见' },
  { value: 'followers', label: '仅好友', hint: '互相关注的旅伴可见' },
  { value: 'private', label: '私密', hint: '仅自己可见' },
];

export function getTravelMomentVisibilityLabel(visibility: TravelMomentVisibility): string {
  return (
    TRAVEL_MOMENT_VISIBILITY_OPTIONS.find((option) => option.value === visibility)?.label ??
    visibility
  );
}

export function getTravelMomentVisibilityHint(visibility: TravelMomentVisibility): string {
  return (
    TRAVEL_MOMENT_VISIBILITY_OPTIONS.find((option) => option.value === visibility)?.hint ?? ''
  );
}

/** 演示环境：互相关注视为好友 */
export function areMutualFriends(userA: UserId, userB: UserId): boolean {
  if (userA === userB) {
    return true;
  }

  const connA = DEMO_USER_CONNECTIONS[userA];
  const connB = DEMO_USER_CONNECTIONS[userB];
  if (!connA || !connB) {
    return false;
  }

  return connA.following.includes(userB) && connB.following.includes(userA);
}

export function canViewTravelMoment(params: {
  moment: Pick<TravelMoment, 'visibility'>;
  authorId: UserId;
  viewerId: UserId;
  isOwnProfile: boolean;
}): boolean {
  const { moment, authorId, viewerId, isOwnProfile } = params;
  const visibility = moment.visibility ?? 'public';

  if (isOwnProfile && authorId === viewerId) {
    return true;
  }

  switch (visibility) {
    case 'public':
      return true;
    case 'followers':
      return areMutualFriends(viewerId, authorId);
    case 'private':
      return false;
    default:
      return true;
  }
}
