import { z } from 'zod';
import { TravelPersonalityKind } from '@/types/domain/user/userTravel';
import { nonEmptyStringSchema } from '@/schemas/shared';

export const travelPersonalityKindSchema = z.enum(TravelPersonalityKind);

export const travelPersonalitySchema = z.object({
  kind: travelPersonalityKindSchema,
  title: nonEmptyStringSchema.max(32),
  summary: nonEmptyStringSchema.max(200),
  traits: z.array(nonEmptyStringSchema.max(24)).min(1).max(12),
});

export type TravelPersonalitySchemaInput = z.input<typeof travelPersonalitySchema>;
export type TravelPersonalitySchemaOutput = z.output<typeof travelPersonalitySchema>;
