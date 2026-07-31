import { z } from 'zod';
import {
  TRAVEL_BUDDY_BUDGET_OPTIONS,
  TRAVEL_BUDDY_TAG_OPTIONS,
} from '@/lib/config/travelBuddy';
import { nonEmptyStringSchema, userIdSchema } from '@/schemas/shared';

const budgetRangeSchema = z.enum(
  TRAVEL_BUDDY_BUDGET_OPTIONS.map((item) => item.value) as [
    (typeof TRAVEL_BUDDY_BUDGET_OPTIONS)[number]['value'],
    ...(typeof TRAVEL_BUDDY_BUDGET_OPTIONS)[number]['value'][],
  ],
);

const tagSchema = z.enum(
  TRAVEL_BUDDY_TAG_OPTIONS.map((item) => item.value) as [
    (typeof TRAVEL_BUDDY_TAG_OPTIONS)[number]['value'],
    ...(typeof TRAVEL_BUDDY_TAG_OPTIONS)[number]['value'][],
  ],
);

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '请选择有效日期');

export const travelBuddyStatusSchema = z.enum(['seeking', 'matched', 'closed']);

export const createTravelBuddyPostSchema = z.object({
  destination: nonEmptyStringSchema.min(1).max(120),
  startDate: dateOnlySchema,
  budgetRange: budgetRangeSchema,
  tags: z.array(tagSchema).min(1, '请至少选择一个结伴需求'),
  description: z.string().max(500).optional(),
});

export const sendBuddyMessageSchema = z.object({
  buddyPostId: nonEmptyStringSchema.max(128),
  toUserId: userIdSchema,
  content: nonEmptyStringSchema.min(1).max(1000),
});
