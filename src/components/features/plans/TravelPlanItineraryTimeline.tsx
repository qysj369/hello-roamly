import { CalendarRange } from 'lucide-react';
import TravelPlanActivityTimelineItem from '@/components/features/plans/TravelPlanActivityTimelineItem';
import type { TravelPlan, TravelPlanDay } from '@/types/domain/travelPlan';
import { cn } from '@/utils/cn';

export type TravelPlanItineraryTimelineProps = {
  plan: TravelPlan;
  className?: string;
  /** 仅展示前 N 天（弹窗预览等） */
  maxDays?: number;
  /** 默认展开每个行程日的第一项活动 */
  expandFirstActivity?: boolean;
  /** 弹窗预览：默认展开全部活动，避免内容看起来过少 */
  expandAllActivities?: boolean;
};

function sumDayCost(day: TravelPlanDay): number {
  return day.activities.reduce((sum, activity) => sum + (activity.cost ?? 0), 0);
}

export default function TravelPlanItineraryTimeline({
  plan,
  className,
  maxDays,
  expandFirstActivity = false,
  expandAllActivities = false,
}: TravelPlanItineraryTimelineProps) {
  const days = maxDays != null ? plan.dailyPlans.slice(0, maxDays) : plan.dailyPlans;

  if (days.length === 0) {
    return (
      <p className={cn('text-sm text-slate-500', className)}>暂无每日行程安排。</p>
    );
  }

  return (
    <section
      className={cn('mt-6 border-t border-slate-200/90 pt-6', className)}
      aria-labelledby="travel-plan-itinerary-title"
    >
      <div className="mb-4 flex items-center gap-2">
        <CalendarRange className="h-4 w-4 text-brand-600" aria-hidden />
        <h2
          id="travel-plan-itinerary-title"
          className="text-sm font-semibold text-slate-900"
        >
          每日行程
        </h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
          共 {plan.dailyPlans.length} 天
        </span>
      </div>

      <div className="space-y-8">
        {days.map((day, dayIndex) => {
          const dayCost = sumDayCost(day);
          return (
            <div key={`day-${day.day}-${day.title}`}>
              <header className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-brand-600">
                    Day {day.day}
                  </p>
                  <h3 className="mt-0.5 text-base font-semibold text-slate-900">{day.title}</h3>
                </div>
                {dayCost > 0 && (
                  <p className="text-xs text-slate-500">
                    当日花费约 ¥{dayCost.toLocaleString('zh-CN')}
                  </p>
                )}
              </header>

              <ol className="relative ml-4 border-l-2 border-brand-200/80 pl-6">
                {day.activities.map((activity, activityIndex) => (
                  <TravelPlanActivityTimelineItem
                    key={`${day.day}-${activity.time}-${activity.description}`}
                    activity={activity}
                    dayNumber={day.day}
                    activityIndex={activityIndex}
                    isLast={activityIndex === day.activities.length - 1}
                    defaultExpanded={
                      expandAllActivities ||
                      (expandFirstActivity && dayIndex === 0 && activityIndex === 0)
                    }
                  />
                ))}
              </ol>
            </div>
          );
        })}
      </div>

      {maxDays != null && plan.dailyPlans.length > maxDays && (
        <p className="mt-4 text-center text-xs text-slate-500">
          还有 {plan.dailyPlans.length - maxDays} 天行程，请进入计划详情查看完整时间轴。
        </p>
      )}
    </section>
  );
}
