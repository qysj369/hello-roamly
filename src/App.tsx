import { RouterProvider } from 'react-router-dom';
import { RootErrorBoundary } from '@/components/error';
import { appRouter } from '@/router';

/**
 * 应用根组件：挂载客户端路由。
 * 全局 Provider（React Query 等）在 `main.tsx` 的 `AppProviders` 中包裹本组件。
 */
export default function App() {
  return (
    <RootErrorBoundary>
      <RouterProvider router={appRouter} />
    </RootErrorBoundary>
  );
}
