import type { ReactNode } from 'react';
import ErrorBoundary from '@/components/error/ErrorBoundary';

export type RootErrorBoundaryProps = {
  children: ReactNode;
};

/** 应用根错误边界：包裹 Router / 全局子树 */
export default function RootErrorBoundary({ children }: RootErrorBoundaryProps) {
  return (
    <ErrorBoundary boundary="root" fallbackTitle="应用遇到了问题">
      {children}
    </ErrorBoundary>
  );
}
