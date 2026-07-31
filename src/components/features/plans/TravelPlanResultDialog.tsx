import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import TravelPlanDetailActions from '@/components/features/plans/TravelPlanDetailActions';
import TravelPlanDetailHeader from '@/components/features/plans/TravelPlanDetailHeader';
import TravelPlanItineraryTimeline from '@/components/features/plans/TravelPlanItineraryTimeline';
import TravelPlanOverview from '@/components/features/plans/TravelPlanOverview';
import TravelPlanPracticalInfo from '@/components/features/plans/TravelPlanPracticalInfo';
import { Dialog } from '@/components/ui';
import { travelPlanDetailPath } from '@/router/paths';
import type { TravelPlan } from '@/types/domain/travelPlan';

export type TravelPlanResultDialogProps = {
  open: boolean;
  plan: TravelPlan | null;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
};

export default function TravelPlanResultDialog({
  open,
  plan,
  onClose,
  onConfirm,
  confirmLabel = '查看完整行程',
}: TravelPlanResultDialogProps) {
  if (!plan) {
    return null;
  }

  const detailPath = travelPlanDetailPath(plan.id);
  const dayCount = plan.dailyPlans.length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="旅行计划已生成"
      description={`${plan.title} · 共 ${dayCount} 天。可上下滑动查看完整行程，或进入详情页看地图。`}
      confirmLabel={confirmLabel}
      onConfirm={onConfirm ?? onClose}
      cancelLabel="关闭"
      className="max-w-md sm:max-w-2xl"
    >
      <TravelPlanDetailHeader plan={plan} className="border-b-0 pb-0" />

      <TravelPlanOverview plan={plan} className="mt-4" />

      <TravelPlanItineraryTimeline
        plan={plan}
        className="mt-2"
        expandAllActivities
      />

      <TravelPlanPracticalInfo plan={plan} className="mt-2" />

      <TravelPlanDetailActions plan={plan} className="mt-4" variant="toolbar" />

      <Link
        to={detailPath}
        onClick={onClose}
        className="mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        打开详情页（地图 + 完整 {dayCount} 天行程）
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </Dialog>
  );
}
