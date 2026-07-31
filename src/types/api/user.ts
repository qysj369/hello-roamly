import type { AuthSession, UserAuthBinding } from '@/types/domain/user/userAuth';
import type {
  NotificationPreferences,
  PrivacySettings,
  User,
  UserPublicProfile,
  UserStats,
  UserTravelInfo,
} from '@/types/domain/user';

/** GET /me */
export type GetCurrentUserResponse = {
  user: User;
};

/** POST /auth/login */
export type LoginResponse = {
  user: User;
  session: AuthSession;
};

/** POST /auth/logout */
export type LogoutResponse = {
  success: boolean;
};

/** PATCH /users/:id — 基础信息 */
export type UpdateUserBasicInfoRequest = Partial<Pick<User, 'username' | 'email' | 'avatar'>>;

export type UpdateUserBasicInfoResponse = Pick<User, 'id' | 'username' | 'email' | 'avatar' | 'updatedAt'>;

/** PATCH /users/:id/travel — 旅行信息 */
export type UpdateUserTravelInfoRequest = Partial<UserTravelInfo>;

export type UpdateUserTravelInfoResponse = UserTravelInfo;

/** PATCH /users/:id/settings/privacy */
export type UpdatePrivacySettingsRequest = Partial<PrivacySettings>;

export type UpdatePrivacySettingsResponse = {
  privacySettings: PrivacySettings;
};

/** PATCH /users/:id/settings/notifications */
export type UpdateNotificationPreferencesRequest = Partial<NotificationPreferences>;

export type UpdateNotificationPreferencesResponse = {
  notificationPreferences: NotificationPreferences;
};

/** GET /users/:id（公开资料） */
export type GetUserPublicProfileResponse = {
  profile: UserPublicProfile;
  stats?: UserStats;
};

/** GET /users/:id/plan-interactions */
export type GetUserPlanInteractionsResponse = {
  likedPlanIds: string[];
  favoritedPlanIds: string[];
  updatedAt: string;
};

/** PUT /users/:id/plan-interactions */
export type SyncUserPlanInteractionsRequest = {
  likedPlanIds: string[];
  favoritedPlanIds: string[];
};

export type RefreshTokenResponse = {
  session: AuthSession;
  binding?: UserAuthBinding;
};

/** @deprecated 使用 UpdateUserBasicInfoRequest */
export type UpdateUserProfileRequest = UpdateUserBasicInfoRequest;

/** @deprecated */
export type UpdateUserProfileResponse = {
  profile: Pick<User, 'id' | 'username' | 'avatar' | 'email'>;
};

/** @deprecated 使用 UpdateUserTravelInfoRequest */
export type UpdateUserPreferencesRequest = UpdateUserTravelInfoRequest;

/** @deprecated */
export type UpdateUserPreferencesResponse = UpdateUserTravelInfoResponse;
