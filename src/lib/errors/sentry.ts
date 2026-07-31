import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import { isApiError } from '@/lib/api/errors';
import { normalizeError } from '@/lib/errors/normalizeError';
import {
  getSentryDsn,
  getSentryEnvironment,
  getSentryRelease,
  getSentryTracesSampleRate,
  isSentryEnabled,
} from '@/lib/errors/sentryConfig';
import type { ErrorReportContext } from '@/lib/errors/types';

let initialized = false;

const SENSITIVE_KEY_PATTERN = /authorization|token|password|secret|api[_-]?key/i;

function scrubSensitiveValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEY_PATTERN.test(key)) {
    return '[Filtered]';
  }
  return value;
}

function shouldDropError(error: unknown): boolean {
  if (isApiError(error) && error.kind === 'cancel') {
    return true;
  }
  return false;
}

/** 初始化 Sentry（在 `main.tsx` 最早调用） */
export function initSentry(): void {
  if (initialized || !isSentryEnabled()) {
    return;
  }

  const dsn = getSentryDsn();
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: getSentryEnvironment(),
    release: getSentryRelease(),
    enabled: true,
    integrations: [
      Sentry.reactRouterV7BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: getSentryTracesSampleRate(),
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: import.meta.env.PROD ? 0.25 : 0,
    sendDefaultPii: false,
    beforeSend(event, hint) {
      const original = hint.originalException;
      if (shouldDropError(original)) {
        return null;
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.data) {
        const next: Record<string, unknown> = {};
        Object.entries(breadcrumb.data).forEach(([key, value]) => {
          next[key] = scrubSensitiveValue(key, value);
        });
        return { ...breadcrumb, data: next };
      }
      return breadcrumb;
    },
  });

  initialized = true;
}

function applyReportContext(scope: Sentry.Scope, context?: ErrorReportContext): void {
  if (context?.boundary) {
    scope.setTag('boundary', context.boundary);
  }
  if (context?.componentStack) {
    scope.setExtra('componentStack', context.componentStack);
  }
  if (context?.tags) {
    Object.entries(context.tags).forEach(([key, value]) => {
      scope.setTag(key, value);
    });
  }
  if (context?.extra) {
    Object.entries(context.extra).forEach(([key, value]) => {
      scope.setExtra(key, scrubSensitiveValue(key, value));
    });
  }
  if (context?.fingerprint?.length) {
    scope.setFingerprint(context.fingerprint);
  }
}

/** 上报异常到 Sentry（需已 init 且启用） */
export function captureException(error: unknown, context?: ErrorReportContext): void {
  if (!isSentryEnabled() || shouldDropError(error)) {
    return;
  }

  if (!initialized) {
    initSentry();
  }

  const normalized = normalizeError(error);

  Sentry.withScope((scope) => {
    applyReportContext(scope, context);

    if (isApiError(error)) {
      scope.setTag('api.kind', error.kind);
      if (error.status !== undefined) {
        scope.setTag('api.status', String(error.status));
      }
      if (error.code) {
        scope.setTag('api.code', error.code);
      }
      if (error.url) {
        scope.setExtra('api.url', error.url);
      }
    }

    Sentry.captureException(normalized);
  });
}

export { isSentryEnabled } from '@/lib/errors/sentryConfig';
