import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, MapPin, Wallet } from 'lucide-react';
import { useId, useState } from 'react';
import type { TravelPlanActivity } from '@/types/domain/travelPlan';
import { cn } from '@/utils/cn';

export type TravelPlanActivityTimelineItemProps = {
  activity: TravelPlanActivity;
  dayNumber: number;
  activityIndex: number;
  isLast: boolean;
  defaultExpanded?: boolean;
};

function formatActivityCost(cost?: number): string | null {
  if (cost == null) {
    return null;
  }
  return `¥${cost.toLocaleString('zh-CN')}`;
}

export default function TravelPlanActivityTimelineItem({
  activity,
  dayNumber,
  activityIndex,
  isLast,
  defaultExpanded = false,
}: TravelPlanActivityTimelineItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const reduceMotion = useReducedMotion();
  const panelId = useId();
  const costLabel = formatActivityCost(activity.cost);

  return (
    <li
      className={cn('relative', !isLast && 'pb-5')}
      style={{ listStyle: 'none' }}
    >
      <div
        className="absolute -left-[1.625rem] top-3.5 z-10 h-3 w-3 rounded-full border-2 border-brand-500 bg-white shadow-sm"
        aria-hidden
      />

      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm">
        <button
          type="button"
          className="flex w-full items-start gap-3 px-3 py-3 text-left transition hover:bg-slate-50/80"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((open) => !open)}
        >
          <span className="shrink-0 rounded-lg bg-brand-50 px-2 py-1 font-mono text-xs font-semibold text-brand-700">
            {activity.time}
          </span>
          <span className="min-w-0 flex-1">
            <span className="line-clamp-2 text-sm font-medium text-slate-900">
              {activity.description}
            </span>
            {!expanded && activity.location && (
              <span className="mt-0.5 block truncate text-xs text-slate-500">
                {activity.location}
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              'mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform',
              expanded && 'rotate-180',
            )}
            aria-hidden
          />
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              id={panelId}
              role="region"
              aria-label={`第 ${dayNumber} 天第 ${activityIndex + 1} 项活动详情`}
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              className="overflow-hidden border-t border-slate-100"
            >
              <div className="space-y-2 bg-slate-50/60 px-3 py-3 text-sm text-slate-600">
                <p className="leading-relaxed text-slate-700">{activity.description}</p>
                {activity.location && (
                  <p className="flex items-start gap-1.5 text-xs">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden />
                    <span>{activity.location}</span>
                  </p>
                )}
                {costLabel && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
                    <Wallet className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                    预估花费 {costLabel}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </li>
  );
}
