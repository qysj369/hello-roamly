import { useCallback } from 'react';
import { cn } from '@/utils/cn';

const SECTION_LINKS = [
  { id: 'travel-plan-overview-title', label: '概览' },
  { id: 'travel-plan-map-title', label: '地图' },
  { id: 'travel-plan-itinerary-title', label: '行程' },
  { id: 'travel-plan-practical-title', label: '实用' },
  { id: 'travel-plan-actions-title', label: '行动' },
] as const;

export type TravelPlanDetailNavProps = {
  className?: string;
};

export default function TravelPlanDetailNav({ className }: TravelPlanDetailNavProps) {
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <nav
      className={cn(
        'sticky top-[var(--app-header-offset)] z-10 -mx-5 mb-1 flex gap-1 overflow-x-auto border-b border-slate-200/90 bg-white/95 px-5 py-2 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mb-4 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:rounded-xl lg:border lg:px-3 lg:py-2',
        className,
      )}
      aria-label="计划详情章节"
    >
      {SECTION_LINKS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => scrollToSection(id)}
          className="shrink-0 rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-brand-700 lg:w-full"
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
