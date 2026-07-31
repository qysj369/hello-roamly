import axios, { type AxiosError } from 'axios';
import { getErrorMessage, normalizeError } from '@/lib/errors/normalizeError';

export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'cancel' | 'unknown';

/** 常见后端错误 JSON 结构 */
export type ApiErrorPayload = {
  message?: string;
  error?: string;
  code?: string;
  requestId?: string;
  errors?: Array<{ field?: string; message?: string }>;
};

export type ApiErrorOptions = {
  message: string;
  kind?: ApiErrorKind;
  status?: number;
  code?: string;
  requestId?: string;
  url?: string;
  method?: string;
  payload?: ApiErrorPayload;
  cause?: unknown;
};

/**
 * 统一 API 错误类型（由 Axios 拦截器抛出）。
 * 组件与 React Query 请用 `getApiErrorMessage(error)` 展示文案。
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;

  readonly status?: number;

  readonly code?: string;

  readonly requestId?: string;

  readonly url?: string;

  readonly method?: string;

  readonly payload?: ApiErrorPayload;

  constructor(options: ApiErrorOptions) {
    super(options.message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = 'ApiError';
    this.kind = options.kind ?? 'unknown';
    this.status = options.status;
    this.code = options.code;
    this.requestId = options.requestId;
    this.url = options.url;
    this.method = options.method;
    this.payload = options.payload;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isServerError(): boolean {
    return this.status !== undefined && this.status >= 500;
  }

  get isRetryable(): boolean {
    return this.kind === 'network' || this.kind === 'timeout' || this.isServerError;
  }
}

function extractPayload(data: unknown): ApiErrorPayload | undefined {
  if (!data || typeof data !== 'object') {
    return undefined;
  }
  return data as ApiErrorPayload;
}

function messageFromPayload(payload: ApiErrorPayload | undefined): string | undefined {
  if (!payload) {
    return undefined;
  }

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message.trim();
  }

  if (typeof payload.error === 'string' && payload.error.trim()) {
    return payload.error.trim();
  }

  const fieldErrors = payload.errors
    ?.map((row) => row.message?.trim())
    .filter((msg): msg is string => Boolean(msg));

  if (fieldErrors?.length) {
    return fieldErrors.join('；');
  }

  return undefined;
}

function statusFallbackMessage(status: number | undefined): string | undefined {
  if (status === 400) {
    return '请求参数有误';
  }
  if (status === 401) {
    return '未授权：请检查登录或 Access Token';
  }
  if (status === 403) {
    return '无权限访问该资源';
  }
  if (status === 404) {
    return '请求的资源不存在';
  }
  if (status === 409) {
    return '操作冲突，请刷新后重试';
  }
  if (status === 422) {
    return '提交的数据无法处理';
  }
  if (status === 429) {
    return '请求过于频繁，请稍后再试';
  }
  if (status && status >= 500) {
    return `服务器错误（${status}）`;
  }
  return undefined;
}

/** 将 Axios 错误解析为 ApiError */
export function parseAxiosError(error: AxiosError): ApiError {
  const url = error.config?.url;
  const method = error.config?.method?.toUpperCase();
  const requestId =
    (error.response?.headers?.['x-request-id'] as string | undefined) ??
    (error.config?.headers?.['X-Request-Id'] as string | undefined);

  if (axios.isCancel(error)) {
    return new ApiError({
      message: '请求已取消',
      kind: 'cancel',
      url,
      method,
      requestId,
      cause: error,
    });
  }

  if (error.code === 'ECONNABORTED') {
    return new ApiError({
      message: '请求超时，请检查网络后重试',
      kind: 'timeout',
      url,
      method,
      requestId,
      cause: error,
    });
  }

  if (!error.response) {
    return new ApiError({
      message: '网络连接失败，请检查网络后重试',
      kind: 'network',
      url,
      method,
      requestId,
      cause: error,
    });
  }

  const status = error.response.status;
  const payload = extractPayload(error.response.data);
  const message =
    (typeof error.response.data === 'string' && error.response.data.trim()) ||
    messageFromPayload(payload) ||
    statusFallbackMessage(status) ||
    error.message ||
    '网络请求失败';

  return new ApiError({
    message,
    kind: 'http',
    status,
    code: payload?.code,
    requestId: payload?.requestId ?? requestId,
    url,
    method,
    payload,
    cause: error,
  });
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** 将任意错误规范为 ApiError（非 Axios 则包装为 unknown） */
export function ensureApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }
  const normalized = normalizeError(error);
  return new ApiError({
    message: normalized.message,
    kind: 'unknown',
    cause: error,
  });
}

/** 面向用户/API 层的错误文案 */
export function getApiErrorMessage(error: unknown, fallback = '网络请求失败'): string {
  if (isApiError(error)) {
    return error.message || fallback;
  }
  return getErrorMessage(error, fallback);
}

/** @deprecated 使用 getApiErrorMessage */
export const getHttpErrorMessage = getApiErrorMessage;
