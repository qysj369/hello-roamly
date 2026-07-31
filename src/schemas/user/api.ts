import { z } from 'zod';
import { entityIdSchema, isoDateTimeSchema } from '@/schemas/shared';
import { authSessionSchema, loginPayloadSchema } from '@/schemas/user/userAuth';
import { userSchema } from '@/schemas/user/user';

export const getCurrentUserResponseSchema = z.object({
  user: userSchema,
});

export const loginResponseSchema = z.object({
  user: userSchema,
  session: authSessionSchema,
});

export const loginRequestSchema = loginPayloadSchema;

export const logoutResponseSchema = z.object({
  success: z.boolean(),
});

export const syncUserPlanInteractionsSchema = z.object({
  likedPlanIds: z.array(entityIdSchema).max(500),
  favoritedPlanIds: z.array(entityIdSchema).max(500),
});

export const getUserPlanInteractionsResponseSchema = syncUserPlanInteractionsSchema.extend({
  updatedAt: isoDateTimeSchema,
});
