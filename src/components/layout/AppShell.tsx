import InviteReferralBanner from '@/components/features/invite/InviteReferralBanner';
import GlobalPlanResultHost from '@/components/features/planHistory/GlobalPlanResultHost';
import HistorySidebar from '@/components/features/planHistory/HistorySidebar';
import { ApiErrorBanner, RouteErrorBoundary } from '@/components/error';
import AnimatedOutlet from '@/components/layout/AnimatedOutlet';
import BottomNav from '@/components/layout/BottomNav';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import SkipToMainLink from '@/components/layout/SkipToMainLink';
import SiteFooter from '@/components/layout/SiteFooter';
import FutureTravelMotion from '@/components/layout/FutureTravelMotion';
import RoutePrefetchOnIdle from '@/router/RoutePrefetchOnIdle';
import { paths } from '@/router/paths';
import { isCapsuleOneHomeEnabled } from '@/lib/config/capsuleOne';
import { isHoloHomeEnabled } from '@/lib/config/holoHome';
import { isCapsuleAiSession } from '@/lib/capsule/capsuleAiSession';
import type { AiChatPageState } from '@/types/router-state';
import { Outlet, useLocation, useMatch } from 'react-router-dom';
import { cn } from '@/utils/cn';

/**
 * 应用根布局：顶栏 + 路由出口（带动画）+ 底栏导航。
 * 挂在 react-router 父路由上，子路由页面渲染在 AnimatedOutlet 内。
 */
export default function AppShell() {
  const location = useLocation();
  const routeState = location.state as AiChatPageState | null;
  const isHome = Boolean(useMatch({ path: paths.home, end: true }));
  const isAi = Boolean(useMatch({ path: paths.ai, end: true }));
  const isHoloDrive = Boolean(useMatch({ path: `${paths.drive.slice(1)}/:cityName` }));
  const isCapsuleHome = isHome && isCapsuleOneHomeEnabled();
  const isHoloHome = isHome && isHoloHomeEnabled();
  const isHoloExperience = isHoloHomeEnabled() && (isHoloHome || isHoloDrive);
  const isCapsuleAi = isAi && (routeState?.source === 'capsule_one' || isCapsuleAiSession());

  if (isHoloExperience) {
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

  if (isCapsuleHome || isCapsuleAi) {
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
