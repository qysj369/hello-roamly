import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { flyGlobalRoutes, flyHomeMedia, flyJinanRoutes } from '@/data/flyHomeCatalog';
import { getFlyHomeCopy } from '@/i18n/flyHomeCopy';
import { useI18n } from '@/i18n/useI18n';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { homePageSeo } from '@/lib/seo';
import { paths } from '@/router/paths';
import '@/styles/fly-home.css';

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@500;700;900&display=swap';

function Star() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden>
      <path d="M12 2l2.2 5.6L20 9.8l-5.8 2.2L12 17.6l-2.2-5.6L4 9.8l5.8-2.2z" />
    </svg>
  );
}

const routeVideos = new Set<HTMLVideoElement>();
let routeActive: HTMLVideoElement | null = null;
let routeListening = false;
let routeFrame = 0;

function routeVisibleRatio(video: HTMLVideoElement) {
  const rect = video.getBoundingClientRect();
  const viewH = window.innerHeight || 1;
  const visible = Math.min(rect.bottom, viewH) - Math.max(rect.top, 0);
  return rect.height > 0 ? visible / rect.height : 0;
}

function syncRouteVideos() {
  const nodes = Array.from(routeVideos);
  const ranked = nodes
    .map((node) => ({ node, ratio: routeVisibleRatio(node) }))
    .sort((a, b) => b.ratio - a.ratio);
  const best = ranked.find((item) => item.ratio >= 0.62)?.node ?? null;
  const currentRatio =
    routeActive && routeVideos.has(routeActive) ? routeVisibleRatio(routeActive) : 0;
  const pick = routeActive && currentRatio >= 0.4 ? routeActive : best;
  routeActive = pick;
  nodes.forEach((node) => {
    if (node !== pick) {
      node.pause();
    }
  });
  if (!pick) {
    return;
  }
  const src = pick.dataset.flySrc || '';
  if (src && pick.dataset.flyLoaded !== src) {
    pick.dataset.flyLoaded = src;
    pick.src = src;
  }
  const wantMuted = pick.dataset.flySound !== '1';
  if (pick.muted !== wantMuted) {
    pick.muted = wantMuted;
  }
  if (pick.paused) {
    pick.play().catch(() => undefined);
  }
}

function scheduleRouteVideos() {
  window.cancelAnimationFrame(routeFrame);
  routeFrame = window.requestAnimationFrame(() => syncRouteVideos());
}

function ensureRouteLoop() {
  if (routeListening) {
    return;
  }
  routeListening = true;
  window.addEventListener('scroll', scheduleRouteVideos, { passive: true });
}

function LazyRouteVideo({
  src,
  poster,
  soundOn,
}: {
  src: string;
  poster: string;
  soundOn: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) {
      return undefined;
    }
    video.dataset.flySrc = src;
    video.dataset.flySound = soundOn ? '1' : '0';
    routeVideos.add(video);
    ensureRouteLoop();
    scheduleRouteVideos();
    const observer = new IntersectionObserver(() => scheduleRouteVideos(), {
      threshold: [0, 0.4, 0.62],
    });
    observer.observe(video);
    return () => {
      observer.disconnect();
      routeVideos.delete(video);
      if (routeActive === video) {
        routeActive = null;
      }
      video.pause();
      scheduleRouteVideos();
    };
  }, [soundOn, src]);

  return (
    <video
      ref={ref}
      data-fly-route=""
      poster={poster}
      muted={!soundOn}
      loop
      playsInline
      preload="none"
    >
      <track kind="captions" srcLang="zh" label="中文" />
    </video>
  );
}

