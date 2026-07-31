import { AlertTriangle, BedDouble, Bus, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TravelPlan } from '@/types/domain/travelPlan';
import type { TravelPlanPracticalInfo as TravelPlanPracticalInfoType } from '@/types/domain/travelPlanPracticalInfo';
import { getPlanPracticalInfo } from '@/utils/travelPlanView';
import { cn } from '@/utils/cn';

export type TravelPlanPracticalInfoProps = {
  plan: TravelPlan;
  className?: string;
  /** 弹窗等紧凑场景只展示每类前 2 条 */
  compact?: boolean;
};

type PracticalSection = {
  key: keyof TravelPlanPracticalInfoType;
  title: string;
  icon: LucideIcon;
  accent: string;
  items: string[];
};

function buildSections(info: TravelPlanPracticalInfoType, compact: boolean): PracticalSection[] {
  const limit = compact ? 2 : undefined;
  const slice = (items: string[]) => (limit != null ? items.slice(0, limit) : items);

  const sections: PracticalSection[] = [
    {
      key: 'accommodationTips',
      title: '住宿建议',
      icon: BedDouble,
      accent: 'border-amber-200/80 bg-amber-50/80',
      items: slice(info.accommodationTips),
    },
    {
      key: 'transportationTips',
      title: '交通提示',
      icon: Bus,
      accent: 'border-sky-200/80 bg-sky-50/80',
      items: slice(info.transportationTips),
    },
    {
      key: 'precautions',
      title: '注意事项',
      icon: AlertTriangle,
      accent: 'border-rose-200/80 bg-rose-50/80',
      items: slice(info.precautions),
    },
  ];

  return sections.filter((section) => section.items.length > 0);
}

/** 实用信息：住宿建议、交通提示、注意事项 */
export default function TravelPlanPracticalInfo({
  plan,
  className,
  compact = false,
}: TravelPlanPracticalInfoProps) {
  const info = getPlanPracticalInfo(plan);
  const sections = buildSections(info, compact);

  if (sections.length === 0) {
    return null;
  }

  return (
    <section
      className={cn('mt-6 border-t border-slate-200/90 pt-6', className)}
      aria-labelledby="travel-plan-practical-title"
    >
      <div className="mb-4 flex items-center gap-2">
        <Info className="h-4 w-4 text-brand-600" aria-hidden />
        <h2 id="travel-plan-practical-title" className="text-sm font-semibold text-slate-900">
          实用信息
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {sections.map(({ key, title, icon: Icon, accent, items }) => (
          <article
            key={key}
            className={cn('rounded-xl border p-4', accent)}
            aria-labelledby={`practical-${key}-title`}
          >
            <h3
              id={`practical-${key}-title`}
              className="flex items-center gap-2 text-sm font-semibold text-slate-900"
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              {title}
            </h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
              {items.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" aria-hidden />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
