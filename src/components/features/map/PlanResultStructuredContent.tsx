import { AlertTriangle, CalendarDays, Sparkles, Snail } from 'lucide-react';
import AiChatMarkdown from '@/components/features/ai/AiChatMarkdown';
import { parsePlanSections } from '@/lib/plan/parsePlanSections';
import { cn } from '@/utils/cn';

type PlanResultStructuredContentProps = {
  content: string;
  planStreaming?: boolean;
  className?: string;
};

const SECTIONS = [
  {
    key: 'itinerary' as const,
    label: '行程流水账',
    icon: CalendarDays,
    accent: 'border-emerald-200 bg-emerald-50/50',
    titleClass: 'text-emerald-800',
  },
  {
    key: 'snailTips' as const,
    label: '蜗牛提示',
    icon: Snail,
    accent: 'border-violet-200 bg-violet-50/50',
    titleClass: 'text-violet-800',
  },
  {
    key: 'pitfalls' as const,
    label: '避坑指南',
    icon: AlertTriangle,
    accent: 'border-amber-200 bg-amber-50/50',
    titleClass: 'text-amber-900',
  },
] as const;

export default function PlanResultStructuredContent({
  content,
  planStreaming = false,
  className,
}: PlanResultStructuredContentProps) {
  const parsed = parsePlanSections(content);
  const hasIntro = Boolean(parsed.intro.trim());
  const hasAnySection = SECTIONS.some((section) => parsed[section.key].trim());

  if (!hasIntro && !hasAnySection && planStreaming) {
    return (
      <p className="text-sm text-slate-500">AI 正在撰写方案，首字即将出现…</p>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {hasIntro ? (
        <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/90 to-white px-4 py-3.5 sm:px-5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand-700">
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
            方案简介
          </p>
          <AiChatMarkdown content={parsed.intro} className="text-[15px] leading-relaxed text-slate-800" />
        </div>
      ) : null}

      {SECTIONS.map((section, index) => {
        const body = parsed[section.key].trim();
        if (!body && !planStreaming) {
          return null;
        }

        const Icon = section.icon;

        return (
          <section
            key={section.key}
            className={cn('rounded-2xl border px-4 py-3.5 sm:px-5', section.accent)}
          >
            <p
              className={cn(
                'mb-2 flex items-center gap-2 text-sm font-bold',
                section.titleClass,
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/80 text-xs font-bold text-slate-700 shadow-sm">
                {index + 1}
              </span>
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {section.label}
            </p>
            {body ? (
              <AiChatMarkdown content={body} className="text-[15px] leading-relaxed text-slate-800" />
            ) : (
              <p className="text-sm text-slate-500">生成中…</p>
            )}
          </section>
        );
      })}

      {planStreaming ? (
        <span
          className="ml-1 inline-block h-[1em] w-0.5 animate-pulse bg-brand-500 align-text-bottom"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
