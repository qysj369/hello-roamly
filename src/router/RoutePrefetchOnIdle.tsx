import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { IDLE_PREFETCH_PATHS, prefetchRoutesOnIdle } from '@/router/routePrefetch';

/**
 * 首屏稳定后空闲预加载底栏常用路由 chunk。
 * 跳过当前页，避免与正在显示的 bundle 争抢带宽。
 */
export default function RoutePrefetchOnIdle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const routes = IDLE_PREFETCH_PATHS.filter((path) => path !== pathname);
    prefetchRoutesOnIdle(routes);
  }, [pathname]);

  return null;
}
