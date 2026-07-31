import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import MotionSection from '@/components/motion/MotionSection';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { APP_NAME, BRAND_LOGO_TEXT } from '@/lib/config/brand';
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
    <>
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

      <MotionSection className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">
            {copy.about.heading} · {BRAND_LOGO_TEXT}
          </h2>
          <Link
            to={currentUserProfilePath()}
            className="inline-flex rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
          >
            {SNAIL_GLOBAL_COPY.myDen}
          </Link>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {APP_NAME} {isProduction ? copy.about.introPublic : copy.about.intro}
        </p>
        {isProduction ? (
          <p className="mt-4 text-sm text-slate-600">{copy.about.bulletNavPublic}</p>
        ) : (
          <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-slate-600">
            <li>{copy.about.bulletNav}</li>
            <li>{copy.about.bulletMap}</li>
            <li>{copy.about.bulletDev}</li>
          </ul>
        )}
      </MotionSection>

      <AboutSnailCultureSection />

      <AboutContactSection />

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
        className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-cyan-50 p-6 shadow-sm"
      >
        <h3 className="text-base font-semibold text-slate-900">{copy.about.authTitle}</h3>
        <p className="mt-2 text-sm text-slate-600">{copy.about.authDesc}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white opacity-60"
          >
            {copy.about.phoneLogin}
          </button>
          <button
            type="button"
            disabled
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 opacity-60"
          >
            {copy.about.wechatLogin}
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {copy.about.guestPrefix}
          <Link to={paths.home} className="mx-1 font-medium text-brand-600 hover:underline">
            {copy.about.exploreMap}
          </Link>
          {copy.about.guestMid}
          <Link to={paths.guides} className="mx-1 font-medium text-brand-600 hover:underline">
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
    </>
  );
}
