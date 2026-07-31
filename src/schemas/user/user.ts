import { z } from 'zod';
import { guestSessionIdSchema, isoDateTimeSchema } from '@/schemas/shared';
import { userAuthBindingSchema, userAccountStatusSchema, userRoleSchema } from '@/schemas/user/userAuth';
import { userBasicInfoSchema } from '@/schemas/user/userBasic';
import { userCompanionPreferencesSchema } from '@/schemas/user/userCompanion';
import {
  notificationPreferencesSchema,
  privacySettingsSchema,
} from '@/schemas/user/userSettings';
import { userSocialInfoSchema } from '@/schemas/user/userSocial';
import { userBadgeSchema, userStatsSchema } from '@/schemas/user/userStats';
import { userTravelInfoSchema } from '@/schemas/user/userTravel';

/** 完整用户（聚合根） */
export const userSchema = userBasicInfoSchema
  .merge(userTravelInfoSchema)
  .merge(userSocialInfoSchema)
  .extend({
    stats: userStatsSchema,
    badges: z.array(userBadgeSchema),
    privacySettings: privacySettingsSchema,
    notificationPreferences: notificationPreferencesSchema,
    role: userRoleSchema.optional(),
    accountStatus: userAccountStatusSchema.optional(),
    auth: userAuthBindingSchema.optional(),
    companionPreferences: userCompanionPreferencesSchema.optional(),
    contributionScore: z.number().int().min(0).optional(),
    createdAt: isoDateTimeSchema.optional(),
    updatedAt: isoDateTimeSchema.optional(),
  });

/** 游客会话用户 */
export const guestUserSchema = z.object({
  sessionId: guestSessionIdSchema,
  role: z.literal('guest'),
  username: userBasicInfoSchema.shape.username,
  avatar: userBasicInfoSchema.shape.avatar,
  travelPersonality: userTravelInfoSchema.shape.travelPersonality,
  visitedCountries: userTravelInfoSchema.shape.visitedCountries,
  interests: userTravelInfoSchema.shape.interests,
  privacySettings: privacySettingsSchema,
  notificationPreferences: notificationPreferencesSchema,
  createdAt: isoDateTimeSchema,
});

/** 注册必填：含 auth 与邮箱 */
export const registeredUserSchema = userSchema
  .extend({
    role: z.enum(['member', 'creator', 'admin']),
    email: userBasicInfoSchema.shape.email,
    auth: userAuthBindingSchema,
  })
  .refine((data) => data.auth.userId === data.id, {
    message: 'auth.userId 须与 user.id 一致',
    path: ['auth', 'userId'],
  });

export type UserSchemaInput = z.input<typeof userSchema>;
export type UserSchemaOutput = z.output<typeof userSchema>;
export type GuestUserSchemaOutput = z.output<typeof guestUserSchema>;
