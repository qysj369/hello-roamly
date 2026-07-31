import { Globe2, Heart } from 'lucide-react';
import type { User } from '@/types/domain/user/user';
import { getCountryLabel, getInterestLabel } from '@/utils/userProfileView';
import { cn } from '@/utils/cn';

export type UserProfileTravelSectionProps = {
  user: User;
  className?: string;
};

export default function UserProfileTravelSection({
  user,
  className,
}: UserProfileTravelSectionProps) {
  const showCountries =
    user.privacySettings.showVisitedCountries || user.visitedCountries.length > 0;

  return (
    <section
      className={cn(
        'rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6',
        className,
      )}
      aria-labelledby="profile-travel-title"
    >
      <h2
        id="profile-travel-title"
        className="font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500"
      >
        旅行信息
      </h2>

      <div className="mt-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">旅行人格</h3>
          <p className="mt-1 text-sm text-slate-600">{user.travelPersonality.summary}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {user.travelPersonality.traits.map((trait) => (
              <span
                key={trait}
                className="rounded-lg bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {showCountries && (
          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Globe2 className="h-4 w-4 text-brand-600" aria-hidden />
              去过的国家/地区
            </h3>
            {user.visitedCountries.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {user.visitedCountries.map((code) => (
                  <li
                    key={code}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {getCountryLabel(code)}
                    <span className="ml-1 text-slate-400">{code}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-slate-500">暂未记录</p>
            )}
          </div>
        )}

        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Heart className="h-4 w-4 text-rose-500" aria-hidden />
            旅行兴趣
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {user.interests.map((interest) => (
              <li
                key={interest}
                className="rounded-lg border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-800"
              >
                {getInterestLabel(interest)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
