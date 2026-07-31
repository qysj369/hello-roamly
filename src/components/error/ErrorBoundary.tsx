import { Component, type ErrorInfo, type ReactNode } from 'react';
import ErrorFallback from '@/components/error/ErrorFallback';
import { reportError } from '@/lib/errors';
import type { ErrorFallbackRenderProps, ErrorReportContext } from '@/lib/errors';

export type ErrorBoundaryProps = {
  children: ReactNode;
  /** 用于区分上报来源 */
  boundary?: ErrorReportContext['boundary'];
  /** 自定义 fallback；不传则使用默认 ErrorFallback */
  fallback?: ReactNode | ((props: ErrorFallbackRenderProps) => ReactNode);
  /** 与上次不同时自动 reset（常用于路由 pathname） */
  resetKeys?: readonly unknown[];
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  /** 传给默认 ErrorFallback */
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackClassName?: string;
  compact?: boolean;
};

type ErrorBoundaryState = {
  error: Error | null;
};

function keysChanged(prev: readonly unknown[] | undefined, next: readonly unknown[] | undefined): boolean {
  if (prev === next) {
    return false;
  }
  if (!prev || !next || prev.length !== next.length) {
    return true;
  }
  return prev.some((value, index) => !Object.is(value, next[index]));
}

/**
 * React 错误边界：捕获子树渲染错误，展示 fallback 并统一上报。
 * 不捕获事件处理器、异步、SSR 中的错误。
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { boundary = 'section', onError } = this.props;
    reportError(error, {
      boundary,
      componentStack: errorInfo.componentStack,
    });
    onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { error } = this.state;
    if (error && keysChanged(prevProps.resetKeys, this.props.resetKeys)) {
      this.reset();
    }
  }

  reset = (): void => {
    const { onReset } = this.props;
    this.setState({ error: null });
    onReset?.();
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }

    const {
      fallback,
      fallbackTitle,
      fallbackDescription,
      fallbackClassName,
      compact,
    } = this.props;

    if (typeof fallback === 'function') {
      return fallback({ error, reset: this.reset });
    }

    if (fallback) {
      return fallback;
    }

    return (
      <ErrorFallback
        error={error}
        onReset={this.reset}
        title={fallbackTitle}
        description={fallbackDescription}
        className={fallbackClassName}
        compact={compact}
      />
    );
  }
}
