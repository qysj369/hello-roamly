import { z } from 'zod';
import { httpUrlSchema, userIdSchema } from '@/schemas/shared';

export const usernameSchema = z
  .string()
  .trim()
  .min(2, '用户名至少 2 个字符')
  .max(30, '用户名最多 30 个字符')
  .regex(/^[\w\u4e00-\u9fa5-]+$/, '仅支持字母、数字、中文、下划线与连字符');

export const emailSchema = z.email('请输入有效邮箱').max(254);

export const bioSchema = z.string().trim().max(120, '个性签名最多 120 字');

export const userBasicInfoSchema = z.object({
  id: userIdSchema,
  username: usernameSchema,
  email: emailSchema,
  avatar: httpUrlSchema.optional(),
  bio: bioSchema.optional(),
});

export const updateUserBasicInfoSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    avatar: httpUrlSchema.nullable().optional(),
    bio: bioSchema,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: '至少更新一项基础信息',
  });

export type UserBasicInfoSchemaOutput = z.output<typeof userBasicInfoSchema>;
export type UpdateUserBasicInfoSchemaInput = z.input<typeof updateUserBasicInfoSchema>;
