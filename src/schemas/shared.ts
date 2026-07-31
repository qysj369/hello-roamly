import { z } from 'zod';

/** 非空字符串（trim 后） */
export const nonEmptyStringSchema = z.string().trim().min(1);

/** ISO 8601 日期时间 */
export const isoDateTimeSchema = z.iso.datetime({ offset: true });

/** 用户 ID */
export const userIdSchema = nonEmptyStringSchema.max(128);

/** 业务实体 ID（计划、动态等） */
export const entityIdSchema = nonEmptyStringSchema.max(128);

/** 游客会话 ID */
export const guestSessionIdSchema = nonEmptyStringSchema.max(128);

/** ISO 3166-1 alpha-2 */
export const countryCodeSchema = z
  .string()
  .trim()
  .length(2)
  .regex(/^[A-Z]{2}$/, '须为两位大写国家/地区代码，如 CN、JP');

/** HTTP(S) URL */
export const httpUrlSchema = z.url({ protocol: /^https?$/ });

/** 非负整数 */
export const nonNegativeIntSchema = z.number().int().min(0);

/** 正整数 */
export const positiveIntSchema = z.number().int().min(1);
