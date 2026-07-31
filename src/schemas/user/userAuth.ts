import { z } from 'zod';
import { isoDateTimeSchema, nonEmptyStringSchema, userIdSchema } from '@/schemas/shared';

export const authProviderSchema = z.enum(['phone', 'wechat', 'email', 'guest', 'dev_token']);

export const userAccountStatusSchema = z.enum([
  'active',
  'pending_verification',
  'suspended',
  'deleted',
]);

export const userRoleSchema = z.enum(['guest', 'member', 'creator', 'admin']);

export const userAuthBindingSchema = z.object({
  provider: authProviderSchema,
  userId: userIdSchema,
  phoneMasked: nonEmptyStringSchema.max(20).optional(),
  externalId: nonEmptyStringSchema.max(256).optional(),
  verified: z.boolean(),
  lastLoginAt: isoDateTimeSchema.optional(),
});

export const authSessionSchema = z.object({
  accessToken: nonEmptyStringSchema.max(4096),
  refreshToken: nonEmptyStringSchema.max(4096).optional(),
  expiresAt: isoDateTimeSchema.optional(),
  userId: userIdSchema,
  provider: authProviderSchema,
  issuedAt: isoDateTimeSchema,
});

export const phoneLoginPayloadSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^1\d{10}$/, '请输入有效的中国大陆手机号'),
  verificationCode: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, '验证码格式不正确'),
  countryCode: z
    .string()
    .trim()
    .regex(/^\+\d{1,4}$/)
    .optional(),
});

export const wechatLoginPayloadSchema = z.object({
  code: nonEmptyStringSchema.max(512),
  state: nonEmptyStringSchema.max(256).optional(),
});

export const loginPayloadSchema = z.union([phoneLoginPayloadSchema, wechatLoginPayloadSchema]);

export type PhoneLoginPayloadSchemaInput = z.input<typeof phoneLoginPayloadSchema>;
export type AuthSessionSchemaOutput = z.output<typeof authSessionSchema>;
