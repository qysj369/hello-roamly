import type { AxiosError } from 'axios';
import type { DeepSeekErrorResponse } from '@/types/api/deepseek';

export class DeepSeekApiError extends Error {
  readonly status?: number;

  readonly code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = 'DeepSeekApiError';
    this.status = options?.status;
    this.code = options?.code;
  }
}

export function parseDeepSeekError(error: unknown): DeepSeekApiError {
  if (error instanceof DeepSeekApiError) {
    return error;
  }

  const axiosError = error as AxiosError<DeepSeekErrorResponse>;
  const status = axiosError.response?.status;
  const payload = axiosError.response?.data;
  const apiMessage = payload?.error?.message?.trim();
  const apiCode = payload?.error?.code;

  if (status === 401) {
    return new DeepSeekApiError('DeepSeek API Key 无效或未授权', { status, code: apiCode });
  }
  if (status === 429) {
    return new DeepSeekApiError('DeepSeek 请求过于频繁，请稍后再试', { status, code: apiCode });
  }
  if (apiMessage) {
    return new DeepSeekApiError(apiMessage, { status, code: apiCode });
  }
  if (axiosError.code === 'ECONNABORTED') {
    return new DeepSeekApiError('DeepSeek 请求超时，请稍后重试');
  }
  if (error instanceof Error && error.message) {
    return new DeepSeekApiError(error.message, { status });
  }

  return new DeepSeekApiError('DeepSeek 服务暂时不可用');
}
