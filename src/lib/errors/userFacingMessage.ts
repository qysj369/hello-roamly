import { isApiError, type ApiError } from '@/lib/api/errors';
import { copy } from '@/content/copy';
import { ContentModerationRejectedError } from '@/lib/moderation/errors';
import { getErrorMessage } from '@/lib/errors/normalizeError';
import { DeepSeekApiError } from '@/services/ai/deepseek/errors';

export type UserErrorContext =
  | 'default'
  | 'guide'
  | 'invite'
  | 'payment'
  | 'chat'
  | 'map'
  | 'profile'
  | 'mutation';

export type UserFacingError = {
  title: string;
  message: string;
  hint?: string;
  canRetry: boolean;
};

type ResolveOptions = {
  fallback?: string;
};

const TECHNICAL_PATTERNS: RegExp[] = [
  /^Request failed with status code \d+$/i,
  /^Network Error$/i,
  /^timeout of \d+ms exceeded$/i,
  /^AxiosError/i,
  /^ECONNABORTED/i,
  /^ERR_[A-Z_]+$/i,
  /\bat\s+\S+\s*\(/i,
  /\.(ts|tsx|js|jsx):\d+/i,
  /^https?:\/\//i,
];

function isUserFriendlyMessage(message: string): boolean {
  const trimmed = message.trim();
  if (trimmed.length < 2 || trimmed.length > 120) {
    return false;
  }
  if (TECHNICAL_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return false;
  }
  if (trimmed.includes('VITE_') || trimmed.includes('API Key')) {
    return false;
  }
  if (/[\u4e00-\u9fff]/.test(trimmed)) {
    return true;
  }
  return /^[a-zA-Z0-9\s.,!?'"()\-–—、。，！？%]{3,80}$/.test(trimmed);
}

function titleForContext(context: UserErrorContext): string {
  return copy.errors.titles[context] ?? copy.errors.titles.default;
}

function hintForContext(context: UserErrorContext): string | undefined {
  if (context === 'default' || context === 'mutation') {
    return undefined;
  }
  return copy.errors.hints[context];
}

function messageFromApiError(error: ApiError, context: UserErrorContext, fallback: string): string {
  if (error.kind === 'network') {
    return copy.errors.network;
  }
  if (error.kind === 'timeout') {
    return copy.errors.timeout;
  }
  if (error.kind === 'cancel') {
    return copy.errors.canceled;
  }

  if (error.isUnauthorized) {
    return copy.errors.unauthorized;
  }
  if (error.isForbidden) {
    return copy.errors.forbidden;
  }
  if (error.isNotFound) {
    return copy.errors.notFound;
  }
  if (error.status === 409) {
    return copy.errors.conflict;
  }
  if (error.status === 422) {
    return copy.errors.validation;
  }
  if (error.status === 429) {
    return copy.errors.rateLimit;
  }
  if (error.isServerError) {
    return copy.errors.server;
  }

  if (isUserFriendlyMessage(error.message)) {
    return error.message.trim();
  }

  if (context !== 'default') {
    return fallback;
  }

  return copy.errors.defaultMessage;
}

function messageFromDeepSeek(error: DeepSeekApiError): string {
  if (error.status === 429) {
    return copy.errors.rateLimit;
  }
  if (error.message.includes('API Key') || error.message.includes('未授权')) {
    return import.meta.env.DEV
      ? error.message
      : 'AI 助手暂未就绪，请稍后再试';
  }
  if (isUserFriendlyMessage(error.message)) {
    return error.message.trim();
  }
  return 'AI 暂时无法回复，请稍后再试';
}

function canRetryError(error: unknown): boolean {
  if (isApiError(error)) {
    return error.isRetryable;
  }
  if (error instanceof DeepSeekApiError) {
    return error.status === undefined || error.status >= 500 || error.status === 429;
  }
  return true;
}

/** 解析为带标题、说明与是否可重试的结构化用户提示 */
export function resolveUserFacingError(
  error: unknown,
  context: UserErrorContext = 'default',
  options?: ResolveOptions,
): UserFacingError {
  const fallback = options?.fallback ?? copy.errors.defaultMessage;
  const title = titleForContext(context);
  const hint = hintForContext(context);

  if (error instanceof ContentModerationRejectedError) {
    return {
      title: '内容未通过审核',
      message: error.message.trim() || '请修改措辞后重新发送',
      canRetry: true,
    };
  }

  if (error instanceof DeepSeekApiError) {
    return {
      title: copy.errors.titles.chat,
      message: messageFromDeepSeek(error),
      hint: copy.errors.hints.chat,
      canRetry: canRetryError(error),
    };
  }

  if (isApiError(error)) {
    return {
      title,
      message: messageFromApiError(error, context, fallback),
      hint,
      canRetry: canRetryError(error),
    };
  }

  const raw = getErrorMessage(error, fallback);
  const message = isUserFriendlyMessage(raw) ? raw : fallback;

  return {
    title,
    message,
    hint,
    canRetry: canRetryError(error),
  };
}

/** 仅返回用户可见的一句说明（组件与 AsyncFeedback 最常用） */
export function getUserFacingErrorMessage(
  error: unknown,
  context: UserErrorContext = 'default',
  options?: ResolveOptions,
): string {
  return resolveUserFacingError(error, context, options).message;
}

/** ErrorBoundary 等场景：标题 + 说明 */
export function getUserFacingBoundaryCopy(compact = false): { title: string; message: string } {
  return {
    title: compact ? copy.errors.boundarySection : copy.errors.boundaryPage,
    message: copy.errors.defaultMessage,
  };
}
