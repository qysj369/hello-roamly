import { QrCode, Share2 } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import SharePosterDialog from '@/components/features/share/SharePosterDialog';
import { isChinaPrimaryMarket } from '@/lib/config/marketScope';
import { buildShareUrl } from '@/lib/share/shareUrl';
import type { User } from '@/types/domain/user/user';
import { createChinaPosterVariants } from '@/lib/share/chinaPosterVariants';
import {
  buildUserProfilePosterBlob,
  buildUserProfileXhsPosterBlob,
  buildUserProfileXhsPosterSlides,
  getUserProfileXhsCopyText,
} from '@/utils/buildUserProfilePoster';
import type { ShareUserProfileResult } from '@/utils/shareUserProfile';
import {
  getUserProfileSharePath,
  shareUserProfile,
} from '@/utils/shareUserProfile';
import { cn } from '@/utils/cn';

type ShareFeedback = 'idle' | ShareUserProfileResult;

export type UserProfileShareControlsProps = {
  user: User;
  isOwnProfile: boolean;
  className?: string;
  variant?: 'primary' | 'compact';
};

const FEEDBACK_LABEL: Record<Exclude<ShareFeedback, 'idle' | 'cancelled'>, string> = {
  shared: '已分享',
  copied: '已复制',
  failed: '失败',
};

export default function UserProfileShareControls({
  user,
  isOwnProfile,
  className,
  variant = 'primary',
}: UserProfileShareControlsProps) {
  const [feedback, setFeedback] = useState<ShareFeedback>('idle');
  const [posterOpen, setPosterOpen] = useState(false);
  const chinaShare = isChinaPrimaryMarket();
  const isPrimary = variant === 'primary';

  useEffect(() => {
    if (feedback === 'idle' || feedback === 'cancelled') {
      return undefined;
    }
    const timer = window.setTimeout(() => setFeedback('idle'), 2000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [feedback]);

  async function handleQuickShare(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const result = await shareUserProfile(user, isOwnProfile);
    if (result !== 'cancelled') {
      setFeedback(result);
    }
  }

  const quickLabel = feedback !== 'idle' && feedback !== 'cancelled' ? FEEDBACK_LABEL[feedback] : '分享主页';

  const buttonBase = cn(
    'inline-flex shrink-0 items-center justify-center gap-1.5 font-semibold transition',
    isPrimary
      ? 'rounded-xl px-3.5 py-2 text-sm shadow-sm'
      : 'rounded-lg px-2.5 py-1.5 text-xs',
  );

  const safeName = user.username.replace(/[\\/:*?"<>|]/g, '_').slice(0, 40);
  const shareUrl = buildShareUrl(getUserProfileSharePath(user, isOwnProfile));

  return (
    <>
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        <button
          type="button"
          onClick={handleQuickShare}
          className={cn(
            buttonBase,
            isPrimary
              ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              : 'text-slate-600 hover:bg-slate-100',
          )}
          aria-label="分享用户主页"
        >
          <Share2 className={cn(isPrimary ? 'h-4 w-4' : 'h-3.5 w-3.5')} aria-hidden />
          <span>{quickLabel}</span>
        </button>

        {chinaShare && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setPosterOpen(true);
            }}
            className={cn(
              buttonBase,
              isPrimary
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'text-emerald-700 hover:bg-emerald-50',
            )}
            aria-label="生成微信分享海报"
          >
            <QrCode className={cn(isPrimary ? 'h-4 w-4' : 'h-3.5 w-3.5')} aria-hidden />
            <span>{isPrimary ? '分享图' : '海报'}</span>
          </button>
        )}
      </div>

      <SharePosterDialog
        open={posterOpen}
        onClose={() => setPosterOpen(false)}
        title="图文分享 · 主页"
        description="生成微信海报或小红书风格个人名片图"
        shareUrl={shareUrl}
        downloadFilename={`${safeName || '主页'}-分享海报.png`}
        posterAlt={`${user.username} 主页分享图`}
        posterVariants={createChinaPosterVariants({
          baseFilename: safeName || '主页',
          buildWechat: () => buildUserProfilePosterBlob(user, isOwnProfile),
          buildXhs: () => buildUserProfileXhsPosterBlob(user, isOwnProfile),
          buildXhsSlides: () => buildUserProfileXhsPosterSlides(user, isOwnProfile),
          getXhsCopyText: () => getUserProfileXhsCopyText(user, isOwnProfile),
        })}
        shareTrackContext={{ contentKind: 'user_profile', contentId: user.id }}
        onSystemShare={() => shareUserProfile(user, isOwnProfile)}
      />
    </>
  );
}
