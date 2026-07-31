import type { ReactNode } from 'react';
import SnailSlangTerm from '@/components/features/community/SnailSlangTerm';
import { cn } from '@/utils/cn';

type StructuredGuideConstitutionCardProps = {
  cardNumber: 1 | 2 | 3;
  title: string;
  /** 标题内嵌黑话词条（如蜗牛启示） */
  titleSlangId?: string;
  subtitle?: string;
  id: string;
  children: ReactNode;
  className?: string;
};

/** 宪法三卡容器 — 发布器与详情页展示共用 */
export default function StructuredGuideConstitutionCard({
  cardNumber,
  title,
  titleSlangId,
  subtitle,
  id,
  children,
  className,
}: StructuredGuideConstitutionCardProps) {
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-24 overflow-hidden rounded-2xl border-2 border-slate-200/90 bg-white shadow-sm',
        className,
      )}
    >
      <header className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-emerald-50/40 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-6 min-w-[2.5rem] items-center justify-center rounded-md bg-emerald-600 px-2 text-[10px] font-bold uppercase tracking-wide text-white">
            卡{cardNumber}
          </span>
          <h3 className="text-base font-bold text-slate-900">
            {titleSlangId ? (
              <>
                【<SnailSlangTerm id={titleSlangId} />】
              </>
            ) : (
              title
            )}
          </h3>
        </div>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}