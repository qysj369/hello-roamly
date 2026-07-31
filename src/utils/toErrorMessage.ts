import { getUserFacingErrorMessage, type UserErrorContext } from '@/lib/errors/userFacingMessage';

/** 将未知错误转为用户可读文案（统一走友好化规则） */
export function toErrorMessage(
  error: unknown,
  fallback = '操作失败，请稍后再试',
  context: UserErrorContext = 'default',
): string {
  return getUserFacingErrorMessage(error, context, { fallback });
}
