import { afterEach, describe, expect, it, vi } from 'vitest';

describe('isSentryEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('is false without DSN', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    const { isSentryEnabled } = await import('@/lib/errors/sentryConfig');
    expect(isSentryEnabled()).toBe(false);
  });

  it('is false in dev unless debug flag is set', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://key@o0.ingest.sentry.io/1');
    vi.stubEnv('DEV', true);
    vi.stubEnv('PROD', false);
    vi.stubEnv('VITE_SENTRY_DEBUG', '');
    const { isSentryEnabled } = await import('@/lib/errors/sentryConfig');
    expect(isSentryEnabled()).toBe(false);
  });

  it('is true in dev when debug flag is set', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://key@o0.ingest.sentry.io/1');
    vi.stubEnv('DEV', true);
    vi.stubEnv('PROD', false);
    vi.stubEnv('VITE_SENTRY_DEBUG', '1');
    const { isSentryEnabled } = await import('@/lib/errors/sentryConfig');
    expect(isSentryEnabled()).toBe(true);
  });

  it('is false when explicitly disabled', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://key@o0.ingest.sentry.io/1');
    vi.stubEnv('PROD', true);
    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_SENTRY_ENABLED', '0');
    const { isSentryEnabled } = await import('@/lib/errors/sentryConfig');
    expect(isSentryEnabled()).toBe(false);
  });
});
