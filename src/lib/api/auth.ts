import { readEnv } from '@/lib/config/env';

const STORAGE_KEY = 'hello-roamly:access-token';

/** 环境变量中的开发用 Bearer Token（勿提交真实密钥） */
export function getEnvAccessToken(): string | undefined {
  return readEnv('VITE_API_TOKEN');
}

export function getStoredAccessToken(): string | undefined {
  try {
    const token = localStorage.getItem(STORAGE_KEY)?.trim();
    return token || undefined;
  } catch {
    return undefined;
  }
}

/** 优先 localStorage，其次 .env.local 中的 VITE_API_TOKEN */
export function getAccessToken(): string | undefined {
  return getStoredAccessToken() ?? getEnvAccessToken();
}

export function setStoredAccessToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token.trim());
}

export function clearStoredAccessToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasAccessToken(): boolean {
  return Boolean(getAccessToken());
}
