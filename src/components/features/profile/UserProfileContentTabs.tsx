import { Bookmark, MapPinned, Sparkles, Users } from 'lucide-react';
import { useCallback, useEffect, useId, useState } from 'react';
import { isTravelMomentShareHash } from '@/router/paths';
import type { User } from '@/types/domain/user/user';
import UserProfileCompanionsPanel from '@/components/features/profile/tabs/UserProfileCompanionsPanel';
import UserProfileFavoritesPanel from '@/components/features/profile/tabs/UserProfileFavoritesPanel';
import UserProfileMomentsPanel from '@/components/features/profile/tabs/UserProfileMomentsPanel';
import UserProfilePlansPanel from '@/components/features/profile/tabs/UserProfilePlansPanel';
import { useUserProfileContent } from '@/hooks/profile/useUserProfileContent';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { cn } from '@/utils/cn';

export type UserProfileContentTabsProps = {
  user: User;
  isOwnProfile: boolean;
  className?: string;
};

type ProfileContentTab = 'plans' | 'moments' | 'favorites' | 'companions';

const TAB_ORDER: ProfileContentTab[] = ['plans', 'moments', 'favorites', 'companions'];

function getTabLabel(tab: ProfileContentTab, isOwnProfile: boolean): string {
  if (isOwnProfile) {
    const labels: Record<ProfileContentTab, string> = {
      plans: '旅行计划',
      moments: '旅行瞬间',
      favorites: SNAIL_GLOBAL_COPY.favoritesTab,
      companions: '旅伴',
    };
    return labels[tab];
  }
  const publicLabels: Record<ProfileContentTab, string> = {
    plans: '旅行计划',
    moments: '旅行瞬间',
    favorites: SNAIL_GLOBAL_COPY.favoritesTab,
    companions: '旅伴',
  };
  return publicLabels[tab];
}

const TAB_ICONS = {
  plans: MapPinned,
  moments: Sparkles,
  favorites: Bookmark,
  companions: Users,
} as const;

/** 资料页内容区：计划 / 瞬间 / 收藏 / 旅伴 */
export default function UserProfileContentTabs({
  user,
  isOwnProfile,
  className,
}: UserProfileContentTabsProps) {
  const [activeTab, setActiveTab] = useState<ProfileContentTab>('plans');
  const tabsId = useId();
  const content = useUserProfileContent(user, isOwnProfile);

  const handleTab = useCallback((tab: ProfileContentTab) => {
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    if (isTravelMomentShareHash(window.location.hash)) {
      setActiveTab('moments');
    }
  }, []);

  if (!content) {
    return null;
  }

  const counts: Record<ProfileContentTab, number> = {
    plans: content.plans.length,
    moments: content.moments.length,
    favorites: content.favorites.length,
    companions: content.following.length + content.followers.length,
  };

  return (
    <section
      className={cn('rounded-2xl border border-slate-200/90 bg-white shadow-sm', className)}
      aria-labelledby={`${tabsId}-title`}
    >
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <h2 id={`${tabsId}-title`} className="text-sm font-semibold text-slate-900">
          {isOwnProfile ? SNAIL_GLOBAL_COPY.myDen : `${user.username} 的蜗居`}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          AI 计划、图文瞬间、{SNAIL_GLOBAL_COPY.favorite}与旅伴关系
        </p>
      </div>

      <div
        className="flex gap-1 overflow-x-auto border-b border-slate-100 px-2 py-2 sm:px-3"
        role="tablist"
        aria-label="内容分类"
      >
        {TAB_ORDER.map((tab) => {
          const Icon = TAB_ICONS[tab];
          const selected = activeTab === tab;
          const tabBtnId = `${tabsId}-tab-${tab}`;
          const panelId = `${tabsId}-panel-${tab}`;

          return (
            <button
              key={tab}
              type="button"
              id={tabBtnId}
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              onClick={() => handleTab(tab)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition',
                selected
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {getTabLabel(tab, isOwnProfile)}
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                  selected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600',
                )}
              >
                {counts[tab]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-4 sm:p-5">
        {TAB_ORDER.map((tab) => {
          const panelId = `${tabsId}-panel-${tab}`;
          const tabBtnId = `${tabsId}-tab-${tab}`;
          const hidden = activeTab !== tab;

          return (
            <div
              key={tab}
              id={panelId}
              role="tabpanel"
              aria-labelledby={tabBtnId}
              hidden={hidden}
              className={hidden ? 'hidden' : undefined}
            >
              {tab === 'plans' && (
                <UserProfilePlansPanel
                  plans={content.plans}
                  isOwnProfile={isOwnProfile}
                  userId={user.id}
                />
              )}
              {tab === 'moments' && (
                <UserProfileMomentsPanel
                  moments={content.moments}
                  isOwnProfile={isOwnProfile}
                  authorId={user.id}
                  defaultMomentVisibility={user.privacySettings.defaultMomentVisibility}
                />
              )}
              {tab === 'favorites' && (
                <UserProfileFavoritesPanel
                  favorites={content.favorites}
                  isOwnProfile={isOwnProfile}
                />
              )}
              {tab === 'companions' && (
                <UserProfileCompanionsPanel
                  following={content.following}
                  followers={content.followers}
                  isOwnProfile={isOwnProfile}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
