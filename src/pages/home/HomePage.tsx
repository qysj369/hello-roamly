import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import HomeCommunityPulse from '@/components/features/home/HomeCommunityPulse';
import HomeFeaturedStrip from '@/components/features/home/HomeFeaturedStrip';
import HomeHotCitiesSection from '@/components/features/home/HomeHotCitiesSection';
import HomeLaunchPromoSection from '@/components/features/home/HomeLaunchPromoSection';
import HomeSnailTrailFeed from '@/components/features/home/HomeSnailTrailFeed';
import HomeMapTrailWallLazy from '@/components/features/home/mapTrailWall/HomeMapTrailWallLazy';
import CapsuleOneHomePage from '@/components/capsule-one/HomePage';
import HoloHomePage from '@/components/home/holo/HoloHomePage';
import { isCapsuleOneHomeEnabled } from '@/lib/config/capsuleOne';
import { isHoloHomeEnabled } from '@/lib/config/holoHome';
import { isLaunchHomeLayout } from '@/lib/config/homeLayout';
import { HOME_MAP_TRAIL_SECTION_ID } from '@/lib/config/homeMapTrail';
import { bindHideInjectedMapAssistants } from '@/lib/map/hideInjectedMapAssistants';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { homePageSeo } from '@/lib/seo';
import { cn } from '@/utils/cn';

/** 首页 — 蜗牛号座舱（默认）/ 浅米白旧首页 / 旧版地图 Hero */
export default function HomePage() {
  if (isCapsuleOneHomeEnabled()) {
    return <CapsuleOneHomePage />;
  }

  if (isHoloHomeEnabled()) {
    return <HoloHomePage />;
  }

  return <LegacyHomePage />;
}

function LegacyHomePage() {
  usePageSeo(homePageSeo());
  const location = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);
  const isLaunchLayout = isLaunchHomeLayout();

  useEffect(() => {
    const root = pageRef.current;
    if (!root) {
      return undefined;
    }
    return bindHideInjectedMapAssistants(root);
  }, []);

  useEffect(() => {
    if (location.hash !== `#${HOME_MAP_TRAIL_SECTION_ID}`) {
      return;
    }
    document.getElementById(HOME_MAP_TRAIL_SECTION_ID)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [location.hash]);

  return (
    <div
      ref={pageRef}
      className={cn(
        'home-page home-page--scroll flex w-full flex-col gap-0 pb-2',
        isLaunchLayout ? 'home-page--launch' : 'home-page--plan-a',
      )}
    >
      <h1 className="sr-only">蜗牛旅行 — 输入城市与天数，地图一键规划漫行方案</h1>

      <section
        id={HOME_MAP_TRAIL_SECTION_ID}
        aria-label="地图一键规划"
        className="w-full scroll-mt-[var(--app-header-offset)]"
      >
        <HomeMapTrailWallLazy variant="hero" />
      </section>

      <div className="home-page__content flex w-full flex-col gap-5 pt-5 sm:gap-7 sm:pt-7">
        <HomeHotCitiesSection />
        <HomeFeaturedStrip />
        <HomeSnailTrailFeed />
        <HomeCommunityPulse />
        {isLaunchLayout ? <HomeLaunchPromoSection /> : null}
      </div>
    </div>
  );
}
