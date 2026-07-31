import { z } from 'zod';

export const userStatsSchema = z.object({
  publishedPlanCount: z.number().int().min(0),
  receivedLikeCount: z.number().int().min(0),
  favoriteCount: z.number().int().min(0),
  companionPostCount: z.number().int().min(0),
});

export const userBadgeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: z.enum(['verified', 'creator', 'companion', 'explorer', 'custom']),
  description: z.string().optional(),
  earnedAt: z.string().datetime().optional(),
});
