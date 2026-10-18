import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AboutBrandStorySection from '@/components/features/about/AboutBrandStorySection';
import AboutContactSection from '@/components/features/about/AboutContactSection';
import AboutMarketChinaSection from '@/components/features/about/AboutMarketChinaSection';
import AboutSnailCultureSection from '@/components/features/about/AboutSnailCultureSection';
import AboutCdnSection from '@/components/features/about/AboutCdnSection';
import AboutInviteSection from '@/components/features/about/AboutInviteSection';
import AboutSentrySection from '@/components/features/about/AboutSentrySection';
import AboutShareAnalyticsSection from '@/components/features/about/AboutShareAnalyticsSection';
import AboutWechatShareSection from '@/components/features/about/AboutWechatShareSection';
import AboutContentModerationSection from '@/components/features/about/AboutContentModerationSection';
import AboutPaymentSection from '@/components/features/about/AboutPaymentSection';
import AuthTokenDevPanel from '@/components/dev/AuthTokenDevPanel';
import DevPlayground from '@/components/dev/DevPlayground';
import UiShowcase from '@/components/dev/UiShowcase';
import { copy } from '@/content/copy';
import CapsuleContextBanner from '@/components/layout/CapsuleContextBanner';
import SiteComplianceBar from '@/components/layout/SiteComplianceBar';
import MotionPage from '@/components/motion/MotionPage';
import MotionSection from '@/components/motion/MotionSection';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { APP_NAME, BRAND_LOGO_TEXT, BRAND_MARK, BRAND_SPIRIT_SLOGAN } from '@/lib/config/brand';
import { isProductionAppMode } from '@/lib/config/appMode';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { aboutPageSeo } from '@/lib/seo';
import { currentUserProfilePath, paths } from '@/router/paths';
import type { AboutPageState, DiscoverPageState } from '@/types/router-state';

export default function AboutPage() {
  usePageSeo(aboutPageSeo(copy.about.pageTitle));
  const isProduction = isProductionAppMode();
  const location = useLocation();
  const authRef = useRef<HTMLElement>(null);
  const showAuthFocus = (location.state as AboutPageState | null)?.auth === 'login';
  const capsuleContext = (location.state as DiscoverPageState | null) ?? null;

  useEffect(() => {
    if (showAuthFocus && authRef.current) {
      authRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showAuthFocus]);

  return (
    <MotionPage className="holo-about flex flex-col gap-4 pb-8">
      {capsuleContext?.destination || capsuleContext?.aiDream ? (
        <MotionSection className="mb-4">
          <CapsuleContextBanner
            destination={capsuleContext.destination ?? capsuleContext.aiDream}
            dream={capsuleContext.aiDream}
            source={capsuleContext.fromCapsule ? 'capsule_one' : capsuleContext.source}
            variant="about"
          />
        </MotionSection>
      ) : null}

      {/* 品牌介绍 + 迭代规划：自首页页脚迁移，文案不变 */}
      <MotionSection>
        <AboutBrandStorySection />
      </MotionSection>

      <MotionSection className="holo-about__panel rounded-2xl border border-[#b7cdc4] bg-[#fffef6] p-6 shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-base font-semibold text-[#2c6b58]">
            {copy.about.heading} · {BRAND_LOGO_TEXT}
          </h2>
          <Link
            to={currentUserProfilePath()}
            className="inline-flex rounded-lg bg-[#2c6b58] px-3 py-1.5 text-xs font-semibold text-[#f9f7eb] hover:brightness-105"
          >
            {SNAIL_GLOBAL_COPY.myDen}
          </Link>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#54786c]">
          {APP_NAME} {isProduction ? copy.about.introPublic : copy.about.intro}
        </p>
        {isProduction ? (
          <p className="mt-4 text-sm text-[#54786c]">{copy.about.bulletNavPublic}</p>
        ) : (
          <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-[#54786c]">
            <li>{copy.about.bulletNav}</li>
            <li>{copy.about.bulletMap}</li>
            <li>{copy.about.bulletDev}</li>
          </ul>
        )}
      </MotionSection>

      <AboutSnailCultureSection />

      <AboutContactSection />

      <MotionSection className="holo-about__panel rounded-2xl border border-[#b7cdc4] bg-[#fffef6] p-6 shadow-none">
        <h2 className="text-base font-semibold text-[#2c6b58]">慢行灵感知识库</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#54786c]">
          结构化收录城市周末漫游、单人短途旅行灵感、亲子出游思路，供搜索与大模型抓取。
        </p>
        <Link to={paths.inspire} className="mt-3 inline-flex text-sm font-semibold text-[#2c6b58] hover:underline">
          打开知识库
        </Link>
      </MotionSection>

      {isProduction ? null : (
        <>
          <AboutMarketChinaSection />
          <AboutPaymentSection />
          <AboutContentModerationSection />
          <AboutCdnSection />
          <AboutWechatShareSection />
          <AboutShareAnalyticsSection />
        </>
      )}

      <AboutInviteSection />

      {isProduction ? null : <AboutSentrySection />}

      <section
        ref={authRef}
        className="holo-about__panel rounded-2xl border border-[#b7cdc4] bg-gradient-to-br from-emerald-50 to-[#fffef6] p-6 shadow-none"
      >
        <h3 className="text-base font-semibold text-[#2c6b58]">{copy.about.authTitle}</h3>
        <p className="mt-2 text-sm text-[#54786c]">{copy.about.authDesc}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#2c6b58] px-4 py-2.5 text-sm font-semibold text-[#f9f7eb] opacity-60"
          >
            {copy.about.phoneLogin}
          </button>
          <button
            type="button"
            disabled
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#b7cdc4] bg-[#fffef6] px-4 py-2.5 text-sm font-semibold text-[#54786c] opacity-60"
          >
            {copy.about.wechatLogin}
          </button>
        </div>
        <p className="mt-3 text-xs text-[#54786c]">
          {copy.about.guestPrefix}
          <Link to={paths.home} className="mx-1 font-medium text-[#2c6b58] hover:underline">
            {copy.about.exploreMap}
          </Link>
          {copy.about.guestMid}
          <Link to={paths.guides} className="mx-1 font-medium text-[#2c6b58] hover:underline">
            {copy.about.guidesLink}
          </Link>
        </p>
      </section>

      {isProduction ? null : (
        <>
          <UiShowcase />
          <AuthTokenDevPanel />
          <DevPlayground />
        </>
      )}

      <footer className="holo-about__footer mt-6 border-t border-[#b7cdc4] pt-6 pb-2 text-center">
        <p className="text-sm font-semibold text-[#2c6b58]">{BRAND_MARK}</p>
        <p className="mt-1 text-xs text-[#54786c]">{BRAND_SPIRIT_SLOGAN}</p>
        <SiteComplianceBar className="mt-4" variant="about" />
      </footer>
    </MotionPage>
  );
}
