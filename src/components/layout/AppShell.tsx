import TravelAgentHost from '@/components/agent/TravelAgentHost';
import InviteReferralBanner from '@/components/features/invite/InviteReferralBanner';
import GlobalPlanResultHost from '@/components/features/planHistory/GlobalPlanResultHost';
import HistorySidebar from '@/components/features/planHistory/HistorySidebar';
import { ApiErrorBanner, RouteErrorBoundary } from '@/components/error';
import HoloShellToast from '@/components/error/HoloShellToast';
import AnimatedOutlet from '@/components/layout/AnimatedOutlet';
import BottomNav from '@/components/layout/BottomNav';
import HoloInnerHeader from '@/components/layout/HoloInnerHeader';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import SkipToMainLink from '@/components/layout/SkipToMainLink';
import SiteComplianceBar from '@/components/layout/SiteComplianceBar';
import SiteFooter from '@/components/layout/SiteFooter';
import FutureTravelMotion from '@/components/layout/FutureTravelMotion';
import { useI18n } from '@/i18n/useI18n';
import RoutePrefetchOnIdle from '@/router/RoutePrefetchOnIdle';
import { paths } from '@/router/paths';
import { isCapsuleOneHomeEnabled } from '@/lib/config/capsuleOne';
import { isHoloHomeEnabled } from '@/lib/config/holoHome';
import { isCapsuleAiSession } from '@/lib/capsule/capsuleAiSession';
import type { AiChatPageState } from '@/types/router-state';
import { Outlet, useLocation, useMatch } from 'react-router-dom';
import { cn } from '@/utils/cn';
import '@/styles/holo-inner.css';

/**
 * 应用根布局：顶栏 + 路由出口（带动画）+ 底栏导航。
 * 挂在 react-router 父路由上，子路由页面渲染在 AnimatedOutlet 内。
 */
