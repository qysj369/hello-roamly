export type {
  NotificationPreferences,
  PrivacySettings,
  UserSettings,
} from '@/types/interfaces/user';

import type {
  NotificationPreferences,
  PrivacySettings,
  UserSettings,
} from '@/types/interfaces/user';

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibility: 'public',
  showVisitedCountries: true,
  showEmail: false,
  allowCompanionRequests: true,
  defaultMomentVisibility: 'public',
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  companionMatch: true,
  planReminder: true,
  newFollower: true,
  momentEngagement: true,
  marketing: false,
  emailDigest: false,
  pushEnabled: true,
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  privacySettings: DEFAULT_PRIVACY_SETTINGS,
  notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
};

/** @deprecated 使用 NotificationPreferences */
export type UserNotificationSettings = NotificationPreferences;
