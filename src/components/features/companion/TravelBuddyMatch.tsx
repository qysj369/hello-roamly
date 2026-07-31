import { Sparkles, Users } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TravelBuddyMatchCard from '@/components/features/companion/TravelBuddyMatchCard';
import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import { useUserProfile } from '@/hooks/user/useUserProfile';
import { messagesThreadPath } from '@/router/messagesPaths';
import type { TravelBuddyMatchCandidate, TravelBuddyMatchQuery } from '@/types/domain/travelBuddyMatch';
import {
  buildBuddyWelcomeMessage,
  ensureBuddyConversation,
  peerMetaFromMatchCandidate,
} from '@/utils/siteChat';
import {
  describeMatchAlgorithm,
  describeMatchQuery,
  getCountryHint,
  listOpenTravelBuddies,
  matchTravelBuddies,
} from '@/utils/travelBuddyMatch';
import { cn } from '@/utils/cn';

export type TravelBuddyMatchProps = {
  /** 匹配上下文；省略则展示全部开放旅伴 */
  context?: TravelBuddyMatchQuery | null;
  className?: string;
};

/** 旅伴匹配：展示匹配结果卡片列表 */
export default function TravelBuddyMatch({ context, className }: TravelBuddyMatchProps) {
  const navigate = useNavigate();
  const { user: viewer } = useUserProfile();

  const candidates = useMemo(() => {
    if (context?.destination?.trim()) {
      return matchTravelBuddies(context, {
        excludeUserId: viewer?.id ?? DEMO_CURRENT_USER_ID,
        viewer,
      });
    }
    return listOpenTravelBuddies(viewer?.id ?? DEMO_CURRENT_USER_ID, viewer);
  }, [context, viewer]);

  const handleStartChat = useCallback(
    (candidate: TravelBuddyMatchCandidate) => {
      const peer = peerMetaFromMatchCandidate(candidate);
      ensureBuddyConversation(peer, buildBuddyWelcomeMessage(candidate));
      navigate(messagesThreadPath(candidate.userId));
    },
    [navigate],
  );

  const countryHint = context?.destination ? getCountryHint(context.destination) : undefined;
  const hasContext = Boolean(context?.destination?.trim());

  return (
    <section
      className={cn(
        'rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-5 shadow-sm sm:p-6',
        className,
      )}
      aria-labelledby="travel-buddy-match-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-violet-700">
            <Users className="h-3.5 w-3.5" aria-hidden />
            Buddy Match
          </p>
          <h2 id="travel-buddy-match-title" className="mt-1 text-base font-semibold text-slate-900">
            匹配结果
          </h2>
          <p className="mt-1 text-sm text-slate-600">按匹配度排序，发起聊天将在站内消息中继续</p>
          <p className="mt-1 text-[10px] text-slate-400">{describeMatchAlgorithm()}</p>
        </div>
        {hasContext && (
          <div className="rounded-xl border border-violet-200/60 bg-white/80 px-3 py-2 text-right text-xs">
            <p className="font-medium text-violet-800">{context?.planTitle ?? '当前行程'}</p>
            <p className="mt-0.5 text-slate-600">{describeMatchQuery(context!)}</p>
            {countryHint && <p className="mt-0.5 text-slate-400">区域：{countryHint}</p>}
          </div>
        )}
      </div>

      {candidates.length === 0 && (
        <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white/60 py-10 text-center text-sm text-slate-500">
          暂无符合条件的旅伴，试试调整目的地或稍后再来
        </p>
      )}

      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {candidates.map((candidate) => (
          <li key={candidate.userId}>
            <TravelBuddyMatchCard candidate={candidate} onStartChat={handleStartChat} />
          </li>
        ))}
      </ul>

      {!hasContext && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" aria-hidden />
          从旅行计划详情点击「寻找旅伴」可带入目的地与预算，获得更精准推荐
        </p>
      )}
    </section>
  );
}
