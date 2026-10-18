import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import SnailBrandLogo from '@/components/brand/SnailBrandLogo';
import ToolboxValueAddSlot from '@/components/business/ToolboxValueAddSlot';
import HeroAtmosphereDecor from '@/components/home/holo/HeroAtmosphereDecor';
import HeroSnailGraphic from '@/components/home/holo/HeroSnailGraphic';
import heroSeascape from '@/assets/holo-hero-seascape-v3.png';
import HoloCityPreviewDialog from '@/components/home/holo/HoloCityPreviewDialog';
import HoloCommunitySection from '@/components/home/holo/HoloCommunitySection';
import HoloDreamCityScroll from '@/components/home/holo/HoloDreamCityScroll';
import HoloDreamTripGrid from '@/components/home/holo/HoloDreamTripGrid';
import HoloHomeFooter from '@/components/home/holo/HoloHomeFooter';
import HoloHomeSideRail from '@/components/home/holo/HoloHomeSideRail';
import HoloInspireSceneDialog from '@/components/home/holo/HoloInspireSceneDialog';
import HoloPlanClarifySheet, {
  type HoloPlanClarifyDraft,
} from '@/components/home/holo/HoloPlanClarifySheet';
import HoloRoamGuide, { hasSeenRoamGuide } from '@/components/home/holo/HoloRoamGuide';
import HoloSearchAskSheet from '@/components/home/holo/HoloSearchAskSheet';
import HoloSearchDialog from '@/components/home/holo/HoloSearchDialog';
import HoloSearchPlanReadySheet from '@/components/home/holo/HoloSearchPlanReadySheet';
import {
  toShareAutoExport,
  type SearchPlanAutoExportKind,
} from '@/components/home/holo/HoloSearchPlanShareSheet';
import type { TravelVoiceExportKind } from '@/lib/home/travelVoiceIntent';
import HoloShareLandingHint from '@/components/home/holo/HoloShareLandingHint';
import HoloVoiceEntry from '@/components/home/holo/HoloVoiceEntry';
import HoloToolIcon from '@/components/home/holo/HoloToolIcon';
import { BRAND_MINDSHARE_LINE } from '@/lib/config/brandMindshare';
import {
  fillHomePlanPreference,
  isHomePlanSearchReady,
  resolveHomePlanSearchFields,
} from '@/lib/home/resolveHomePlanSearchFields';
import { extractSearchParams, type SearchExtractParams } from '@/lib/home/extractSearchParams';
import { requestSearchStructuredPlan } from '@/lib/home/requestSearchStructuredPlan';
import { getMissRequiredField } from '@/lib/home/searchAskRequired';
import {
  SEARCH_PLAN_FAIL_HINT,
  SEARCH_PLAN_LOADING_TEXT,
  toSearchPlanRequest,
} from '@/lib/home/searchStructuredPlanParse';
import {
  hasOpenedShareLanding,
  markShareLandingOpened,
} from '@/lib/home/homeShareLanding';
import { planFromShareLandingSearch } from '@/lib/home/shareLandingPlan';
import { HOME_SEARCH_FAIL_HINT, validateHomeSearchInput } from '@/lib/home/submitHomeSearchStep1';
import {
  holoHomeSideRailsConfig,
  loadHoloHomeSideRailsConfig,
  resolveActiveSideRail,
  type HoloHomeSideRailsConfig,
} from '@/data/holoHomeSideRails';
import { holoTravelToolDefs } from '@/data/holoTravelTools';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { useHomeShareLanding } from '@/hooks/share/useHomeShareLanding';
import { useHoloHeroSoftMotion } from '@/hooks/home/useHoloHeroSoftMotion';
import { useI18n } from '@/i18n/useI18n';
import { useUserMapOrigin } from '@/hooks/map/useUserMapOrigin';
import { HOLO_SLOW_TOOLBOX_ID } from '@/lib/home/scrollToHoloToolbox';
import { useJsonLd } from '@/hooks/browser/useJsonLd';
import { homePageSeo } from '@/lib/seo';
import { buildTravelKnowledgeJsonLd } from '@/lib/seo/jsonLd/travelKnowledgeJsonLd';
import { paths } from '@/router/paths';
import { showGlobalApiError } from '@/stores/apiErrorStore';
import { shouldRouteToTravelAgent } from '@/lib/agent/parseTravelAgentIntent';
import { useTravelAgentStore } from '@/stores/travelAgent/store';
import { useUiStore } from '@/stores';
import { sanitizeClarifyCityLabel, usePlanClarifyStore } from '@/stores/planClarify/store';
import '@/styles/holo-theme.css';
import '@/styles/holo-home.css';
import '@/styles/snail-brand-logo.css';

