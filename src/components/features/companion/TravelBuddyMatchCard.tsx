import { CalendarDays, ChevronDown, Globe2, MessageCircle, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import type { TravelBuddyMatchCandidate } from '@/types/domain/travelBuddyMatch';
import { TRAVEL_BUDDY_MATCH_FACTOR_LABELS } from '@/types/domain/travelBuddyMatch';
import type { TravelBuddyMatchFactorScores } from '@/types/domain/travelBuddyMatch';
import { userProfilePath } from '@/router/paths';
import { formatMatchScore } from '@/utils/travelBuddyMatch';
import { getInterestLabel } from '@/utils/userProfileView';
import { AvatarImage } from '@/components/ui';
import { cn } from '@/utils/cn';

export type TravelBuddyMatchCardProps = {
  candidate: TravelBuddyMatchCandidate;
  onStartChat: (candidate: TravelBuddyMatchCandidate) => void;
  className?: string;
};

const FACTOR_ORDER: (keyof TravelBuddyMatchFactorScores)[] = [
  'scheduleDestination',
  'personality',
  'interests',
  'budget',
];

function MatchScoreRing({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className="relative flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center"
      aria-label={`匹配度 ${formatMatchScore(score)}`}
    >
      <svg className="h-full w-full -rotate-90" viewBox="0 0 72 72" aria-hidden>
        <circle cx="36" cy="36" r={radius} fill="none" strokeWidth="6" className="stroke-slate-200" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className="stroke-violet-500"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold tabular-nums leading-none text-violet-700">
          {Math.round(score)}
        </span>
        <span className="text-[9px] font-medium text-slate-500">匹配度</span>
      </div>
    </div>
  );
}

/** 单条旅伴匹配结果卡片 */
export default function TravelBuddyMatchCard({
  candidate,
  onStartChat,
  className,
}: TravelBuddyMatchCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleChat = useCallback(() => {
    onStartChat(candidate);
  }, [candidate, onStartChat]);

  const handleToggleDetails = useCallback(() => {
    setDetailsOpen((prev) => !prev);
  }, []);

  return (
    <article
      className={cn(
        'flex flex-col rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm',
        className,
      )}
      aria-label={`${candidate.username}，匹配度 ${formatMatchScore(candidate.matchScore)}`}
    >
      <div className="flex gap-3">
        <MatchScoreRing score={candidate.matchScore} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            {candidate.avatar ? (
              <AvatarImage
                src={candidate.avatar}
                displayName={candidate.username}
                size={44}
                className="h-11 w-11 shrink-0 rounded-xl ring-2 ring-violet-100"
              />
            ) : (
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-base font-bold text-violet-700"
                aria-hidden
              >
                {candidate.username.slice(0, 1)}
              </span>
            )}
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-900">{candidate.username}</h3>
              <p className="text-xs font-medium text-violet-700">{candidate.travelPersonality.title}</p>
            </div>
          </div>

          {candidate.bio && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">{candidate.bio}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-0.5">
              <Globe2 className="h-3 w-3" aria-hidden />
              去过 {candidate.visitedCountryCount} 国
            </span>
            <span className="inline-flex items-center gap-0.5">
              <CalendarDays className="h-3 w-3" aria-hidden />
              {candidate.seekingDestination} · {candidate.seekingDays} 天
            </span>
          </div>

          {candidate.interests.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1" aria-label="兴趣标签">
              {candidate.interests.map((interest) => (
                <li
                  key={interest}
                  className={cn(
                    'rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                    candidate.sharedInterests.includes(interest)
                      ? 'bg-cyan-100 text-cyan-800'
                      : 'bg-slate-100 text-slate-600',
                  )}
                >
                  {getInterestLabel(interest)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <section className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50/50 p-3" aria-label="匹配原因">
        <h4 className="text-xs font-semibold text-cyan-900">匹配原因</h4>
        <ul className="mt-2 space-y-1.5">
          {candidate.matchReasons.map((reason) => (
            <li key={reason} className="flex gap-2 text-xs leading-relaxed text-cyan-950">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-600" aria-hidden />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
        {candidate.seekingMessage && (
          <p className="mt-2 border-t border-cyan-100/80 pt-2 text-xs italic text-cyan-800/90">
            「{candidate.seekingMessage}」
          </p>
        )}
      </section>

      <button
        type="button"
        onClick={handleToggleDetails}
        className="mt-3 inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-slate-700"
        aria-expanded={detailsOpen}
      >
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition', detailsOpen && 'rotate-180')}
          aria-hidden
        />
        {detailsOpen ? '收起维度得分' : '查看四维得分'}
      </button>

      {detailsOpen && (
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          {FACTOR_ORDER.map((key) => (
            <div key={key} className="rounded-lg bg-slate-50 px-2 py-1.5">
              <dt className="text-slate-500">{TRAVEL_BUDDY_MATCH_FACTOR_LABELS[key]}</dt>
              <dd className="font-semibold tabular-nums text-slate-800">
                {candidate.factorScores[key]}%
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleChat}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          发起聊天
        </button>
        <Link
          to={userProfilePath(candidate.userId)}
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand-200 hover:text-brand-700"
        >
          查看主页
        </Link>
      </div>
    </article>
  );
}
