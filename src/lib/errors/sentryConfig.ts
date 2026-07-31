import { readEnv } from '@/lib/config/env';

function isTruthyFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

function isDisabledFlag(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '0' || normalized === 'false' || normalized === 'no';
}

/** 是否配置了 Sentry DSN */
export function getSentryDsn(): string | undefined {
  return readEnv('VITE_SENTRY_DSN');
}

/**
 * Sentry 是否应启用：
 * - 需配置 VITE_SENTRY_DSN
 * - VITE_SENTRY_ENABLED=0 时强制关闭
 * - 开发环境默认关闭，除非 VITE_SENTRY_DEBUG=1
 */
export function isSentryEnabled(): boolean {
  const dsn = getSentryDsn();
  if (!dsn) {
    return false;
  }
  if (isDisabledFlag(readEnv('VITE_SENTRY_ENABLED'))) {
    return false;
  }
  if (import.meta.env.DEV && !isTruthyFlag(readEnv('VITE_SENTRY_DEBUG'))) {
    return false;
  }
  return true;
}

export function getSentryEnvironment(): string {
  return readEnv('VITE_SENTRY_ENVIRONMENT') ?? import.meta.env.MODE;
}

export function getSentryRelease(): string | undefined {
  return readEnv('VITE_SENTRY_RELEASE');
}

export function getSentryTracesSampleRate(): number {
  const raw = readEnv('VITE_SENTRY_TRACES_SAMPLE_RATE');
  if (!raw) {
    return import.meta.env.PROD ? 0.1 : 1;
  }
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    return 0.1;
  }
  return Math.min(1, Math.max(0, parsed));
}