function useMediaMinWidth(minWidth: number) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(min-width: ${minWidth}px)`).matches : false,
  );

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${minWidth}px)`);
    const sync = () => setMatches(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [minWidth]);

  return matches;
}

function useIsDesktopLayout() {
  return useMediaMinWidth(1024);
}

function SearchLoadingSpinner() {
  return <span className="holo-home__hero-search-spinner" aria-hidden />;
}

function TabIcon({ name }: { name: 'home' | 'advisor' | 'me' }) {
  if (name === 'home') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z" fill="currentColor" />
      </svg>
    );
  }
  if (name === 'advisor') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden>
        <path
          d="M12 3.6 13.4 8h4.7L14.8 10.8 16.2 15 12 12.4 7.8 15l1.4-4.2L5.9 8h4.7L12 3.6Z"
          fill="currentColor"
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

/**
 * 首页定稿结构：
 * 导航 → Hero（标题装饰插画 + 居中搜索）→ 热门城市 → 漫游灵感 → 慢行工具箱 → 蜗友在路上 → 页脚
 * 关于蜗牛 / 迭代规划见 /about
 */
export default function HoloHomePage() {
  const { messages: t, locale, setPreferredLocale } = useI18n();
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);
  const { origin: userOrigin } = useUserMapOrigin();
  const isDesktop = useIsDesktopLayout();
  const heroSoftMotion = useHoloHeroSoftMotion();
  const shareLanding = useHomeShareLanding();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [roamGuideOpen, setRoamGuideOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navQuery, setNavQuery] = useState('');
  const [previewCity, setPreviewCity] = useState<string | null>(null);
  const [inspireScene, setInspireScene] = useState<string | null>(null);
  const [clarifyDraft, setClarifyDraft] = useState<HoloPlanClarifyDraft | null>(null);
  const [askParams, setAskParams] = useState<SearchExtractParams | null>(null);
  const [planSheetOpen, setPlanSheetOpen] = useState(false);
  const [pendingExport, setPendingExport] = useState<SearchPlanAutoExportKind | null>(null);
  const adoptAgentPlan = useTravelAgentStore((state) => state.adoptPlan);
  const agentPlan = useTravelAgentStore((state) => state.plan);
  const agentRevision = useTravelAgentStore((state) => state.revision);
  const sendAgent = useTravelAgentStore((state) => state.send);
  const [searchLaunching, setSearchLaunching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [sideRailsConfig, setSideRailsConfig] =
    useState<HoloHomeSideRailsConfig>(holoHomeSideRailsConfig);
  const sideRailViewportReady = useMediaMinWidth(sideRailsConfig.minViewportWidth);
  const leftRail = resolveActiveSideRail(sideRailsConfig.left);
  const rightRail = resolveActiveSideRail(sideRailsConfig.right);

  /** 防连点：短时间重复提交只跳转一次 */
  const lastHomeSearchAtRef = useRef(0);
  const userOriginLabelRef = useRef(userOrigin?.label);
  userOriginLabelRef.current = userOrigin?.label;

  const launchFromExtract = useCallback(async (params: SearchExtractParams) => {
    const payload = toSearchPlanRequest(params);
    setAskParams(null);
    if (!payload) {
      showGlobalApiError(SEARCH_PLAN_FAIL_HINT);
      return;
    }
    setPlanSheetOpen(false);
    setSearchLaunching(true);
    setSearchStatus(SEARCH_PLAN_LOADING_TEXT);
    try {
      const result = await requestSearchStructuredPlan(payload, { onStatus: setSearchStatus });
      if (result.ok) {
        console.info('[home-search] structured-plan', result.plan);
        adoptAgentPlan(result.plan);
        setPlanSheetOpen(true);
      } else {
        showGlobalApiError(result.error || HOME_SEARCH_FAIL_HINT);
      }
    } catch {
      showGlobalApiError(HOME_SEARCH_FAIL_HINT);
    } finally {
      setSearchLaunching(false);
      setSearchStatus(null);
    }
  }, [adoptAgentPlan]);

  const launchReadyPlan = useCallback(
    async (fields: ReturnType<typeof resolveHomePlanSearchFields>, keepQuery: string) => {
      const ready = fillHomePlanPreference(fields);
      usePlanClarifyStore.getState().patch(ready);
      setNavQuery(keepQuery);
      setSearchQuery(keepQuery);
      await launchFromExtract({
        startCity: userOriginLabelRef.current || undefined,
        targetCity: ready.city?.trim() || undefined,
        days: ready.days ?? undefined,
        peopleType: ready.party?.trim() || undefined,
        budget: ready.budgetYuan ?? undefined,
        theme: ready.preference?.trim() || undefined,
      });
    },
    [launchFromExtract, setSearchQuery],
  );

  const openClarifyOrPlan = useCallback((raw: string, destination?: string) => {
    const trimmed = raw.trim();
    if (!trimmed && !destination) {
      showGlobalApiError(
        locale === 'en' ? 'Please enter a destination first' : '请先输入目的地，再生成漫行攻略',
      );
      setSearchOpen(true);
      return;
    }
    const keepQuery = trimmed || (destination ? `去${destination}玩` : '');
    setNavQuery(keepQuery);
    const fields = resolveHomePlanSearchFields(keepQuery, destination);
    usePlanClarifyStore.getState().patch(fields);
    if (isHomePlanSearchReady(fields)) {
      void launchReadyPlan(fields, keepQuery);
      return;
    }
    setClarifyDraft({
      baseQuery: keepQuery,
      destination: fields.city || destination || undefined,
    });
  }, [launchReadyPlan, locale]);

  const onClarifyConfirm = useCallback(
    (
      composedQuery: string,
      meta: { city: string; days: number; party: string; pace: string; budgetYuan: number; preference: string },
    ) => {
      const now = Date.now();
      if (now - lastHomeSearchAtRef.current < 1500) {
        setClarifyDraft(null);
        return;
      }
      lastHomeSearchAtRef.current = now;
      setClarifyDraft(null);
      const keepQuery = navQuery.trim() || composedQuery;
      void launchReadyPlan(
        {
          city: sanitizeClarifyCityLabel(meta.city) || meta.city,
          days: meta.days,
          party: meta.party,
          pace: meta.pace,
          budgetYuan: meta.budgetYuan,
          preference: meta.preference,
        },
        keepQuery,
      );
    },
    [launchReadyPlan, navQuery],
  );

  /** 顶部搜索：本地解析 → 缺必填则逐个追问 → 齐了再进生成 */
  const runHomeSearch = useCallback(async (raw: string) => {
    const checked = validateHomeSearchInput(raw);
    if (!checked.ok) {
      showGlobalApiError(checked.hint);
      return;
    }
    setNavQuery(checked.query);
    setSearchQuery(checked.query);
    const params = extractSearchParams(checked.query);
    console.info('[home-search] submit', checked.query);
    console.info('[home-search] extract', params);
    if (getMissRequiredField(params).length > 0) {
      setAskParams(null);
      openClarifyOrPlan(checked.query, params.targetCity);
      return;
    }
    await launchFromExtract(params);
  }, [launchFromExtract, openClarifyOrPlan, setSearchQuery]);

  const onVoiceTranscript = useCallback((text: string) => {
    setNavQuery(text);
  }, []);

  const onVoiceRecognized = useCallback(
    (text: string) => {
      setNavQuery(text);
      if (shouldRouteToTravelAgent(text, Boolean(agentPlan))) {
        void sendAgent(text);
        return;
      }
      void runHomeSearch(text);
    },
    [agentPlan, runHomeSearch, sendAgent],
  );

  const onVoiceExport = agentPlan
    ? (kind: TravelVoiceExportKind) => {
        setPendingExport(toShareAutoExport(kind));
        setPlanSheetOpen(true);
      }
    : undefined;

  const onAskAnswer = useCallback(
    (next: SearchExtractParams) => {
      if (getMissRequiredField(next).length > 0) {
        setAskParams(next);
        return;
      }
      void launchFromExtract(next);
    },
    [launchFromExtract],
  );

  const openShareLandingTrip = useCallback(() => {
    const query = shareLanding.suggestedQuery.trim() || shareLanding.city?.trim() || '';
    if (!query) {
      searchInputRef.current?.focus();
      return;
    }
    setNavQuery(query);
    shareLanding.dismiss();
    void runHomeSearch(query);
  }, [runHomeSearch, shareLanding.city, shareLanding.dismiss, shareLanding.suggestedQuery]);

  usePageSeo(homePageSeo());
  const travelKnowledgeLd = useMemo(() => buildTravelKnowledgeJsonLd(), []);
  useJsonLd('travel-knowledge', travelKnowledgeLd);

  useEffect(() => {
    document.documentElement.classList.add('holo-home-active');
    return () => {
      document.documentElement.classList.remove('holo-home-active');
    };
  }, []);

  useEffect(() => {
    if (shareLanding.city) return;
    if (!hasSeenRoamGuide()) {
      setRoamGuideOpen(true);
    }
  }, [shareLanding.city]);

  useEffect(() => {
    if (hasOpenedShareLanding(shareLanding.search)) return;
    const packed = planFromShareLandingSearch(shareLanding.search);
    if (packed) {
      markShareLandingOpened(shareLanding.search);
      adoptAgentPlan(packed);
      setPlanSheetOpen(true);
      shareLanding.dismiss();
      return;
    }
    if (!shareLanding.city) return;
    markShareLandingOpened(shareLanding.search);
    openShareLandingTrip();
  }, [
    adoptAgentPlan,
    openShareLandingTrip,
    shareLanding.city,
    shareLanding.dismiss,
    shareLanding.search,
  ]);

  useEffect(() => {
    let cancelled = false;
    void loadHoloHomeSideRailsConfig().then((config) => {
      if (!cancelled) setSideRailsConfig(config);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (agentRevision > 0 && agentPlan) setPlanSheetOpen(true);
  }, [agentRevision, agentPlan]);

  const onNavSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    runHomeSearch(navQuery);
  };

  const quickLabel = (key: (typeof holoTravelToolDefs)[number]['labelKey']) => t.quick[key];

  return (
    <div className={`holo-home${heroSoftMotion ? '' : ' is-hero-static'}`}>
      <header className="holo-home__header">
        <div className="holo-home__header-inner">
          <div className="holo-home__brand-wrap">
            <SnailBrandLogo variant="full" size={isDesktop ? 36 : 28} className="holo-home__brand-logo" />
          </div>
          {isDesktop ? (
            <nav className="holo-home__pc-nav" aria-label={t.heroExtra.bottomNav}>
              <Link to={paths.home} className="holo-home__pc-nav-link is-active" aria-current="page">
                {t.tabs.home}
              </Link>
              <Link to={paths.ai} className="holo-home__pc-nav-link">
                {t.tabs.advisor}
              </Link>
              <Link to={paths.profile} className="holo-home__pc-nav-link">
                {t.tabs.me}
              </Link>
            </nav>
          ) : null}
          <div className="holo-home__header-right">
            <HoloVoiceEntry
              placement="nav"
              disabled={searchLaunching}
              onTranscriptChange={onVoiceTranscript}
              onRecognizedText={onVoiceRecognized}
              onExportIntent={onVoiceExport}
            />
            <div className="holo-home__lang holo-home__lang--nav" role="group" aria-label="Language">
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
          </div>
        </div>
      </header>

      <div className="holo-home__body">
        <HoloHomeSideRail side="left" item={leftRail} viewportReady={sideRailViewportReady} />

        <main className="holo-home__main">
          <section
            className={`holo-home__hero ${isDesktop ? 'holo-home__hero--pc' : 'holo-home__hero--mobile'}`}
            aria-label={t.heroExtra.mainVisual}
          >
            <HeroAtmosphereDecor />
            <div className="holo-home__hero-stage">
              <div className="holo-home__hero-heading">
                <div className="holo-home__hero-heading-text">
                  <h1 className="holo-home__hero-title">{t.hero.title}</h1>
                  <p className="holo-home__hero-desc">{t.hero.desc}</p>
                  <p className="holo-home__hero-mindshare">{BRAND_MINDSHARE_LINE}</p>
                </div>
                <div className="holo-home__hero-graphic" aria-hidden>
                  <div className="holo-home__hero-scape-clip">
                    <img
                      className="holo-home__hero-scape"
                      src={heroSeascape}
                      alt=""
                      draggable={false}
                    />
                  </div>
                  <div className="holo-home__graphic-stage">
                    <div className="holo-home__hero-snail">
                      <HeroSnailGraphic softMotion={heroSoftMotion} />
                    </div>
                  </div>
                </div>
              </div>

              {shareLanding.visible ? (
                <HoloShareLandingHint
                  text={
                    shareLanding.city
                      ? t.heroExtra.shareLandingCity.replace('{city}', shareLanding.city)
                      : t.heroExtra.shareLanding
                  }
                  ctaLabel={t.heroExtra.shareLandingCta}
                  closeLabel={t.heroExtra.shareLandingClose}
                  onCta={openShareLandingTrip}
                  onClose={shareLanding.dismiss}
                />
              ) : null}
              <form
                className="holo-home__hero-search"
                onSubmit={onNavSearchSubmit}
                role="search"
                aria-busy={searchLaunching}
              >
                <div className="holo-home__hero-search-bar">
                  <input
                    ref={searchInputRef}
                    type="search"
                    className="holo-home__hero-search-input"
                    placeholder={t.search.placeholder}
                    value={navQuery}
                    onChange={(e) => setNavQuery(e.target.value)}
                    aria-label={t.search.title}
                    enterKeyHint="search"
                    disabled={searchLaunching}
                  />
                  <div className="holo-home__hero-search-actions">
                    <HoloVoiceEntry
                      placement="search"
                      disabled={searchLaunching}
                      onTranscriptChange={onVoiceTranscript}
                      onRecognizedText={onVoiceRecognized}
                      onExportIntent={onVoiceExport}
                    />
                    <button
                      type="submit"
                      className="holo-home__hero-search-submit"
                      aria-label={searchLaunching ? searchStatus || SEARCH_PLAN_LOADING_TEXT : t.search.submit}
                      disabled={searchLaunching}
                    >
                      {searchLaunching ? <SearchLoadingSpinner /> : null}
                      {t.search.submit}
                    </button>
                  </div>
                </div>
                {searchLaunching && searchStatus ? (
                  <p className="holo-home__hero-search-status" role="status">
                    {searchStatus}
                  </p>
                ) : null}
              </form>
            </div>
          </section>

          <section className="holo-home__destinations" aria-label={t.city.sectionTitle}>
            <h2 className="holo-home__section-title holo-home__section-title--block">
              {t.city.sectionTitle}
            </h2>
            <HoloDreamCityScroll
              ariaLabel={t.city.sectionTitle}
              onSelectCity={setPreviewCity}
            />
          </section>

          <section className="holo-home__inspire" aria-label={t.inspire.sectionTitle}>
            <h2 className="holo-home__section-title holo-home__section-title--block">
              {t.inspire.sectionTitle}
            </h2>
            <HoloDreamTripGrid ariaLabel={t.inspire.sectionTitle} onSelectScene={setInspireScene} />
          </section>

          <section
            id={HOLO_SLOW_TOOLBOX_ID}
            className="holo-home__tools"
            aria-label={t.quick.sectionTitle}
          >
            <h2 className="holo-home__section-title holo-home__section-title--block">
              {t.quick.sectionTitle}
            </h2>
            <div className="holo-home__tools-layout">
              <div
                className="holo-home__tool-grid holo-home__tool-grid--core"
                role="list"
              >
                {holoTravelToolDefs.map((item) => (
                  <Link
                    key={item.key}
                    role="listitem"
                    to={item.to ?? paths.home}
                    className="holo-home__tool"
                  >
                    <span className="holo-home__tool-icon" aria-hidden>
                      <HoloToolIcon name={item.icon} />
                    </span>
                    <span className="holo-home__tool-label">{quickLabel(item.labelKey)}</span>
                  </Link>
                ))}
              </div>
              <ToolboxValueAddSlot />
            </div>
          </section>

          {isDesktop ? <HoloCommunitySection /> : null}

          <HoloHomeFooter isDesktop={isDesktop} />
        </main>

        <HoloHomeSideRail side="right" item={rightRail} viewportReady={sideRailViewportReady} />
      </div>

      {!isDesktop ? (
        <nav className="holo-home__tabbar" aria-label={t.heroExtra.bottomNav}>
          <Link to={paths.home} className="holo-home__tab is-active" aria-current="page">
            <TabIcon name="home" />
            <span>{t.tabs.home}</span>
          </Link>
          <Link to={paths.ai} className="holo-home__tab">
            <TabIcon name="advisor" />
            <span>{t.tabs.advisor}</span>
          </Link>
          <Link to={paths.profile} className="holo-home__tab">
            <TabIcon name="me" />
            <span>{t.tabs.me}</span>
          </Link>
        </nav>
      ) : null}

      <HoloSearchDialog
        open={searchOpen}
        initialQuery={navQuery}
        onClose={() => setSearchOpen(false)}
        onRequestPlan={(query) => openClarifyOrPlan(query)}
      />
      <HoloRoamGuide open={roamGuideOpen} onClose={() => setRoamGuideOpen(false)} />
      <HoloCityPreviewDialog
        city={previewCity}
        onClose={() => setPreviewCity(null)}
        onPlanCity={(city) => openClarifyOrPlan(`去${city}玩`, city)}
      />
      <HoloSearchAskSheet
        params={askParams}
        onAnswer={onAskAnswer}
        onClose={() => setAskParams(null)}
      />
      <HoloSearchPlanReadySheet
        plan={planSheetOpen ? agentPlan : null}
        pendingExport={pendingExport}
        onPendingExportConsumed={() => setPendingExport(null)}
        onPlanChange={adoptAgentPlan}
        onClose={() => {
          setPlanSheetOpen(false);
          setPendingExport(null);
        }}
      />
      <HoloPlanClarifySheet
        draft={clarifyDraft}
        onClose={() => setClarifyDraft(null)}
        onConfirm={onClarifyConfirm}
      />
      <HoloInspireSceneDialog
        sceneKey={inspireScene}
        onClose={() => setInspireScene(null)}
        onPlanScene={(query, destination) => {
          setInspireScene(null);
          openClarifyOrPlan(query, destination);
        }}
      />
    </div>
  );
}
