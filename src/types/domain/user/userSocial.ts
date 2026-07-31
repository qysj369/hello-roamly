export type {
  TravelMoment,
  TravelMomentVisibility,
  UserSocialInfo,
} from '@/types/interfaces/user';

export const EMPTY_USER_SOCIAL_INFO: import('@/types/interfaces/user').UserSocialInfo = {
  followersCount: 0,
  followingCount: 0,
  travelMoments: [],
};
