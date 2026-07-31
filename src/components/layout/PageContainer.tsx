import type { ReactNode } from 'react';
import {
  PAGE_CONTAINER_MAX_WIDTH,
  PAGE_CONTAINER_PADDING_X,
} from '@/lib/layout/pageLayout';
import { cn } from '@/utils/cn';

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

/** 页面根容器：居中列宽、底栏安全留白 */
export default function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto flex min-h-dvh flex-col overflow-x-clip pb-24 pt-6 lg:pb-10',
        PAGE_CONTAINER_MAX_WIDTH,
        PAGE_CONTAINER_PADDING_X,
        className,
      )}
    >
      {children}
    </div>
  );
}
