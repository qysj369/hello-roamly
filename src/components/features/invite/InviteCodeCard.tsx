import { Check, Copy, Loader2, Share2 } from 'lucide-react';
import { useState } from 'react';
import type { InviteSummary } from '@/types/domain/invite';
import { cn } from '@/utils/cn';

export type InviteCodeCardProps = {
  summary: InviteSummary;
  className?: string;
  compact?: boolean;
};

export default function InviteCodeCard({ summary, className, compact = false }: InviteCodeCardProps) {
  const [copyState, setCopyState] = useState<'idle' | 'code' | 'link'>('idle');

  async function copyText(text: string, kind: 'code' | 'link') {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(kind);
      window.setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('idle');
    }
  }

  async function handleShare() {
    const payload = {
      title: 'Hello Roamly 穷游邀请',
      text: `用我的邀请码 ${summary.inviteCode} 一起规划穷游行程`,
      url: summary.inviteLink,
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
      await copyText(summary.inviteLink, 'link');
    } catch {
      // 用户取消
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3',
          compact && 'px-3 py-2.5',
        )}
      >
        <div>
          <p className="text-[11px] font-medium text-amber-800">我的邀请码</p>
          <p className="font-mono text-xl font-bold tracking-widest text-amber-950">
            {summary.inviteCode}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyText(summary.inviteCode, 'code')}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-50"
          >
            {copyState === 'code' ? (
              <Check className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
            复制码
          </button>
          <button
            type="button"
            onClick={() => void copyText(summary.inviteLink, 'link')}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-50"
          >
            {copyState === 'link' ? (
              <Check className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
            复制链接
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden />
            分享
          </button>
        </div>
      </div>

      {!compact && (
        <p className="break-all text-[11px] text-slate-500">{summary.inviteLink}</p>
      )}

      {summary.message && (
        <p className="text-[11px] text-slate-500">{summary.message}</p>
      )}
    </div>
  );
}

export function InviteCodeCardSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin text-amber-600" aria-hidden />
      加载邀请信息…
    </div>
  );
}
