import { z } from 'zod';
import { isoDateTimeSchema, nonEmptyStringSchema, positiveIntSchema, userIdSchema } from '@/schemas/shared';

export const companionSeekingStatusSchema = z.enum(['open', 'matched', 'closed', 'expired']);

export const userCompanionPreferencesSchema = z.object({
  maxBudgetDeltaPercent: z.number().min(0).max(100).optional(),
  maxDaysDelta: z.number().int().min(0).max(30).optional(),
  minSharedInterests: z.number().int().min(0).max(5).optional(),
  verifiedOnly: z.boolean().optional(),
});

export const userCompanionIntentSchema = z.object({
  id: nonEmptyStringSchema.max(128),
  userId: userIdSchema,
  planId: nonEmptyStringSchema.max(128).optional(),
  planTitle: nonEmptyStringSchema.max(120).optional(),
  destination: nonEmptyStringSchema.max(80),
  days: positiveIntSchema.max(90),
  budgetLabel: nonEmptyStringSchema.max(32),
  startDate: isoDateTimeSchema.optional(),
  message: nonEmptyStringSchema.max(500).optional(),
  status: companionSeekingStatusSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export const createUserCompanionIntentSchema = userCompanionIntentSchema.omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateUserCompanionIntentSchemaInput = z.input<typeof createUserCompanionIntentSchema>;
