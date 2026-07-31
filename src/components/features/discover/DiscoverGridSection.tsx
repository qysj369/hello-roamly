import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

export type DiscoverGridSectionProps = {
  id: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  href?: string;
  linkLabel?: string;
  count?: number;
  sortHint?: string;
  children: ReactNode;
  className?: string;
};

export default function DiscoverGridSection({
  id,
  title,
  subtitle,
  icon: Icon,
  href,
  linkLabel = '查看更多',
  count,
  sortHint,
  children,
  className,
}: DiscoverGridSectionProps) {
  return (
    <section className={cn('space-y-3', className)} aria-labelledby={id}>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <h2 id={id} className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Icon className="h-4 w-4 shrink-0 text-violet-600" aria-hidden />
            {title}
            {count != null && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {count}
              </span>
            )}
          </h2>
          {(subtitle || sortHint) && (
            <p className="mt-0.5 text-xs text-slate-500">
              {subtitle}
              {subtitle && sortHint && ' · '}
              {sortHint && <span className="text-violet-600/90">{sortHint}</span>}
            </p>
          )}
        </div>
        {href && (
          <Link to={href} className="shrink-0 text-xs font-medium text-violet-700 hover:underline">
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
