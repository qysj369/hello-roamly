import TravelPlanShareControls from '@/components/features/plans/TravelPlanShareControls';
import type { TravelPlan } from '@/types/domain/travelPlan';

export type TravelPlanShareButtonProps = {
  plan: TravelPlan;
  className?: string;
  variant?: 'primary' | 'compact';
};

/** 行程分享（系统分享 + 中国版微信海报） */
export default function TravelPlanShareButton(props: TravelPlanShareButtonProps) {
  return <TravelPlanShareControls {...props} />;
}
