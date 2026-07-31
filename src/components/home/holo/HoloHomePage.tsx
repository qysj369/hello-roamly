import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SnailBrandLogo from '@/components/brand/SnailBrandLogo';
import HeroSnailGraphic from '@/components/home/holo/HeroSnailGraphic';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { useI18n } from '@/i18n/useI18n';
import { BRAND_LOCKUP } from '@/lib/config/brand';
import {
  SITE_ICP_NUMBER,
  SITE_ICP_URL,
  SITE_MPS_BEIAN_NUMBER,
  SITE_MPS_BEIAN_URL,
} from '@/lib/config/siteCompliance';
import { homePageSeo } from '@/lib/seo';
import { paths } from '@/router/paths';
import '@/styles/holo-theme.css';
import '@/styles/holo-home.css';
import '@/styles/snail-brand-logo.css';

function useIsDesktopLayout() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true,
  );

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsDesktop(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return isDesktop;
}

/** 分类卡图标 — 对齐清晰参考图：细线蜗牛风（~1.25） */
function CardIcon({ name }: { name: 'rock' | 'farm' | 'raft' | 'budget' }) {
  if (name === 'rock') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden className="holo-home__card-icon">
        <circle cx="18" cy="16" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="18" cy="16" r="2.2" fill="currentColor" />
        <path
          d="M11 20c-3 1-5 3-5 5h10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path d="M12 12c-1.5-3-3.5-4.5-5.5-5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="6" cy="6.5" r="1.3" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M14 10c0-2.5 1-4.5 2.8-5.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="17.2" cy="4" r="1.3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  if (name === 'farm') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden className="holo-home__card-icon">
        <path
          d="M8 20 16 12l8 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 18v8h12v-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M14 26v-4h4v4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M22 14c1.2-2 2.8-3 4.5-3.2" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'raft') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden className="holo-home__card-icon">
        <circle cx="15" cy="14" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="15" cy="14" r="1.8" fill="currentColor" />
        <path d="M9 18c-2.5 1.5-4 3.5-4 5.5h12" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <path d="M5 26c3 0 5-1.2 7-1.2S16 26 19 26" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
        <path d="M11 9c-1-2.5-2.5-3.8-4.2-4.2" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
        <circle cx="6.2" cy="4.2" r="1.2" fill="none" stroke="currentColor" strokeWidth="1.15" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" aria-hidden className="holo-home__card-icon">
      <path
        d="M10 22c0-6 4.2-10 9-10 4.2 0 7.5 2.8 7.5 6.8 0 3.2-2.2 5.4-5.2 5.4-2.4 0-4-1.6-4-3.8 0-2 1.4-3.4 3.4-3.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="10" cy="22" r="1.5" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="holo-home__search-icon">
      <circle cx="11" cy="11" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.55" />
      <path d="M15.8 15.8 20.2 20.2" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  );
}

function TabIcon({ name }: { name: 'home' | 'routes' | 'stories' | 'buddy' | 'me' }) {
  if (name === 'home') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z" fill="currentColor" />
      </svg>
    );
  }
  if (name === 'routes') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path
          d="M7 6h6a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="7" cy="6" r="1.6" fill="currentColor" />
        <circle cx="17" cy="18" r="1.6" fill="currentColor" />
      </svg>
    );
  }
  if (name === 'stories') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M8.5 13.2c.8 1.2 1.9 1.8 3.5 1.8s2.7-.6 3.5-1.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="9.2" cy="10" r="1" fill="currentColor" />
        <circle cx="14.8" cy="10" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (name === 'buddy') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <circle cx="9" cy="9" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="15.5" cy="9.5" r="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M4.8 18c.8-2.2 2.6-3.4 4.8-3.4s4 1.2 4.8 3.4M14 14.8c1.5.2 2.8 1.1 3.5 2.7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="9" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5.5 19c1.2-3 3.4-4.5 6.5-4.5s5.3 1.5 6.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 首页：顶栏 → Hero → 三入口 → 卡片流（高度还原设计稿） */
