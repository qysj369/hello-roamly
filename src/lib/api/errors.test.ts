import { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
import { ApiError, getApiErrorMessage, parseAxiosError } from '@/lib/api/errors';

function createAxiosError(
  partial: Partial<{
    status: number;
    data: unknown;
    code: string;
    message: string;
  }> = {},
): AxiosError {
  const config = { url: '/test', method: 'get' } as InternalAxiosRequestConfig;
  if (partial.code === 'ECONNABORTED') {
    return new AxiosError(partial.message ?? 'timeout', 'ECONNABORTED', config);
  }
  return new AxiosError(
    partial.message ?? 'Request failed',
    undefined,
    config,
    undefined,
    partial.status
      ? {
          status: partial.status,
          statusText: 'Error',
          headers: {},
          config,
          data: partial.data,
        }
      : undefined,
  );
}

describe('parseAxiosError', () => {
  it('maps backend message from JSON body', () => {
    const error = parseAxiosError(
      createAxiosError({ status: 400, data: { message: '  参数无效  ' } }),
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('参数无效');
    expect(error.status).toBe(400);
    expect(error.kind).toBe('http');
  });

  it('maps network failures', () => {
    const error = parseAxiosError(createAxiosError({ message: 'Network Error' }));
    expect(error.kind).toBe('network');
    expect(error.message).toContain('网络');
  });

  it('maps timeout', () => {
    const error = parseAxiosError(createAxiosError({ code: 'ECONNABORTED' }));
    expect(error.kind).toBe('timeout');
  });

  it('maps 401 status', () => {
    const error = parseAxiosError(createAxiosError({ status: 401 }));
    expect(error.isUnauthorized).toBe(true);
    expect(error.message).toContain('未授权');
  });
});

describe('getApiErrorMessage', () => {
  it('reads ApiError message', () => {
    const error = new ApiError({ message: '余额不足' });
    expect(getApiErrorMessage(error)).toBe('余额不足');
  });
});
