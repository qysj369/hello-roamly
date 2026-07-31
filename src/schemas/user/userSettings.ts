import { z } from 'zod';

export const profileVisibilitySchema = z.enum(['public', 'followers', 'private']);

export const travelMomentVisibilitySchema = z.enum(['public', 'followers', 'private']);

export const privacySettingsSchema = z.object({
  profileVisibility: profileVisibilitySchema,
  showVisitedCountries: z.boolean(),
  showEmail: z.boolean(),
  allowCompanionRequests: z.boolean(),
  defaultMomentVisibility: travelMomentVisibilitySchema,
});

export const notificationPreferencesSchema = z.object({
  companionMatch: z.boolean(),
  planReminder: z.boolean(),
  newFollower: z.boolean(),
  momentEngagement: z.boolean(),
  marketing: z.boolean(),
  emailDigest: z.boolean(),
  pushEnabled: z.boolean(),
});

export const userSettingsSchema = z.object({
  privacySettings: privacySettingsSchema,
  notificationPreferences: notificationPreferencesSchema,
});

export const updatePrivacySettingsSchema = privacySettingsSchema.partial();

export const updateNotificationPreferencesSchema = notificationPreferencesSchema.partial();

export type PrivacySettingsSchemaOutput = z.output<typeof privacySettingsSchema>;
export type NotificationPreferencesSchemaOutput = z.output<typeof notificationPreferencesSchema>;
