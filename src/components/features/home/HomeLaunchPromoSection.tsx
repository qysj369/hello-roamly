import { Gift, Share2 } from 'lucide-react';
import MotionLink from '@/components/motion/MotionLink';
import { isInviteEnabled } from '@/lib/invite/config';
import { paths } from '@/router/paths';
import { cn } from '@/utils/cn';

type HomeLaunchPromoSectionProps = {
  className?: string;
};

/** 推广版首页 — 地图与内容区下方的轻量转化条（邀请 / 分享） */
export default function HomeLaunchPromoSection({ className }: HomeLaunchPromoSectionProps) {
  return (
    <section
      className={cn(
        'home-launch-promo flex flex-col gap-2 rounded-xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50/50 to-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3',
        className,
      )}
      aria-label="上线福利"
    >
      <p className="text-xs text-slate-600 sm:text-sm">
        分享真实穷游轨迹，帮更多蜗友少走弯路
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
        {isInviteEnabled() ? (
          <MotionLink
            to={`${paths.about}#invite`}
            className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:border-amber-300 hover:bg-amber-100 sm:flex-none sm:min-w-[9.5rem]"
          >
            <Gift className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
            邀请好友得奖励
          </MotionLink>
        ) : null}
        <MotionLink
          to={paths.guidesPublish}
          className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:brightness-110 sm:flex-none sm:min-w-[9.5rem]"
        >
          <Share2 className="h-4 w-4 shrink-0" aria-hidden />
          分享你的穷游轨迹
        </MotionLink>
      </div>
    </section>
  );
}
