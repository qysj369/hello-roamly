/** 上报错误时的附加上下文 */
export type ErrorReportContext = {
  componentStack?: string | null;
  boundary?: 'root' | 'route' | 'section';
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  /** Sentry 分组指纹 */
  fingerprint?: string[];
};

/** ErrorBoundary 自定义 fallback 接收的参数 */
export type ErrorFallbackRenderProps = {
  error: Error;
  reset: () => void;
};
