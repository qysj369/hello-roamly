import SharePosterDialog from '@/components/features/share/SharePosterDialog';
import { createChinaPosterVariants } from '@/lib/share/chinaPosterVariants';
import { buildShareUrl } from '@/lib/share/shareUrl';
import { travelPlanDetailPath } from '@/router/paths';
import type { TravelPlan } from '@/types/domain/travelPlan';
import {
  buildTravelPlanPosterBlob,
  buildTravelPlanXhsPosterBlob,
  buildTravelPlanXhsPosterSlides,
  getTravelPlanXhsCopyText,
} from '@/utils/buildTravelPlanPoster';
import { shareTravelPlan } from '@/utils/shareTravelPlan';

export type WechatSharePosterDialogProps = {
  plan: TravelPlan;
  open: boolean;
  onClose: () => void;
};

export default function WechatSharePosterDialog({ plan, open, onClose }: WechatSharePosterDialogProps) {
  const safeName = plan.title.replace(/[\\/:*?"<>|]/g, '_').slice(0, 40);

  return (
    <SharePosterDialog
      open={open}
      onClose={onClose}
      title="图文分享 · 行程"
      description="生成微信海报或小红书风格笔记图，保存后发布到社交平台"
      shareUrl={buildShareUrl(travelPlanDetailPath(plan.id))}
      downloadFilename={`${safeName || '行程'}-分享海报.png`}
      posterAlt={`${plan.title} 分享图`}
      posterVariants={createChinaPosterVariants({
        baseFilename: safeName || '行程',
        buildWechat: () => buildTravelPlanPosterBlob(plan),
        buildXhs: () => buildTravelPlanXhsPosterBlob(plan),
        buildXhsSlides: () => buildTravelPlanXhsPosterSlides(plan),
        getXhsCopyText: () => getTravelPlanXhsCopyText(plan),
      })}
      shareTrackContext={{ contentKind: 'travel_plan', contentId: plan.id }}
      onSystemShare={() => shareTravelPlan(plan)}
    />
  );
}
