import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import HoloSnailLogo from '@/components/home/holo/HoloSnailLogo';
import { holoFeatureCities } from '@/data/holoFeatureCities';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { useUserMapOrigin } from '@/hooks/map/useUserMapOrigin';
import { useI18n } from '@/i18n/useI18n';
import { DRIVE_CITY_STORAGE_KEY } from '@/lib/drive/driveCityStorage';
import { resolveDriveVideoRoute } from '@/lib/drive/resolveDriveVideoRoute';
import { navigateHoloPlanSearch } from '@/lib/home/launchHoloPlanSearch';
import { paths } from '@/router/paths';
import '@/styles/holo-theme.css';
import '@/styles/holo-drive.css';

/**
 * 移动端街景预览（轻量）：不挂载 Mapillary / 百度双全景驾驶舱。
 * 有视频则播预览；否则引导生成穷游攻略，避免「点了不可用」。
 */
export default function MobileDrivePreview() {
  const { cityName = '济南' } = useParams<{ cityName: string }>();
  const decodedCity = decodeURIComponent(cityName);
  const navigate = useNavigate();
  const { locale, messages: t } = useI18n();
  const { origin: userOrigin } = useUserMapOrigin();
  const cityMeta = holoFeatureCities.find((city) => city.label === decodedCity);
  const videoRoute = useMemo(() => resolveDriveVideoRoute(decodedCity), [decodedCity]);
  const [videoError, setVideoError] = useState(false);
  const hasVideo = Boolean(videoRoute) && !videoError;

  usePageSeo({
    title: `${decodedCity} · ${t.drive.badge} | Hello Roamly`,
    description:
      locale === 'zh'
        ? `${decodedCity} 街景预览（移动端轻量版）`
        : `Street preview for ${decodedCity} (mobile light mode)`,
  });

  useEffect(() => {
    document.documentElement.classList.add('holo-home-active');
    try {
      sessionStorage.setItem(DRIVE_CITY_STORAGE_KEY, decodedCity);
    } catch {
      /* ignore */
    }
    return () => {
      document.documentElement.classList.remove('holo-home-active');
    };
  }, [decodedCity]);

  const goGeneratePlan = () => {
    navigateHoloPlanSearch(navigate, {
      query: `去${decodedCity}漫行`,
      destination: decodedCity,
      originLabel: userOrigin?.label,
    });
  };

  return (
    <div className="holo-drive holo-drive--mobile-preview">
      <header className="holo-drive__header">
        <Link to={paths.home} className="holo-drive__back">
          {t.drive.backNav}
        </Link>
        <div className="holo-drive__brand">
          <HoloSnailLogo size={28} strokeWidth={1.3} />
          <span>{t.brand.logo}</span>
        </div>
        <div className="holo-drive__header-meta">
          <span className="holo-drive__badge">{t.drive.badge}</span>
          <strong className="holo-drive__city-inline">{decodedCity}</strong>
        </div>
      </header>

      <main className="holo-drive__main">
        <div className="holo-drive__intro">
          <p className="holo-drive__badge">{t.drive.badge}</p>
          <h1 className="holo-drive__city">{decodedCity}</h1>
          {cityMeta ? <p className="holo-drive__tag">{cityMeta.tag}</p> : null}
        </div>

        {hasVideo ? (
          <div className="holo-drive__mobile-video">
            <video
              className="holo-drive__mobile-video-el"
              src={videoRoute!.src}
              controls
              playsInline
              preload="metadata"
              onError={() => setVideoError(true)}
            >
              <track kind="captions" />
            </video>
            <p className="holo-drive__mobile-hint">{t.drive.mobilePreviewHint}</p>
          </div>
        ) : (
          <div className="holo-drive__panel" aria-live="polite">
            <h2>{t.drive.mobileNoVideoTitle}</h2>
            <p>{t.drive.mobileNoVideoDesc}</p>
            <p className="holo-drive__provider">{t.drive.providerNote}</p>
          </div>
        )}

        <div className="holo-drive__actions">
          <button type="button" className="holo-drive__btn holo-drive__btn--primary" onClick={goGeneratePlan}>
            {t.drive.mobileGeneratePlan}
          </button>
          <Link to={paths.guides} className="holo-drive__btn holo-drive__btn--ghost">
            {t.drive.viewGuides}
          </Link>
          <Link to={paths.home} className="holo-drive__btn holo-drive__btn--ghost">
            {t.drive.backHome}
          </Link>
        </div>
      </main>
    </div>
  );
}
