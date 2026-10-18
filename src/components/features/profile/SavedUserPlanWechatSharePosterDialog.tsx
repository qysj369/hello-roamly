import SharePosterDialog from '@/components/features/share/SharePosterDialog';
import { createChinaPosterVariants } from '@/lib/share/chinaPosterVariants';
import { buildShareUrl } from '@/lib/share/shareUrl';
import { savedUserPlanDetailPath } from '@/router/paths';
import type { UserPlanRecord } from '@/types/api/userPlans';
import {
  buildSavedUserPlanPosterBlob,
  buildSavedUserPlanXhsPosterBlob,
  buildSavedUserPlanXhsPosterSlides,
  getSavedUserPlanXhsCopyText,
} from '@/utils/buildSavedUserPlanPoster';
import { shareSavedUserPlan } from '@/utils/shareSavedUserPlan';

export type SavedUserPlanWechatSharePosterDialogProps = {
  plan: UserPlanRecord;
  open: boolean;
  onClose: () => void;
};

export default function SavedUserPlanWechatSharePosterDialog({
  plan,
  open,
  onClose,
}: SavedUserPlanWechatSharePosterDialogProps) {
  const safeName = plan.title.replace(/[\\/:*?"<>|]/g, '_').slice(0, 40);

  return (
    <SharePosterDialog
      open={open}
      onClose={onClose}
      title="图文分享 · 漫行方案"
      description="生成微信海报或小红书风格笔记图，保存后发布到社交平台"
      className="max-w-2xl"
      previewExpanded
      shareUrl={buildShareUrl(savedUserPlanDetailPath(plan.id), {
        contentKind: 'saved_user_plan',
        contentId: plan.id,
      })}
      downloadFilename={`${safeName || '漫行方案'}-分享海报.png`}
      posterAlt={`${plan.title} 分享图`}
      posterVariants={createChinaPosterVariants({
        baseFilename: safeName || '漫行方案',
        buildWechat: () => buildSavedUserPlanPosterBlob(plan),
        buildXhs: () => buildSavedUserPlanXhsPosterBlob(plan),
        buildXhsSlides: () => buildSavedUserPlanXhsPosterSlides(plan),
        getXhsCopyText: () => getSavedUserPlanXhsCopyText(plan),
      })}
      shareTrackContext={{ contentKind: 'saved_user_plan', contentId: plan.id }}
      onSystemShare={() => shareSavedUserPlan(plan)}
    />
  );
}
