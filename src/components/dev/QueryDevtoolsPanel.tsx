import { lazy, Suspense } from 'react';

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((mod) => ({
        default: mod.ReactQueryDevtools,
      })),
    )
  : () => null;

function isHomeCockpitPath(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return path === '/';
}

export default function QueryDevtoolsPanel() {
  if (!import.meta.env.DEV || isHomeCockpitPath()) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </Suspense>
  );
}
