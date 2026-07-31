import { Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import RoutePageFallback from '@/router/RoutePageFallback';

/** 为 React.lazy 页面包裹 Suspense */
export function withRouteSuspense(LazyComponent: LazyExoticComponent<ComponentType>) {
  return function RouteLazyPage() {
    return (
      <Suspense fallback={<RoutePageFallback />}>
        <LazyComponent />
      </Suspense>
    );
  };
}