export default function HoloHomePage() {
  const { messages: t, locale, setPreferredLocale } = useI18n();
  const isDesktop = useIsDesktopLayout();

  usePageSeo({
    ...homePageSeo(),
    title: `${t.brand.logo} | ${t.brand.slogan}`,
    description: t.hero.desc,
  });

  useEffect(() => {
    document.documentElement.classList.add('holo-home-active');
    return () => {
      document.documentElement.classList.remove('holo-home-active');
    };
  }, []);

  const cards = [
    { key: 'rock', label: t.inspire.rock, to: paths.guides, art: 'rock' as const },
    { key: 'farm', label: t.inspire.farm, to: paths.discover, art: 'farm' as const },
    { key: 'raft', label: t.inspire.raft, to: paths.guides, art: 'raft' as const },
    { key: 'budget', label: t.inspire.budget, to: paths.aiSnail, art: 'budget' as const },
  ];

  return (
    <div className="holo-home">
      <header className="holo-home__header">
        <div className="holo-home__header-inner">
          <div className="holo-home__brand-wrap">
            <SnailBrandLogo variant="full" size={isDesktop ? 36 : 28} className="holo-home__brand-logo" />
          </div>
          <div className="holo-home__header-right">
            <p className="holo-home__header-slogan">
              {locale === 'zh' ? (
                <>
                  <span className="holo-home__header-slogan-core">极简于心</span>
                  <span className="holo-home__header-slogan-tail">，慢行致远</span>
                </>
              ) : (
                t.brand.slogan
              )}
            </p>
            <Link to={paths.guides} className="holo-home__search" aria-label={t.nav.guides}>
              <SearchIcon />
            </Link>
          </div>
        </div>
      </header>

      <main className="holo-home__main">
        <section
          className={`holo-home__hero ${isDesktop ? 'holo-home__hero--pc' : 'holo-home__hero--mobile'}`}
          aria-label="主视觉"
        >
          <div className="holo-home__hero-stage">
            <div className="holo-home__hero-copy">
              <h1 className="holo-home__hero-title">{t.hero.title}</h1>
              <p className="holo-home__hero-desc">{t.hero.desc}</p>
            </div>

            <div className="holo-home__hero-graphic" aria-hidden="true">
              <div className="holo-home__graphic-stage">
                <HeroSnailGraphic />
              </div>
            </div>
          </div>

          <nav className="holo-home__hero-pills" aria-label="快捷入口">
            <Link to={paths.guides} className="holo-home__pill">
              {t.hero.ctaNiche}
            </Link>
            <Link to={paths.aiSnail} className="holo-home__pill">
              {t.hero.ctaBudget}
            </Link>
            <Link to={paths.discover} className="holo-home__pill">
              {t.hero.ctaStories}
            </Link>
          </nav>
        </section>

        <section className="holo-home__cards" aria-label={t.inspire.sectionTitle}>
          <h2 className="holo-home__cards-title">{t.inspire.sectionTitle}</h2>
          <div className="holo-home__card-row">
            {cards.map((card) => (
              <Link key={card.key} to={card.to} className="holo-home__card">
                <span className="holo-home__card-icon-wrap" aria-hidden>
                  <CardIcon name={card.art} />
                </span>
                <span className="holo-home__card-label">{card.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {isDesktop ? (
          <footer className="holo-home__footer">
            <p className="holo-home__footer-line">{BRAND_LOCKUP}</p>
            <div className="holo-home__lang" role="group" aria-label="Language">
              <button
                type="button"
                className={locale === 'zh' ? 'is-active' : undefined}
                onClick={() => setPreferredLocale('zh')}
              >
                {t.footer.langZh}
              </button>
              <button
                type="button"
                className={locale === 'en' ? 'is-active' : undefined}
                onClick={() => setPreferredLocale('en')}
              >
                {t.footer.langEn}
              </button>
            </div>
            <div className="holo-home__beian">
              <a href={SITE_ICP_URL} rel="noreferrer" target="_blank">
                {SITE_ICP_NUMBER}
              </a>
              <span aria-hidden> · </span>
              <a href={SITE_MPS_BEIAN_URL} rel="noreferrer" target="_blank">
                {SITE_MPS_BEIAN_NUMBER}
              </a>
            </div>
          </footer>
        ) : null}
      </main>

      {!isDesktop ? (
        <nav className="holo-home__tabbar" aria-label="底部导航">
          <Link to={paths.home} className="holo-home__tab is-active" aria-current="page">
            <TabIcon name="home" />
            <span>{t.tabs.home}</span>
          </Link>
          <Link to={paths.guides} className="holo-home__tab">
            <TabIcon name="routes" />
            <span>{t.tabs.routes}</span>
          </Link>
          <Link to={paths.discover} className="holo-home__tab">
            <TabIcon name="stories" />
            <span>{t.tabs.stories}</span>
          </Link>
          <Link to={paths.travelBuddies} className="holo-home__tab">
            <TabIcon name="buddy" />
            <span>{t.tabs.buddy}</span>
          </Link>
          <Link to={paths.profile} className="holo-home__tab">
            <TabIcon name="me" />
            <span>{t.tabs.me}</span>
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
