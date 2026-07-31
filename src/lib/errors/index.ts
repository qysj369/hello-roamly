export { getErrorMessage, normalizeError, shouldShowErrorDetails } from '@/lib/errors/normalizeError';
export { reportError } from '@/lib/errors/reportError';
export { captureException, initSentry, isSentryEnabled } from '@/lib/errors/sentry';
export {
  getSentryDsn,
  getSentryEnvironment,
  getSentryRelease,
} from '@/lib/errors/sentryConfig';
export type { ErrorFallbackRenderProps, ErrorReportContext } from '@/lib/errors/types';

export { getApiErrorMessage, getHttpErrorMessage, isApiError, ApiError } from '@/lib/api/errors';
export type { ApiErrorKind, ApiErrorPayload } from '@/lib/api/errors';
export {
  getUserFacingBoundaryCopy,
  getUserFacingErrorMessage,
  resolveUserFacingError,
} from '@/lib/errors/userFacingMessage';
export type { UserErrorContext, UserFacingError } from '@/lib/errors/userFacingMessage';
