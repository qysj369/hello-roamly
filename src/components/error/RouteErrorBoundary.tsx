import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import ErrorBoundary from '@/components/error/ErrorBoundary';

export type RouteErrorBoundaryProps = {
  children: ReactNode;
};

/** 路由级错误边界：切换 path 时自动 reset */
export default function RouteErrorBoundary({ children }: RouteErrorBoundaryProps) {
  const { pathname } = useLocation();

  return (
    <ErrorBoundary
      boundary="route"
      resetKeys={[pathname]}
      fallbackTitle="页面暂时无法显示"
      fallbackDescription="请刷新或返回其他页面继续浏览"
      compact
    >
      {children}
    </ErrorBoundary>
  );
}
