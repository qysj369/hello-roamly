import type { ReactNode } from 'react';
import { PAGE_CONTAINER_PADDING_MATCHED } from '@/lib/layout/pageLayout';
import { cn } from '@/utils/cn';

type HomeImmersiveShellProps = {
  children: ReactNode;
};

/** 首页容器 — 纯色背景，无粒子/毛玻璃 */
export default function HomeImmersiveShell({ children }: HomeImmersiveShellProps) {
  return (
    <div className={cn('home-page-shell min-h-[70dvh] pb-6', PAGE_CONTAINER_PADDING_MATCHED)}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">{children}</div>
    </div>
  );
}
