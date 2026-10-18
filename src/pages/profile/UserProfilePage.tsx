import { ArrowLeft, MessageCircle, UserRound } from 'lucide-react';
import { useCallback, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  UserProfileHeader,
  UserProfileContentTabs,
  UserProfileTravelDataPanel,
  UserProfileSettingsSection,
  UserProfileTravelSection,
  UserProfileInviteSection,
} from '@/components/features/profile';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import { useUserProfile } from '@/hooks';
import { useShareLandingTracking } from '@/hooks/share/useShareLandingTracking';
import { parseShareAttribution } from '@/lib/share/analytics/shareLink';
import { trackShareLandingView } from '@/lib/share/analytics/trackShareEvent';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { APP_NAME } from '@/lib/config/brand';
import { userProfilePageSeo } from '@/lib/seo';
import { messagesThreadPath } from '@/router/messagesPaths';
import { paths, userProfilePath } from '@/router/paths';
import { ensureBuddyConversation } from '@/utils/siteChat';
import type { GuidesPageState } from '@/types/router-state';
import { getTravelPlanCompanionPath } from '@/utils/travelPlanCompanionNavigation';
import { getCountryLabel } from '@/utils/userProfileView';
import '@/styles/holo-inner.css';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isOwnProfile } = useUserProfile();

  const pageSeo = useMemo(() => {
    if (!user) {
      return { title: `${SNAIL_GLOBAL_COPY.memberTerm}蜗居 — ${APP_NAME}`, path: paths.profile };
    }
    return userProfilePageSeo(user.username, user.id, {
      isOwnProfile,
      bio: user.bio,
      ogImage: user.avatar,
    });
  }, [user, isOwnProfile]);

  usePageSeo(pageSeo);
  useShareLandingTracking({ contentKind: 'user_profile', contentId: user?.id });

  useEffect(() => {
    if (!user) {
      return;
    }
    const attribution = parseShareAttribution(location.search);
    if (!attribution || attribution.contentKind !== 'travel_moment') {
      return;
    }
    trackShareLandingView({
      contentKind: 'travel_moment',
      contentId: attribution.contentId,
      channel: attribution.channel,
      shareUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }, [user, location.search]);

  const handleFindCompanion = useCallback(() => {
    if (!user) {
      return;
    }
    const destination = user.visitedCountries[0]
      ? getCountryLabel(user.visitedCountries[0])
      : user.username;

    const state: GuidesPageState = {
      travelBuddy: {
        planId: `profile-${user.id}`,
        planTitle: `与 ${user.username} 同游`,
        destination,
        days: 3,
        budgetLabel: '面议',
      },
    };

    navigate(getTravelPlanCompanionPath(), { state });
  }, [navigate, user]);

  const handleMessage = useCallback(() => {
    if (!user) {
      return;
    }
    ensureBuddyConversation({
      peerUserId: user.id,
      peerUsername: user.username,
      peerAvatar: user.avatar,
    });
    navigate(messagesThreadPath(user.id));
  }, [navigate, user]);

  return (
    <MotionPage className="holo-profile flex flex-col gap-4">
      <MotionBlock>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="holo-profile__back inline-flex items-center gap-1 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          返回
        </button>
      </MotionBlock>

      {!user && (
        <MotionBlock>
          <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <UserRound className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
            <h2 className="mt-3 text-base font-semibold text-slate-900">未找到该用户</h2>
            <p className="mt-2 text-sm text-slate-600">用户可能不存在或链接不正确。</p>
            <Link
              to={paths.home}
              className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              返回首页
            </Link>
          </section>
        </MotionBlock>
      )}

      {user && (
        <>
          <MotionBlock>
            <UserProfileHeader user={user} isOwnProfile={isOwnProfile} />
          </MotionBlock>

          <MotionBlock>
            <UserProfileTravelDataPanel user={user} isOwnProfile={isOwnProfile} />
          </MotionBlock>

          {isOwnProfile && (
            <MotionBlock>
              <UserProfileInviteSection userId={user.id} />
            </MotionBlock>
          )}

          <MotionBlock>
            <UserProfileTravelSection user={user} />
          </MotionBlock>

          <MotionBlock>
            <UserProfileContentTabs user={user} isOwnProfile={isOwnProfile} />
          </MotionBlock>

          {isOwnProfile && (
            <MotionBlock>
              <UserProfileSettingsSection user={user} isOwnProfile />
            </MotionBlock>
          )}

          {!isOwnProfile && (
            <MotionBlock>
              <section className="holo-profile__panel rounded-xl border border-[#b7cdc4] bg-[#fffef6] p-5 shadow-none">
                <h2 className="text-sm font-semibold text-[#2c6b58]">寻找旅伴</h2>
                <p className="mt-1 text-sm text-[#54786c]">
                  与 {user.username} 兴趣相近？前往攻略页看看同目的地灵感。
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleMessage}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#2c6b58] px-4 py-2.5 text-sm font-semibold text-[#f9f7eb] hover:brightness-105"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    发消息
                  </button>
                  <button
                    type="button"
                    onClick={handleFindCompanion}
                    className="inline-flex rounded-xl border border-[#b7cdc4] bg-white px-4 py-2.5 text-sm font-semibold text-[#2c6b58] hover:bg-emerald-50"
                  >
                    寻找旅伴
                  </button>
                </div>
              </section>
            </MotionBlock>
          )}

          {isOwnProfile && (
            <MotionBlock>
              <p className="text-center text-xs text-slate-400">
                演示主页 ·
                <Link
                  to={userProfilePath('user-maple')}
                  className="ml-1 text-brand-600 hover:underline"
                >
                  查看其他用户示例
                </Link>
              </p>
            </MotionBlock>
          )}
        </>
      )}
    </MotionPage>
  );
}
