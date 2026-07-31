import axios, { type AxiosError } from 'axios';
import { getAccessToken } from '@/lib/api/auth';
import { parseAxiosError } from '@/lib/api/errors';

export { getApiErrorMessage, getHttpErrorMessage, isApiError, ApiError } from '@/lib/api/errors';
export type { ApiErrorKind, ApiErrorPayload } from '@/lib/api/errors';
import { readEnv } from '@/lib/config/env';

export const http = axios.create({
  baseURL: readEnv('VITE_API_BASE_URL'),
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    config.headers.set('X-Request-Id', crypto.randomUUID());
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(parseAxiosError(error)),
);
