import { clearStoredAccessToken } from '@/lib/api/auth';
import { ensureApiError, isApiError } from '@/lib/api/errors';
import { getUserFacingErrorMessage } from '@/lib/errors/userFacingMessage';
import { reportError } from '@/lib/errors';
import { showGlobalApiError } from '@/stores/apiErrorStore';

export type ApiErrorHandlerContext = {
  /** query 默认仅上报；mutation 可弹出全局提示 */
  source?: 'http' | 'query' | 'mutation';
  /** 跳过上报与全局 UI */
  silent?: boolean;
  queryKey?: unknown;
  mutationKey?: unknown;
};

function shouldShowGlobalToast(context?: ApiErrorHandlerContext): boolean {
  if (context?.silent) {
    return false;
  }
  return context?.source === 'mutation';
}

function maybeHandleUnauthorized(error: ReturnType<typeof ensureApiError>): void {
  if (!error.isUnauthorized) {
    return;
  }
  clearStoredAccessToken();
}

/**
 * 统一 API 错误处理：规范化、上报、可选全局提示。
 * 返回适合展示给用户的消息。
 */
export function handleApiError(error: unknown, handlerContext?: ApiErrorHandlerContext): string {
  const apiError = ensureApiError(error);
  const userContext = handlerContext?.source === 'mutation' ? 'mutation' : 'default';
  const message = getUserFacingErrorMessage(apiError, userContext);

  maybeHandleUnauthorized(apiError);

  if (!handlerContext?.silent) {
    reportError(apiError, {
      tags: {
        source: handlerContext?.source ?? 'http',
        status: apiError.status !== undefined ? String(apiError.status) : 'none',
        kind: apiError.kind,
      },
      extra: {
        queryKey: handlerContext?.queryKey,
        mutationKey: handlerContext?.mutationKey,
      },
      fingerprint: [
        'api',
        handlerContext?.source ?? 'http',
        String(apiError.status ?? apiError.kind),
      ],
    });
  }

  if (shouldShowGlobalToast(handlerContext)) {
    showGlobalApiError(message);
  }

  return message;
}

export function handleQueryApiError(error: unknown, queryKey: unknown): string {
  return handleApiError(error, { source: 'query', queryKey, silent: false });
}

export function handleMutationApiError(error: unknown, mutationKey: unknown): string {
  return handleApiError(error, { source: 'mutation', mutationKey, silent: false });
}

/** 供组件判断是否为可重试的 API 错误 */
export function isRetryableApiError(error: unknown): boolean {
  return isApiError(error) && error.isRetryable;
}
