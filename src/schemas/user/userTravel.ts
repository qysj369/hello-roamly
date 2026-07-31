import { z } from 'zod';
import { countryCodeSchema } from '@/schemas/shared';
import { travelPersonalitySchema } from '@/schemas/user/travelPersonality';

export const travelInterestSchema = z.enum([
  'food',
  'culture',
  'adventure',
  'shopping',
  'nature',
]);

export const userTravelInfoSchema = z.object({
  travelPersonality: travelPersonalitySchema,
  visitedCountries: z.array(countryCodeSchema).max(200),
  interests: z.array(travelInterestSchema).min(1).max(5),
});

export const updateUserTravelInfoSchema = userTravelInfoSchema.partial();

export type UserTravelInfoSchemaInput = z.input<typeof userTravelInfoSchema>;
export type UserTravelInfoSchemaOutput = z.output<typeof userTravelInfoSchema>;
