import { z } from 'zod';

export const contentModerationSceneSchema = z.enum([
  'ai_chat',
  'site_chat',
  'travel_moment',
  'profile_bio',
  'comment',
]);

export const moderationDecisionSchema = z.enum(['pass', 'reject', 'review']);

export const moderateContentInputSchema = z.object({
  scene: contentModerationSceneSchema,
  text: z.string().min(1).max(8000),
  bizId: z.string().max(128).optional(),
  userId: z.string().max(128).optional(),
});

export const moderationCheckResponseSchema = z.object({
  decision: moderationDecisionSchema,
  requestId: z.string().min(1),
  labels: z.array(z.string()).optional(),
  message: z.string().optional(),
});
