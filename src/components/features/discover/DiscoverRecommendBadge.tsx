import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { isStrongRecommendation } from '@/utils/discoverRecommend';
import { cn } from '@/utils/cn';

export type DiscoverRecommendBadgeProps = {
  score: number;
  reasons?: string[];
  className?: string;
  /** 可展开查看全部推荐原因（用于卡片内，需阻止跳转） */
  interactive?: boolean;
};

export default function DiscoverRecommendBadge({
  score,
  reasons = [],
  className,
  interactive = false,
}: DiscoverRecommendBadgeProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  if (!isStrongRecommendation(score) && reasons.length === 0) {
    return null;
  }

  const label = reasons[0] ?? '为你推荐';
  const showScore = score > 0;

  const badge = (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1 rounded-full bg-[#2c6b58]/95 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm',
        interactive && 'cursor-pointer ring-2 ring-transparent hover:ring-white/40',
        className,
      )}
      title={interactive ? undefined : reasons.join(' · ')}
    >
      <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
    </span>
  );

  if (!interactive) {
    return badge;
  }

  return (
    <span ref={rootRef} className="relative inline-flex max-w-[min(100%,11rem)]">
      <button
        type="button"
        className="inline-flex max-w-full border-0 bg-transparent p-0 text-left"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={(event) => {
          // 卡片整体可点击跳转；展开原因时需阻止冒泡，避免误进详情
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        {badge}
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-slate-200 bg-white p-2.5 text-left shadow-sm"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          {showScore && (
            <p className="text-[10px] font-semibold text-[#2c6b58]">匹配度 {score}</p>
          )}
          {reasons.length > 0 ? (
            <ul className="mt-1 space-y-1">
              {reasons.map((reason) => (
                <li key={reason} className="text-[10px] leading-snug text-slate-600">
                  · {reason}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[10px] text-slate-500">综合兴趣与足迹为你挑选</p>
          )}
        </div>
      )}
    </span>
  );
}
