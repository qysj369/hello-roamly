import type { ZodError, ZodType } from 'zod';
import type { GuestUser, User } from '@/types/domain/user';
import { guestUserSchema, registeredUserSchema, userSchema } from '@/schemas/user/user';

export type ParseResult<T> = { success: true; data: T } | { success: false; error: ZodError };

function safeParseWithSchema<T>(schema: ZodType<T>, input: unknown): ParseResult<T> {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function parseUser(input: unknown): User {
  return userSchema.parse(input) as User;
}

export function safeParseUser(input: unknown): ParseResult<User> {
  return safeParseWithSchema(userSchema as ZodType<User>, input);
}

export function parseRegisteredUser(input: unknown): User {
  return registeredUserSchema.parse(input) as User;
}

export function safeParseRegisteredUser(input: unknown): ParseResult<User> {
  return safeParseWithSchema(registeredUserSchema as ZodType<User>, input);
}

export function parseGuestUser(input: unknown): GuestUser {
  return guestUserSchema.parse(input) as GuestUser;
}

export function safeParseGuestUser(input: unknown): ParseResult<GuestUser> {
  return safeParseWithSchema(guestUserSchema as ZodType<GuestUser>, input);
}

/** 将 Zod 错误转为表单字段消息 */
export function formatZodError(error: ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((acc, issue) => {
    const path = issue.path.join('.') || '_root';
    return acc[path] ? acc : { ...acc, [path]: issue.message };
  }, {});
}
