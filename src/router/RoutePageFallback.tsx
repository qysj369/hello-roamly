import { Loader2 } from 'lucide-react';

/** 路由懒加载时的统一占位 */
export default function RoutePageFallback() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-8 w-8 animate-spin text-violet-600" aria-hidden />
      <p className="text-sm text-slate-500">页面加载中…</p>
    </div>
  );
}
