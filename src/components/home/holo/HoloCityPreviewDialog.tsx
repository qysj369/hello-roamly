import { useEffect, useId, useMemo, useRef, useState } from 'react';
import CityStayReferenceSlot from '@/components/business/CityStayReferenceSlot';
import HoloCityPreviewAmap from '@/components/home/holo/HoloCityPreviewAmap';
import { findHoloHomeCityKit, localizeHoloHomeCityLabel } from '@/data/holoHotCityKit';
import {
  getHoloCityPreviewPanel,
  type HoloPreviewSpotItem,
} from '@/data/holoCityPreviewPanel';
import { buildPlaceholderGallery } from '@/data/holoCityPreviewGalleryResolve';
import { useCityPreviewGalleryRail } from '@/hooks/useLoadableCityGallery';
import { useI18n } from '@/i18n/useI18n';
import { withCityIntroValueTail } from '@/lib/config/brandMindshare';
import { hasMapService, resolveMapProvider } from '@/lib/map/provider';

type HoloCityPreviewDialogProps = {
  city: string | null;
  onClose: () => void;
  /** 确认规划：交给首页追问条，再进 AI */
  onPlanCity: (city: string) => void;
};

function useIsNarrowViewport(maxWidth = 767) {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${maxWidth}px)`).matches : false,
  );

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const sync = () => setNarrow(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [maxWidth]);

  return narrow;
}

function DotLines({ lines }: { lines: string[] }) {
  return (
    <ul className="holo-home__preview-dot-list">
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

/** 图片加载失败 / 空 src → 国风 SVG 占位，避免破图或大块空白 */
function PreviewSafeImg({
  src,
  alt,
  city,
}: {
  src: string;
  alt: string;
  city: string;
}) {
  const fallback = useMemo(
    () => buildPlaceholderGallery(city)[0]?.src ?? '',
    [city],
  );
  const [current, setCurrent] = useState(src || fallback);

  useEffect(() => {
    setCurrent(src || fallback);
  }, [src, fallback]);

  return (
    <img
      src={current || fallback}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (!fallback || current === fallback || current.startsWith('data:')) return;
        setCurrent(fallback);
      }}
    />
  );
}

/**
 * 热门城市弹窗：左高德 + 右「氛围标题 / 文图双栏」；
 * Marker ↔ 地标卡片双向联动；不改首页 Three / 攻略逻辑。
 */
export default function HoloCityPreviewDialog({
  city,
  onClose,
  onPlanCity,
}: HoloCityPreviewDialogProps) {
  const { locale, messages: t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const spotItemRefs = useRef<(HTMLElement | null)[]>([]);
  const titleId = useId();
  const open = Boolean(city);
  const kit = useMemo(() => (city ? findHoloHomeCityKit(city) : null), [city]);
  const panel = useMemo(() => (city ? getHoloCityPreviewPanel(city) : null), [city]);
  const isNarrow = useIsNarrowViewport(767);
  const [activeSpotIndex, setActiveSpotIndex] = useState(0);
  const amapOk = hasMapService() && resolveMapProvider() === 'amap';
  const skipSpotScrollRef = useRef(true);

  const spots: HoloPreviewSpotItem[] =
    panel?.spots ??
    kit?.spots.map((spot) => ({
      name: spot.name,
      blurb: spot.blurb ?? '',
      tag: '慢行',
      lat: spot.lat,
      lng: spot.lng,
    })) ??
    [];

  const introText = withCityIntroValueTail(
    panel?.intro?.trim() || kit?.intro?.trim() || '',
  );
  const foods = panel?.foods ?? [];
  const transit = panel?.transit ?? kit?.transit ?? '';
  const tips = panel?.tips ?? kit?.tips ?? [];
  const { gallery, tier: galleryTier } = useCityPreviewGalleryRail(city);
  /** 弹窗主标题统一「城市·XX漫行」 */
  const headerTitle = city
    ? locale === 'en'
      ? `City · ${city} roam`
      : `城市·${city}漫行`
    : localizeHoloHomeCityLabel(city ?? '', locale);

  useEffect(() => {
    setActiveSpotIndex(0);
    spotItemRefs.current = [];
    skipSpotScrollRef.current = true;
  }, [city]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /** 地图点选 / 换景点 → 右侧滚动到对应地标卡片（跳过首次打开） */
  useEffect(() => {
    if (skipSpotScrollRef.current) {
      skipSpotScrollRef.current = false;
      return;
    }
    const el = spotItemRefs.current[activeSpotIndex];
    if (!el) return;
    const pane = el.closest('.holo-home__preview-copy') as HTMLElement | null;
    if (!pane) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    const elTop = el.offsetTop - pane.offsetTop;
    const elBottom = elTop + el.offsetHeight;
    const viewTop = pane.scrollTop;
    const viewBottom = viewTop + pane.clientHeight;
    if (elTop < viewTop + 12) {
      pane.scrollTo({ top: Math.max(0, elTop - 12), behavior: 'smooth' });
    } else if (elBottom > viewBottom - 12) {
      pane.scrollTo({ top: elBottom - pane.clientHeight + 12, behavior: 'smooth' });
    }
  }, [activeSpotIndex]);

  const mapPane = kit ? (
    <div className="holo-home__preview-map-wrap">
      {amapOk ? (
        <HoloCityPreviewAmap
          cityName={kit.name}
          cityLat={kit.lat}
          cityLng={kit.lng}
          spots={spots}
          activeIndex={activeSpotIndex}
          onSelectSpot={setActiveSpotIndex}
        />
      ) : (
        <p className="holo-home__preview-map-fallback">地图暂不可用，仍可浏览右侧慢行信息。</p>
      )}
    </div>
  ) : null;

  const textColumn = (
    <div className="holo-home__preview-info-text">
      {introText ? (
        <section className="holo-home__preview-group holo-home__preview-group--intro">
          <h4>{locale === 'en' ? 'About' : '城市简介'}</h4>
          <p className="holo-home__preview-intro">{introText}</p>
        </section>
      ) : null}

      <section className="holo-home__preview-group" id="holo-preview-spots">
        <h4>{locale === 'en' ? 'Key landmarks' : '核心地标'}</h4>
        <ul className="holo-home__preview-spot-cards">
          {spots.map((spot, index) => (
            <li
              key={spot.name}
              ref={(node) => {
                spotItemRefs.current[index] = node;
              }}
              className={
                index === activeSpotIndex
                  ? 'holo-home__preview-spot-card is-active'
                  : 'holo-home__preview-spot-card'
              }
              data-spot-index={index}
            >
              <button
                type="button"
                className="holo-home__preview-spot-card-btn"
                onClick={() => setActiveSpotIndex(index)}
              >
                <div className="holo-home__preview-spot-card-head">
                  <strong>{spot.name}</strong>
                  {spot.tag ? <span className="holo-home__preview-spot-tag">{spot.tag}</span> : null}
                </div>
                {spot.blurb ? <span className="holo-home__preview-spot-blurb">{spot.blurb}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="holo-home__preview-group">
        <h4>{locale === 'en' ? 'Local food & lanes' : '本地美食与街巷'}</h4>
        <ul className="holo-home__preview-food-list">
          {foods.map((food) => {
            const place = [food.shop, food.area].filter(Boolean).join('·');
            const line = place
              ? `${food.name}｜${place}`
              : food.note
                ? `${food.name}｜${food.note}`
                : food.name;
            return (
              <li key={`${food.name}-${food.shop ?? food.note ?? ''}`}>
                <span className="holo-home__preview-food-line">{line}</span>
              </li>
            );
          })}
        </ul>
        <CityStayReferenceSlot />
      </section>

      <section className="holo-home__preview-group">
        <h4>{locale === 'en' ? 'Getting around' : '出行贴士'}</h4>
        <DotLines lines={transit ? [transit] : []} />
      </section>

      <section className="holo-home__preview-group">
        <h4>{locale === 'en' ? 'Slow tips' : '慢行提醒'}</h4>
        <DotLines lines={[...tips]} />
      </section>
    </div>
  );

  const galleryColumn = (
      <div
        className="holo-home__preview-info-gallery"
        data-gallery-tier={galleryTier}
        aria-label={locale === 'en' ? 'Photos' : '图片种草'}
      >
        {gallery.map((item) => (
          <figure
            key={`${item.src}-${item.label}`}
            className={
              item.featured
                ? 'holo-home__preview-photo holo-home__preview-photo--hero'
                : 'holo-home__preview-photo'
            }
          >
            <PreviewSafeImg src={item.src} alt={item.label} city={city ?? ''} />
            <figcaption>{item.label}</figcaption>
          </figure>
        ))}
      </div>
    );

  const copyPane = kit ? (
    <div
      className={`holo-home__preview-copy holo-home__preview-copy--split${
        isNarrow ? ' is-narrow' : ''
      }`}
    >
      <div className="holo-home__preview-info-split">
        {textColumn}
        {galleryColumn}
      </div>
    </div>
  ) : null;

  return (
    <dialog
      ref={dialogRef}
      className="holo-home__preview-dialog holo-home__preview-dialog--city"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {city && kit ? (
        <div className="holo-home__preview-panel holo-home__preview-panel--city">
          <div className="holo-home__preview-head">
            <h3 id={titleId} className="holo-home__preview-title">
              {headerTitle}
            </h3>
            <button
              type="button"
              className="holo-home__preview-close"
              aria-label={t.search.close}
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div
            className={`holo-home__preview-body holo-home__preview-body--city-map${
              isNarrow ? ' is-narrow' : ''
            }`}
          >
            {mapPane}
            {copyPane}
          </div>

          <div className="holo-home__preview-foot holo-home__preview-foot--center">
            <button
              type="button"
              className="holo-home__preview-cta"
              onClick={() => {
                onClose();
                onPlanCity(city);
              }}
            >
              {t.city.goPlan}
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
