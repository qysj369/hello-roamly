import { captureException } from '@/lib/errors/sentry';
import { isSentryEnabled } from '@/lib/errors/sentryConfig';
import { normalizeError } from '@/lib/errors/normalizeError';
import type { ErrorReportContext } from '@/lib/errors/types';

/**
 * 统一错误上报：开发环境打控制台；生产（或 SENTRY_DEBUG）上报 Sentry。
 * 用户可见文案请使用 `getUserFacingErrorMessage`，勿把堆栈展示给用户。
 */
export function reportError(error: unknown, context?: ErrorReportContext): void {
  const normalized = normalizeError(error);
  const payload = {
    name: normalized.name,
    message: normalized.message,
    stack: normalized.stack,
    ...context,
  };

  if (import.meta.env.DEV) {
    console.error('[hello-roamly:error]', payload);
  } else if (!isSentryEnabled()) {
    console.error('[hello-roamly:error]', normalized.message, context?.boundary ?? 'app');
  }

  captureException(error, context);
}
