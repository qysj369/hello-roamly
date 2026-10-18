import { Copy, Image, MessageCircle, Share2 } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Dialog from '@/components/ui/Dialog';
import SavedUserPlanWechatSharePosterDialog from '@/components/features/profile/SavedUserPlanWechatSharePosterDialog';
import { isChinaPrimaryMarket } from '@/lib/config/marketScope';
import type { UserPlanRecord } from '@/types/api/userPlans';
import { messagesInboxPath } from '@/router/messagesPaths';
import { searchPlanFromUserPlan } from '@/lib/home/searchPlanSession';
import { searchPlanShareHashtags, searchPlanShareHook } from '@/lib/home/searchPlanShareCopy';
import {
  buildSavedUserPlanChatDraft,
  copySavedUserPlanLink,
  shareSavedUserPlan,
} from '@/utils/shareSavedUserPlan';
import { stashSiteChatDraft } from '@/utils/siteChatDraft';
import { cn } from '@/utils/cn';

export type SavedUserPlanShareControlsProps = {
  plan: UserPlanRecord;
  className?: string;
  variant?: 'primary' | 'compact';
  hideInbox?: boolean;
};

type CopyFeedback = 'idle' | 'copied' | 'failed';

export default function SavedUserPlanShareControls({
  plan,
  className,
  variant = 'primary',
  hideInbox = false,
}: SavedUserPlanShareControlsProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>('idle');
  const chinaShare = isChinaPrimaryMarket();
  const isPrimary = variant === 'primary';

  useEffect(() => {
    if (copyFeedback === 'idle') return undefined;
    const timer = window.setTimeout(() => setCopyFeedback('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [copyFeedback]);

  function handleShareToMessages(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const draft = buildSavedUserPlanChatDraft(plan);
    stashSiteChatDraft(draft);
    navigate(messagesInboxPath(), { state: { draftMessage: draft } });
  }

  async function handleShareClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const result = await shareSavedUserPlan(plan);
    if (result === 'shared') {
      setCopyFeedback('copied');
      return;
    }
    if (result === 'cancelled') return;
    if (result === 'copied') setCopyFeedback('copied');
    setMenuOpen(true);
  }

  async function handleCopyLink() {
    const result = await copySavedUserPlanLink(plan);
    setCopyFeedback(result);
    if (result === 'copied') {
      setMenuOpen(false);
    }
  }

  function handleOpenPoster() {
    setMenuOpen(false);
    setPosterOpen(true);
  }

  const shareLabel = copyFeedback === 'copied' ? '已复制' : copyFeedback === 'failed' ? '失败' : '分享';
  const structured = searchPlanFromUserPlan(plan);
  const sharePitch = structured
    ? `${searchPlanShareHook(structured)} ${searchPlanShareHashtags(structured).map((tag) => `#${tag}`).join(' ')}`
    : '把完整攻略发给朋友，扫码后可直接查看预算和每日行程。';

  const buttonBase = cn(
    'inline-flex shrink-0 items-center justify-center gap-1.5 font-semibold transition',
    isPrimary ? 'rounded-xl px-3.5 py-2 text-sm shadow-sm' : 'rounded-lg px-2.5 py-1.5 text-xs',
  );

  return (
    <>
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-label="分享漫行方案"
          onClick={(event) => {
            void handleShareClick(event);
          }}
          className={cn(
            buttonBase,
            isPrimary
              ? 'bg-brand-600 text-white hover:bg-brand-700'
              : 'text-slate-600 hover:bg-slate-100',
            copyFeedback === 'copied' && isPrimary && 'bg-emerald-600 hover:bg-emerald-700',
          )}
        >
          <Share2 className={cn(isPrimary ? 'h-4 w-4' : 'h-3.5 w-3.5')} aria-hidden />
          <span>{shareLabel}</span>
        </button>

        {hideInbox ? null : (
          <button
            type="button"
            onClick={handleShareToMessages}
            className={cn(
              buttonBase,
              isPrimary
                ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'text-[#2c6b58] hover:bg-emerald-50',
            )}
            aria-label="分享到消息"
          >
            <MessageCircle className={cn(isPrimary ? 'h-4 w-4' : 'h-3.5 w-3.5')} aria-hidden />
            <span>{isPrimary ? '发到消息' : '消息'}</span>
          </button>
        )}
      </div>

      <Dialog
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="分享行程"
        description={sharePitch}
        className="holo-plan-share-menu max-w-sm"
      >
        <div className="flex flex-col gap-2">
          <button type="button" className="holo-plan-share-option" onClick={() => void handleCopyLink()}>
            <Copy className="h-4 w-4" aria-hidden />
            复制链接
          </button>
          {chinaShare ? (
            <button type="button" className="holo-plan-share-option" onClick={handleOpenPoster}>
              <Image className="h-4 w-4" aria-hidden />
              生成海报
            </button>
          ) : null}
        </div>
      </Dialog>

      <SavedUserPlanWechatSharePosterDialog
        plan={plan}
        open={posterOpen}
        onClose={() => setPosterOpen(false)}
      />
    </>
  );
}