export default function AppShell() {
  const location = useLocation();
  const { messages: t } = useI18n();
  const routeState = location.state as AiChatPageState | null;
  const isHome = Boolean(useMatch({ path: paths.home, end: true }));
  const isAi = Boolean(useMatch({ path: paths.ai, end: true }));
  const isGuidesIndex = Boolean(useMatch({ path: paths.guides, end: true }));
  const isGuidesPublish = Boolean(useMatch({ path: paths.guidesPublish, end: true }));
  const isGuideDetail = Boolean(useMatch({ path: `${paths.guides}/:guideId`, end: true }));
  const isDiscover = Boolean(useMatch({ path: paths.discover, end: true }));
  const isAiSnail = Boolean(useMatch({ path: paths.aiSnail, end: true }));
  const isTravelBuddies = Boolean(useMatch({ path: paths.travelBuddies, end: true }));
  const isTravelBuddyNew = Boolean(useMatch({ path: paths.travelBuddyNew, end: true }));
  const isProfile = Boolean(useMatch({ path: paths.profile, end: true }));
  const isMessagesIndex = Boolean(useMatch({ path: paths.messages, end: true }));
  const isMessagesThread = Boolean(useMatch({ path: `${paths.messages}/:peerUserId`, end: true }));
  const isMessages = isMessagesIndex || isMessagesThread;
  const isPlanDetail = Boolean(useMatch({ path: `${paths.plans}/:planId`, end: true }));
  const isSavedPlanDetail = Boolean(useMatch({ path: `${paths.savedPlans}/:planId`, end: true }));
  const isAbout = Boolean(useMatch({ path: paths.about, end: true }));
  const isCities = Boolean(useMatch({ path: paths.cities, end: true }));
  const isMp = Boolean(useMatch({ path: paths.mp, end: true }));
  const isInspire = Boolean(useMatch({ path: paths.inspire, end: true }));
  const isPrivacy = Boolean(useMatch({ path: paths.privacy, end: true }));
  const isTerms = Boolean(useMatch({ path: paths.terms, end: true }));
  const isContact = Boolean(useMatch({ path: paths.contact, end: true }));
  const isFeedback = Boolean(useMatch({ path: paths.feedback, end: true }));
  const isHoloDrive = Boolean(useMatch({ path: `${paths.drive}/:cityName`, end: true }));
  const isSnailFlight = Boolean(useMatch({ path: paths.snailFlight, end: true }));
  /** 合规页自带壳，勿与首页共用 isHoloExperience Outlet（会触发 React #300） */
  const isHoloLegalSelfPage = isHoloHomeEnabled() && (isPrivacy || isTerms || isContact || isFeedback);
  const isCapsuleHome = isHome && isCapsuleOneHomeEnabled();
  const isHoloHome = isHome && isHoloHomeEnabled();
  /** 仅首页 + 驾驶舱；城市列表走内页壳，避免同壳替换崩溃 */
  const isHoloExperience = isHoloHomeEnabled() && (isHoloHome || isHoloDrive);
  /** Holo 内页统一壳：避免 Tab 跳转时壳层切换导致异常 */
  const isCapsuleAi = isAi && (routeState?.source === 'capsule_one' || isCapsuleAiSession());
  const isHoloInnerPage =
    isHoloHomeEnabled() &&
    ((isAi && !isCapsuleAi) ||
      isGuidesIndex ||
      isGuidesPublish ||
      isGuideDetail ||
      isDiscover ||
      isAiSnail ||
      isTravelBuddies ||
      isTravelBuddyNew ||
      isProfile ||
      isMessages ||
      isPlanDetail ||
      isSavedPlanDetail ||
      isAbout ||
      isCities ||
      isMp ||
      isInspire);

  const innerPageLabel = isGuidesPublish
    ? '发布攻略'
    : isGuideDetail
      ? '攻略详情'
      : isGuidesIndex
        ? t.nav.guides
        : isDiscover
          ? t.tabs.stories
          : isAi
            ? t.tabs.advisor
          : isAiSnail
            ? 'AI蜗牛'
            : isTravelBuddies || isTravelBuddyNew
              ? t.tabs.buddy
              : isProfile
                ? t.tabs.me
                : isMessages
                  ? t.tabs.messages
                  : isPlanDetail || isSavedPlanDetail
                    ? '行程详情'
                    : isAbout
                      ? '关于我们'
                      : isMp
                        ? '行程工具'
                      : isInspire
                        ? '慢行灵感'
                      : isCities
                        ? t.nav.cities
                        : t.nav.guides;

  if (isHoloExperience) {
    const shellKey = isHoloHome ? 'holo-home' : 'holo-drive';
    return (
      <div key={shellKey} className="holo-app-shell">
        <SkipToMainLink />
        <HoloShellToast />
        <main id="main-content" tabIndex={-1} className="outline-none">
          <RouteErrorBoundary>
            <Outlet />
          </RouteErrorBoundary>
        </main>
        {isHoloDrive ? <SiteComplianceBar className="holo-drive__compliance" /> : null}
        <GlobalPlanResultHost />
        {isHoloHome ? <TravelAgentHost /> : null}
      </div>
    );
  }

  if (isHoloLegalSelfPage) {
    return (
      <div className="holo-app-shell">
        <SkipToMainLink />
        <main id="main-content" tabIndex={-1} className="outline-none">
          <RouteErrorBoundary>
            <Outlet />
          </RouteErrorBoundary>
        </main>
      </div>
    );
  }

  if (isHoloInnerPage) {
    return (
      <div className="holo-inner-shell">
        <SkipToMainLink />
        <HoloShellToast />
        <HoloInnerHeader pageLabel={innerPageLabel} />
        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            'holo-inner-shell__main outline-none',
            isSavedPlanDetail && 'holo-inner-shell__main--plan',
          )}
        >
          <RouteErrorBoundary>
            <Outlet />
          </RouteErrorBoundary>
        </main>
        <SiteComplianceBar className="holo-inner-shell__compliance" />
        <BottomNav />
        <RoutePrefetchOnIdle />
        <GlobalPlanResultHost />
        {isAi ? null : <TravelAgentHost />}
      </div>
    );
  }

  if (isCapsuleHome || isCapsuleAi || isSnailFlight) {
    return (
      <div className="capsule-app-shell">
        <SkipToMainLink />
        <main id="main-content" tabIndex={-1} className="outline-none">
          <RouteErrorBoundary>
            <Outlet />
          </RouteErrorBoundary>
        </main>
      </div>
    );
  }

  return (
    <PageContainer className={cn(isHome && 'pt-3 sm:pt-4')}>
      <FutureTravelMotion />
      <SkipToMainLink />
      <PageHeader />
      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <InviteReferralBanner />
        <ApiErrorBanner />
        <RouteErrorBoundary>
          <AnimatedOutlet />
        </RouteErrorBoundary>
      </main>
      <SiteFooter />
      <BottomNav />
      <RoutePrefetchOnIdle />
      <HistorySidebar />
      <GlobalPlanResultHost />
    </PageContainer>
  );
}
