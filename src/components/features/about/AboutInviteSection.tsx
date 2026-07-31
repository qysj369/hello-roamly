import { Gift, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { copy } from '@/content/copy';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import InviteCodeCard, { InviteCodeCardSkeleton } from '@/components/features/invite/InviteCodeCard';
import MotionSection from '@/components/motion/MotionSection';
import { useInviteSummary } from '@/hooks/invite/useInviteSummary';
import { hasInviteBackend, isInviteEnabled } from '@/lib/invite/config';
import { normalizeInviteCode } from '@/lib/invite/inviteLink';
import { getPendingInviteCode } from '@/lib/invite/store';
import {
  redeemInviteCode,
  simulateInviteRegistration,
} from '@/services/invite/inviteApi';
import { isProductionAppMode } from '@/lib/config/appMode';

export default function AboutInviteSection() {
  const isProduction = isProductionAppMode();
  const { data: summary, isPending, refetch } = useInviteSummary(DEMO_CURRENT_USER_ID);
  const [inputCode, setInputCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isInviteEnabled()) {
    return null;
  }

  async function handleRedeem() {
    setBusy(true);
    const result = await redeemInviteCode({ code: inputCode, inviteeUserId: DEMO_CURRENT_USER_ID });
    setBusy(false);
    setFeedback(result.message);
    window.setTimeout(() => setFeedback(null), 4000);
  }

  async function handleSimulateRegister() {
    setBusy(true);
    const result = await simulateInviteRegistration(DEMO_CURRENT_USER_ID);
    setBusy(false);
    setFeedback(result.message);
    void refetch();
    window.setTimeout(() => setFeedback(null), 4000);
  }

  const pending = getPendingInviteCode();

  return (
    <div id="invite" className="scroll-mt-20">
    <MotionSection
      className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/80 via-white to-white p-6 shadow-sm"
      delay={0.17}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600/10 text-amber-700">
          <Gift className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {isProduction ? copy.about.inviteTitlePublic : copy.about.inviteTitle}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">{copy.about.inviteBadge}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        {isProduction ? copy.about.inviteLeadPublic : copy.about.inviteLead}
      </p>

      {!isProduction ? (
        <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
          {copy.about.inviteBullets.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-amber-600" aria-hidden>
                ·
              </span>
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 rounded-xl border border-amber-100 bg-white/90 p-4">
        <p className="text-xs font-semibold text-slate-800">
          {isProduction ? copy.about.invitePanelTitlePublic : copy.about.inviteDemoTitle}
        </p>
        {isPending && <InviteCodeCardSkeleton />}
        {summary && <InviteCodeCard className="mt-3" summary={summary} compact />}
      </div>

      {!isProduction ? (
        <div className="mt-4 rounded-xl border border-amber-100 bg-white/90 p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-800">受邀演示</p>
          {pending && (
            <p className="text-[11px] text-amber-800">
              当前待绑定邀请码：<span className="font-mono font-bold">{pending}</span>
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <label htmlFor="about-invite-code" className="sr-only">
              邀请码
            </label>
            <input
              id="about-invite-code"
              type="text"
              value={inputCode}
              onChange={(event) => setInputCode(normalizeInviteCode(event.target.value))}
              placeholder="输入邀请码"
              autoComplete="off"
              className="min-w-[8rem] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase"
              maxLength={12}
            />
            <button
              type="button"
              disabled={busy || !inputCode}
              onClick={() => void handleRedeem()}
              className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              绑定邀请码
            </button>
          </div>
          <button
            type="button"
            disabled={busy || !pending}
            onClick={() => void handleSimulateRegister()}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            模拟好友完成注册（演示）
          </button>
          <p className="text-[10px] text-slate-500">
            先访问带 <code className="rounded bg-slate-100 px-1">?ref=邀请码</code> 的首页链接，再点模拟注册。
            {hasInviteBackend() ? ' 正式环境由服务端发奖。' : ' 演示数据存于本机。'}
          </p>
        </div>
      ) : null}

      {feedback && (
        <p className="mt-3 text-center text-xs text-emerald-700" role="status">
          {feedback}
        </p>
      )}
    </MotionSection>
    </div>
  );
}
