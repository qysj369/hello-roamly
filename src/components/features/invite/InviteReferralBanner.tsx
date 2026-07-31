import { Gift, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInviteAttribution } from '@/hooks/invite/useInviteAttribution';
import { isInviteEnabled } from '@/lib/invite/config';
import { paths } from '@/router/paths';

/** 全局顶栏下：检测到邀请链接时提示 */
export default function InviteReferralBanner() {
  const { pendingCode, dismiss } = useInviteAttribution();

  if (!isInviteEnabled() || !pendingCode) {
    return null;
  }

  return (
    <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-2.5 text-sm text-amber-950 shadow-sm">
      <Gift className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">好友邀请你加入穷游</p>
        <p className="mt-0.5 text-xs text-amber-900/90">
          邀请码 <span className="font-mono font-bold">{pendingCode}</span>
          ，登录注册后可领取新人奖励。
        </p>
        <Link
          to={`${paths.about}#invite`}
          className="mt-1 inline-block text-xs font-semibold text-amber-800 underline"
        >
          查看邀请规则
        </Link>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded-lg p-1 text-amber-700 hover:bg-amber-100"
        aria-label="关闭提示"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