export default function FlyHomePage() {
  const { locale, setPreferredLocale } = useI18n();
  const copy = getFlyHomeCopy(locale);
  usePageSeo(homePageSeo());
  const heroRef = useRef<HTMLVideoElement>(null);
  const [solidNav, setSolidNav] = useState(false);
  const [titleOn, setTitleOn] = useState(false);
  const [preGone, setPreGone] = useState(false);
  const [toast, setToast] = useState('');
  const [narrationOn, setNarrationOn] = useState(false);
  const toastTimer = useRef<number | null>(null);
  const narrationStarted = useRef(false);

  useEffect(() => {
    const id = 'fly-home-fonts';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN';
  }, [locale]);

  useEffect(() => {
    const video = heroRef.current;
    if (!video) {
      return undefined;
    }
    video.play().catch(() => undefined);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setTitleOn(true);
      setPreGone(true);
      return undefined;
    }
    const showTitle = window.setTimeout(() => setTitleOn(true), 700);
    const hidePre = window.setTimeout(() => setPreGone(true), 2200);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry || !heroRef.current) {
          return;
        }
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
          heroRef.current.play().catch(() => undefined);
        } else {
          heroRef.current.pause();
        }
      },
      { threshold: [0, 0.45] },
    );
    observer.observe(video);
    return () => {
      window.clearTimeout(showTitle);
      window.clearTimeout(hidePre);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setSolidNav(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }
    toastTimer.current = window.setTimeout(() => setToast(''), 2600);
  };

  const comingMessage = (name: string) =>
    locale === 'en' ? `${copy.comingToast}: ${name}` : `${name}${copy.comingToast}`;

  return (
    <div className="fly-home">
      <nav className={solidNav ? 'nav solid' : 'nav'}>
        <Link to={paths.home} className="logo">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 4c-5 2-8 6-8 10 0 5 4 8 8 8s8-3 8-7c0-2-1.4-2.7-2.8-1.8-1 .6-1.4 1.8-.8 3 .5 1.6 2.6 1.5 3-.5.5-2-.4-4.4-2.9-6S13 7.4 11 9.4c-1.8 1.8-1.8 5.4.5 7.3"
              stroke="#77E0C3"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          蜗牛旅行 <span className="en">ROAMLY</span>
        </Link>
        <div className="nav-links">
          <a href="#routes">{copy.navRoutes}</a>
          <a href="#picks">{copy.navPicks}</a>
          <a href="#feeds">{copy.navFeeds}</a>
          <a href="#challenge">{copy.navChallenge}</a>
        </div>
        <div className="nav-right">
          <button
            className="lang-btn"
            type="button"
            onClick={() => setPreferredLocale(locale === 'en' ? 'zh' : 'en')}
          >
            {copy.lang}
          </button>
          <Link className="login-btn" to={paths.login}>
            {copy.login}
          </Link>
        </div>
      </nav>

      <header className="hero" id="hero">
        <video
          ref={heroRef}
          className="hero-video on"
          src={flyHomeMedia.hero}
          poster={flyHomeMedia.baotuPoster}
          muted={!narrationOn}
          loop
          playsInline
          preload="auto"
        >
          <track kind="captions" srcLang="zh" label="中文" />
        </video>
        <div className={preGone ? 'hero-pre gone' : 'hero-pre'}>
          <p>{copy.pre1}</p>
          <p>{copy.pre2}</p>
        </div>
        <div className={titleOn ? 'hero-main show' : 'hero-main'}>
          <span className="hero-kicker">{copy.kicker}</span>
          <h1 className="serif">
            {copy.heroTitleBefore}
            <span className="hl">{copy.heroTitleHl}</span>
            {copy.heroTitleAfter}
          </h1>
          <p className="hero-sub">{copy.heroSub}</p>
          <button
            className={narrationOn ? 'narration-btn is-on' : 'narration-btn'}
            type="button"
            onClick={() => {
              const video = heroRef.current;
              const next = !narrationOn;
              if (video) {
                if (next && !narrationStarted.current) {
                  video.currentTime = 0;
                  narrationStarted.current = true;
                }
                video.muted = !next;
                video.volume = 1;
                if (next) {
                  video.play().catch(() => undefined);
                }
              }
              setNarrationOn(next);
            }}
          >
            {narrationOn ? copy.narrationOn : copy.narrationOff}
          </button>
        </div>
        <div className="hero-scroll">{copy.scroll}</div>
      </header>

      <main className="wrap">
        <div className="sec-head" id="routes">
          <h2 className="sec-title serif">{copy.tRoutes}</h2>
          <span className="sec-note">{copy.tRoutesNote}</span>
        </div>
        <div className="routes global">
          {flyGlobalRoutes.map((route) => (
            <button
              key={route.id}
              className="route"
              type="button"
              onClick={() => showToast(comingMessage(copy[route.nameKey]))}
            >
              <img src={route.image} alt={route.alt} />
              <span className="ai">
                <Star />
                {copy.aiMaking}
              </span>
              <span className="route-info">
                <span className="route-name serif">{copy[route.nameKey]}</span>
                <span className="route-desc">{copy[route.descKey]}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="sec-head spaced" id="jinan">
          <h2 className="sec-title serif">{copy.tJinan}</h2>
          <span className="sec-note">{copy.tJinanNote}</span>
        </div>
        <div className="routes jinan">
          {flyJinanRoutes.map((route) => (
            <a key={route.id} className="route" href={route.href}>
              <LazyRouteVideo src={route.video} poster={route.poster} soundOn={narrationOn} />
              <span className="ai">
                <Star />
                {copy[route.badge]}
              </span>
              <span className="route-info">
                <span className="route-name serif">{copy[route.nameKey]}</span>
                <span className="route-desc">
                  {copy[route.descKey]}
                  <br />
                  {copy[route.placeKey]}
                </span>
              </span>
            </a>
          ))}
        </div>

        <div className="sec-head spaced" id="picks">
          <h2 className="sec-title serif">{copy.tPicks}</h2>
          <span className="sec-note">{copy.tPicksNote}</span>
        </div>
        <div className="picks">
          <article className="pick">
            <div className="k">{copy.pk1}</div>
            <h3 className="serif">{copy.ph1}</h3>
            <p>{copy.pp1}</p>
            <div className="route-tags">
              <span className="node">{copy.pn1}</span>
              <span className="node">{copy.pn2}</span>
            </div>
          </article>
          <article className="pick">
            <div className="k">{copy.pk2}</div>
            <h3 className="serif">{copy.ph2}</h3>
            <p>{copy.pp2}</p>
            <div className="route-tags">
              <span className="node">{copy.pn3}</span>
              <span className="node">{copy.pn4}</span>
            </div>
          </article>
        </div>

        <div className="sec-head spaced" id="feeds">
          <h2 className="sec-title serif">{copy.tFeeds}</h2>
          <span className="sec-note">{copy.tFeedsNote}</span>
        </div>
        <div className="feeds">
          <button className="feed" type="button" onClick={() => showToast(copy.feedToast)}>
            <img src={flyHomeMedia.heihuCover} alt="Black Tiger Spring dawn" />
            <span className="feed-open">{copy.comingSoon}</span>
            <span className="feed-body">
              <span className="feed-by">{copy.fb1}</span>
              <span className="feed-text serif">{copy.ft1}</span>
            </span>
          </button>
          <button className="feed" type="button" onClick={() => showToast(copy.feedToast)}>
            <img src={flyHomeMedia.damingCover} alt="Daming Lake Chaoran Tower" />
            <span className="feed-open">{copy.comingSoon}</span>
            <span className="feed-body">
              <span className="feed-by">{copy.fb1}</span>
              <span className="feed-text serif">{copy.ft2}</span>
            </span>
          </button>
        </div>

        <div className="sec-head spaced" id="challenge">
          <h2 className="sec-title serif">{copy.tChallenge}</h2>
          <span className="sec-note">{copy.tChallengeNote}</span>
        </div>
        <div className="challenge">
          <div className="k">{copy.ck1}</div>
          <h3 className="serif">{copy.ch1}</h3>
          <p>{copy.cp1}</p>
          <div className="bar" aria-hidden>
            <i />
          </div>
          <div className="dots">
            {flyJinanRoutes.map((route) => (
              <a key={route.id} className="dot on" href={route.href}>
                {copy[route.nameKey]}
              </a>
            ))}
          </div>
        </div>
      </main>

      <footer className="foot">
        <p className="slogan serif">{copy.slogan}</p>
        <div className="foot-links">
          <a href="#routes">{copy.navRoutes}</a>
          <a href="#picks">{copy.navPicks}</a>
          <a href="#feeds">{copy.navFeeds}</a>
          <a href="#challenge">{copy.navChallenge}</a>
        </div>
        <span className="ai-note">
          <Star />
          {copy.aiNote}
        </span>
        <p>{copy.footNote}</p>
      </footer>

      <div className={toast ? 'toast show' : 'toast'} role="status">
        {toast}
      </div>
    </div>
  );
}
