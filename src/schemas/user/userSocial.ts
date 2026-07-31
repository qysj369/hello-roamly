import { z } from 'zod';
import {
  countryCodeSchema,
  httpUrlSchema,
  isoDateTimeSchema,
  nonEmptyStringSchema,
  nonNegativeIntSchema,
  userIdSchema,
} from '@/schemas/shared';
import { travelMomentVisibilitySchema } from '@/schemas/user/userSettings';

export const travelMomentSchema = z.object({
  id: nonEmptyStringSchema.max(128),
  authorId: userIdSchema,
  description: nonEmptyStringSchema.max(500),
  content: nonEmptyStringSchema.max(2000),
  title: nonEmptyStringSchema.max(120).optional(),
  tags: z.array(nonEmptyStringSchema.max(16)).max(8),
  imageUrls: z.array(httpUrlSchema).max(9).optional(),
  videoUrl: httpUrlSchema.optional(),
  location: nonEmptyStringSchema.max(120).optional(),
  coordinates: z
    .object({
      longitude: z.number().min(-180).max(180),
      latitude: z.number().min(-90).max(90),
    })
    .optional(),
  countryCode: countryCodeSchema.optional(),
  planId: nonEmptyStringSchema.max(128).optional(),
  visibility: travelMomentVisibilitySchema,
  likeCount: nonNegativeIntSchema,
  commentCount: nonNegativeIntSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export const createTravelMomentSchema = travelMomentSchema
  .omit({
    id: true,
    authorId: true,
    likeCount: true,
    commentCount: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    visibility: travelMomentVisibilitySchema.optional(),
    tags: z.array(nonEmptyStringSchema.max(16)).max(8).optional(),
  });

export const userSocialInfoSchema = z.object({
  followersCount: nonNegativeIntSchema,
  followingCount: nonNegativeIntSchema,
  travelMoments: z.array(travelMomentSchema).max(500),
});

export type TravelMomentSchemaOutput = z.output<typeof travelMomentSchema>;
export type CreateTravelMomentSchemaInput = z.input<typeof createTravelMomentSchema>;
