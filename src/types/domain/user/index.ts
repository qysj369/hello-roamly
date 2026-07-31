export type { UserId, GuestSessionId, UserSubjectId } from '@/types/domain/user/userId';

export type {
  AuthProvider,
  UserAccountStatus,
  UserAuthBinding,
  AuthSession,
  PhoneLoginPayload,
  WechatLoginPayload,
  LoginPayload,
  AuthState,
} from '@/types/domain/user/userAuth';

export type { UserBasicInfo } from '@/types/domain/user/userBasic';

export {
  TravelPersonalityKind,
  TRAVEL_PERSONALITY_OPTIONS,
  TRAVEL_PERSONALITY_PRESETS,
  DEFAULT_USER_TRAVEL_INFO,
  getTravelPersonalityPreset,
  isTravelPersonalityKind,
} from '@/types/domain/user/userTravel';
export type {
  TravelPersonality,
  TravelPersonalityId,
  UserTravelInfo,
  VisitedCountryCode,
} from '@/types/domain/user/userTravel';

export type { TravelMoment, TravelMomentVisibility, UserSocialInfo } from '@/types/domain/user/userSocial';
export { EMPTY_USER_SOCIAL_INFO } from '@/types/domain/user/userSocial';

export type {
  PrivacySettings,
  NotificationPreferences,
  UserSettings,
  UserNotificationSettings,
} from '@/types/domain/user/userSettings';
export {
  DEFAULT_PRIVACY_SETTINGS,
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_USER_SETTINGS,
} from '@/types/domain/user/userSettings';

export type { UserBadge, UserPublicProfile, UserProfile } from '@/types/domain/user/userProfile';
export {
  toTravelPlanCreator,
  fromTravelPlanCreator,
  toUserPublicProfile,
} from '@/types/domain/user/userProfile';

export type { UserTravelPreferences } from '@/types/domain/user/userPreferences';
export {
  DEFAULT_USER_TRAVEL_PREFERENCES,
  travelPreferencesFromUser,
} from '@/types/domain/user/userPreferences';

export type { UserStats, UserPlanInteractions } from '@/types/domain/user/userStats';
export { EMPTY_USER_STATS, EMPTY_USER_PLAN_INTERACTIONS } from '@/types/domain/user/userStats';

export type {
  CompanionSeekingStatus,
  UserCompanionIntent,
  UserCompanionPreferences,
} from '@/types/domain/user/userCompanion';

export type { UserPlanOwnership } from '@/types/domain/user/userPlan';

export type { User, GuestUser, RegisteredUser, UserRole } from '@/types/domain/user/user';
export { isRegisteredUser, isGuestUser } from '@/types/domain/user/user';

export { createDefaultUser } from '@/types/domain/user/userDefaults';
