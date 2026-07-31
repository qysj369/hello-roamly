import {
  Award,
  BadgeCheck,
  Camera,
  Globe2,
  MapPinned,
  Sparkles,
  Users,
  Utensils,
  Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { User } from '@/types/domain/user/user';
import SnailContributionTitleBadge from '@/components/features/community/SnailContributionTitleBadge';
import { TRAVEL_BADGE_META, type TravelBadgeMeta } from '@/data/travelBadges';
import { useContributionScore } from '@/hooks/user/useContributionScore';
import { CONTRIBUTION_SCORE_RULES } from '@/lib/config/contributionScore';
import {
  formatProfileStatCount,
  getProfileTravelData,
} from '@/utils/userProfileView';
import { cn } from '@/utils/cn';

export type UserProfileTravelDataPanelProps = {
  user: User;
  isOwnProfile: boolean;
  className?: string;
};

const BADGE_ICONS: Record<TravelBadgeMeta['icon'], LucideIcon> = {
  award: Award,
  globe: Globe2,
  utensils: Utensils,
  camera: Camera,
  users: Users,
  sparkles: Sparkles,
  'badge-check': BadgeCheck,
};

type MetricCardProps = {
  icon: LucideIcon;
  value: string;
  label: string;
  accent: string;
  hint?: string;
};

function MetricCard({ icon: Icon, value, label, accent, hint }: MetricCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-xl border border-slate-200/80 bg-gradient-to-br p-4 text-center',
        accent,
      )}
    >
      <Icon className="h-5 w-5 opacity-80" aria-hidden />
      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-slate-600">{label}</p>
      {hint && <p className="mt-1 text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

/** 旅行数据面板：去过国家数、发布计划数、获得徽章 */
export default function UserProfileTravelDataPanel({
  user,
  isOwnProfile,
  className,
}: UserProfileTravelDataPanelProps) {
  const data = getProfileTravelData(user, isOwnProfile);
  const contributionScore = useContributionScore(user.id, user.contributionScore ?? 0);

  const countryValue =
    data.visitedCountryCount != null ? formatProfileStatCount(data.visitedCountryCount) : '—';

  return (
    <section
      className={cn('rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6', className)}
      aria-labelledby="profile-travel-data-title"
    >
      <h2
        id="profile-travel-data-title"
        className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500"
      >
        旅行数据
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          icon={Trophy}
          value={formatProfileStatCount(contributionScore)}
          label="贡献分"
          accent="from-emerald-500/15 to-teal-600/5 text-emerald-800"
        />
        <MetricCard
          icon={Globe2}
          value={countryValue}
          label="去过国家"
          accent="from-emerald-500/15 to-emerald-600/5 text-emerald-800"
          hint={data.countriesHidden ? '蜗友已隐藏' : undefined}
        />
        <MetricCard
          icon={MapPinned}
          value={formatProfileStatCount(data.publishedPlanCount)}
          label="发布计划"
          accent="from-brand-500/15 to-brand-600/5 text-brand-800"
        />
        <MetricCard
          icon={Award}
          value={formatProfileStatCount(data.badgeCount)}
          label="获得徽章"
          accent="from-amber-500/15 to-amber-600/5 text-amber-800"
        />
      </div>

      <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3 text-center sm:flex-row sm:justify-between sm:text-left">
        <SnailContributionTitleBadge score={contributionScore} showScore />
        <p className="text-[11px] leading-relaxed text-slate-600">
          留轨迹 +{CONTRIBUTION_SCORE_RULES.publishGuide} · 被撒盐 +{CONTRIBUTION_SCORE_RULES.receiveSalt} ·
          被收进壳里 +{CONTRIBUTION_SCORE_RULES.receiveShellKeep}
        </p>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-slate-900">
          {isOwnProfile ? '我的徽章' : '徽章'}
        </h3>
        {data.badges.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-500">
            还没有蜗壳徽章，多留轨迹点、多探索目的地吧
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {data.badges.map((badge) => {
              const meta = TRAVEL_BADGE_META[badge.id] ?? {
                icon: 'award' as const,
                accent: 'from-slate-500/10 to-slate-600/5 text-slate-700',
              };
              const Icon = BADGE_ICONS[meta.icon];

              return (
                <li
                  key={badge.id}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border border-slate-200/80 bg-gradient-to-br p-3',
                    meta.accent,
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-sm">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{badge.label}</p>
                    {badge.description && (
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                        {badge.description}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
