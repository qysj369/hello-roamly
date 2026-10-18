import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BaiduStreetView from '@/components/drive/BaiduStreetView';
import DriveHud from '@/components/drive/DriveHud';
import DriveVideoContributeModal from '@/components/drive/DriveVideoContributeModal';
import MapillaryStreetDrive from '@/components/drive/MapillaryStreetDrive';
import VideoStreetDrive from '@/components/drive/VideoStreetDrive';
import HoloSnailLogo from '@/components/home/holo/HoloSnailLogo';
import { holoFeatureCities, holoStreetViewCities } from '@/data/holoFeatureCities';
import { resolveDriveVideoRoute } from '@/lib/drive/resolveDriveVideoRoute';
import type { DriveSpeedPreset } from '@/lib/drive/driveSpeed';
import { fetchCityWeatherLive } from '@/lib/drive/fetchCityWeather';
import { fetchCloudDriveVideos } from '@/services/drive/driveVideosApi';
import { isMapillaryConfigured } from '@/lib/map/mapillary';
import { getStreetViewProvider } from '@/i18n/index';
import { useI18n } from '@/i18n/useI18n';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { useDriveContributionsStore } from '@/stores/driveContributions/store';
import { DRIVE_CITY_STORAGE_KEY } from '@/lib/drive/driveCityStorage';
import { driveCityPath, paths } from '@/router/paths';
import '@/styles/holo-theme.css';
import '@/styles/holo-drive.css';

type DriveMediaMode = 'video' | 'mapillary' | 'baidu';

function pickDefaultMode(hasVideo: boolean, hasMapillary: boolean, hasBaidu: boolean): DriveMediaMode {
  if (hasVideo) {
    return 'video';
  }
  if (hasMapillary) {
    return 'mapillary';
  }
  if (hasBaidu) {
    return 'baidu';
  }
  return 'video';
}

/** PC 完整驾驶舱：用户投稿视频 > 官方视频 > Mapillary 序列 > 百度街景 */
export default function DesktopDriveCabin() {
  const { cityName = '济南' } = useParams<{ cityName: string }>();
  const decodedCity = decodeURIComponent(cityName);
  const { locale, messages: t } = useI18n();
  const provider = getStreetViewProvider();
  const cityMeta = holoFeatureCities.find((city) => city.label === decodedCity);
  const streetLng = cityMeta?.streetViewLng ?? cityMeta?.lng;
  const streetLat = cityMeta?.streetViewLat ?? cityMeta?.lat;

  const hydrate = useDriveContributionsStore((s) => s.hydrate);
  const hydrated = useDriveContributionsStore((s) => s.hydrated);
  const contributionItems = useDriveContributionsStore((s) => s.items);
  const latestContribution = useMemo(
    () => contributionItems.find((item) => item.cityLabel === decodedCity),
    [contributionItems, decodedCity],
  );
  const [cloudPlay, setCloudPlay] = useState<{ playUrl: string; title: string } | null>(null);
  const [cloudTick, setCloudTick] = useState(0);

  const videoRoute = useMemo(
    () =>
      resolveDriveVideoRoute(decodedCity, {
        cloudPlayUrl: cloudPlay?.playUrl,
        cloudTitle: cloudPlay?.title,
        contribution: latestContribution,
      }),
    [cloudPlay, decodedCity, latestContribution],
  );

  const canShowBaidu = Boolean(
    provider === 'baidu' &&
      cityMeta?.streetViewAvailable &&
      streetLng != null &&
      streetLat != null,
  );
  const canShowMapillary = Boolean(
    isMapillaryConfigured() && streetLng != null && streetLat != null,
  );
  const canShowVideo = Boolean(videoRoute);

  const [mediaMode, setMediaMode] = useState<DriveMediaMode>(() =>
    pickDefaultMode(canShowVideo, canShowMapillary, canShowBaidu),
  );
  const [streetReady, setStreetReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speedId, setSpeedId] = useState<DriveSpeedPreset['id']>('cruise');
  const [liveSpeedKmh, setLiveSpeedKmh] = useState(0);
  const [roadEnded, setRoadEnded] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [temperatureC, setTemperatureC] = useState<number | null>(null);
  const [weatherText, setWeatherText] = useState('');

  const showCabin =
    (mediaMode === 'video' && canShowVideo) ||
    (mediaMode === 'mapillary' && canShowMapillary) ||
    (mediaMode === 'baidu' && canShowBaidu);

  const hudLabels = useMemo(() => {
    const hint =
      mediaMode === 'video'
        ? t.drive.videoHint
        : mediaMode === 'mapillary'
          ? t.drive.mapillaryHint
          : t.drive.driveHint;
    return {
      speedUnit: t.drive.speedUnit,
      tempLabel: t.drive.tempLabel,
      tempLoading: t.drive.tempLoading,
      tempUnavailable: t.drive.tempUnavailable,
      play: t.drive.play,
      pause: t.drive.pause,
      speedSnail: t.drive.speedSnail,
      speedCruise: t.drive.speedCruise,
      speedSport: t.drive.speedSport,
      hint,
      roadEnd: t.drive.roadEnd,
    };
  }, [mediaMode, t]);

  usePageSeo({
    title: `${decodedCity} · ${t.drive.badge} | Hello Roamly`,
    description:
      locale === 'zh'
        ? `${decodedCity} 沉浸式街景驾驶舱`
        : `Immersive street-view cabin for ${decodedCity}`,
  });

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    let cancelled = false;
    setCloudPlay(null);
    void fetchCloudDriveVideos(decodedCity)
      .then((items) => {
        if (cancelled) {
          return;
        }
        const latest = items[0];
        if (latest?.playUrl) {
          setCloudPlay({ playUrl: latest.playUrl, title: latest.title });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCloudPlay(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [cloudTick, decodedCity]);

  useEffect(() => {
    document.documentElement.classList.add('holo-home-active');
    sessionStorage.setItem(DRIVE_CITY_STORAGE_KEY, decodedCity);
    return () => {
      document.documentElement.classList.remove('holo-home-active');
    };
  }, [decodedCity]);

  useEffect(() => {
    setStreetReady(false);
    setPlaying(false);
    setRoadEnded(false);
    setSpeedId('cruise');
    setLiveSpeedKmh(0);
    setMediaMode(pickDefaultMode(canShowVideo, canShowMapillary, canShowBaidu));
  }, [canShowBaidu, canShowMapillary, canShowVideo, decodedCity]);

  useEffect(() => {
    if (!streetReady) {
      setPlaying(false);
    }
  }, [streetReady]);

  useEffect(() => {
    let cancelled = false;
    setWeatherLoading(true);
    setTemperatureC(null);
    setWeatherText('');

    const coords =
      streetLat != null && streetLng != null
        ? { lat: streetLat, lng: streetLng }
        : cityMeta
          ? { lat: cityMeta.lat, lng: cityMeta.lng }
          : undefined;

    fetchCityWeatherLive(decodedCity, coords)
      .then((live) => {
        if (cancelled) {
          return;
        }
        setTemperatureC(live.temperatureC);
        setWeatherText(live.weatherText);
      })
      .finally(() => {
        if (!cancelled) {
          setWeatherLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cityMeta, decodedCity, streetLat, streetLng]);

  const handleReadyChange = useCallback((ready: boolean) => {
    setStreetReady(ready);
  }, []);

  const handleRoadEnd = useCallback(() => {
    setRoadEnded(true);
    setPlaying(false);
  }, []);

  const handleTogglePlay = useCallback(() => {
    setRoadEnded(false);
    setPlaying((value) => !value);
  }, []);

  const switchMode = (mode: DriveMediaMode) => {
    if (mode === 'video' && !canShowVideo) {
      return;
    }
    if (mode === 'mapillary' && !canShowMapillary) {
      return;
    }
    if (mode === 'baidu' && !canShowBaidu) {
      return;
    }
    setStreetReady(false);
    setPlaying(false);
    setLiveSpeedKmh(0);
    setRoadEnded(false);
    setMediaMode(mode);
  };

  const contributeLabels = useMemo(
    () => ({
      title: t.drive.contributeTitle,
      desc: t.drive.contributeDesc,
      titlePlaceholder: t.drive.contributeTitlePlaceholder,
      dropIdle: t.drive.contributeDropIdle,
      dropActive: t.drive.contributeDropActive,
      submit: t.drive.contributeSubmit,
      cancel: t.drive.contributeCancel,
      success: t.drive.contributeSuccess,
      limitHint: t.drive.contributeLimitHint,
    }),
    [t],
  );

  return (
    <div
      className={`holo-drive ${showCabin ? 'holo-drive--cabin' : ''} ${
        !streetReady && showCabin ? 'holo-drive--loading' : ''
      }`}
    >
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
        {showCabin ? (
          <div className="holo-drive__cabin">
            {mediaMode === 'video' && videoRoute ? (
              <VideoStreetDrive
                route={videoRoute}
                playing={playing && !roadEnded}
                speedId={speedId}
                loadingLabel={t.drive.streetLoading}
                errorLabel={t.drive.videoError}
                demoLabel={t.drive.videoDemoBadge}
                onReadyChange={handleReadyChange}
                onLiveSpeed={setLiveSpeedKmh}
                onFatalError={() => {
                  if (canShowMapillary) {
                    switchMode('mapillary');
                  } else if (canShowBaidu) {
                    switchMode('baidu');
                  }
                }}
              />
            ) : null}

            {mediaMode === 'mapillary' && streetLng != null && streetLat != null ? (
              <MapillaryStreetDrive
                lng={streetLng}
                lat={streetLat}
                cityLabel={decodedCity}
                playing={playing && !roadEnded}
                speedId={speedId}
                loadingLabel={t.drive.streetLoading}
                unavailableTitle={t.drive.mapillaryUnavailableTitle}
                unavailableDesc={t.drive.mapillaryUnavailableDesc}
                errorLabel={t.drive.mapillaryError}
                configErrorLabel={t.drive.mapillaryConfigError}
                onReadyChange={handleReadyChange}
                onLiveSpeed={setLiveSpeedKmh}
                onFatalError={() => {
                  if (canShowBaidu) {
                    switchMode('baidu');
                  } else if (canShowVideo) {
                    switchMode('video');
                  }
                }}
              />
            ) : null}

            {mediaMode === 'baidu' && streetLng != null && streetLat != null ? (
              <BaiduStreetView
                lng={streetLng}
                lat={streetLat}
                cityLabel={decodedCity}
                loadingLabel={t.drive.streetLoading}
                unavailableTitle={t.drive.streetUnavailableTitle}
                unavailableDesc={t.drive.streetUnavailableDesc}
                errorLabel={t.drive.streetError}
                configErrorLabel={t.drive.streetConfigError}
                driving
                playing={playing && !roadEnded}
                speedId={speedId}
                onReadyChange={handleReadyChange}
                onRoadEnd={handleRoadEnd}
                onLiveSpeed={setLiveSpeedKmh}
              />
            ) : null}

            <DriveHud
              speedId={speedId}
              liveSpeedKmh={liveSpeedKmh}
              playing={playing && !roadEnded}
              ready={streetReady}
              roadEnded={roadEnded}
              temperatureC={temperatureC}
              weatherText={weatherText}
              weatherLoading={weatherLoading}
              labels={hudLabels}
              onTogglePlay={handleTogglePlay}
              onSpeedChange={(id) => {
                setSpeedId(id);
                setRoadEnded(false);
                setPlaying(true);
              }}
            />
          </div>
        ) : (
          <>
            <div className="holo-drive__intro">
              <p className="holo-drive__badge">{t.drive.badge}</p>
              <h1 className="holo-drive__city">{decodedCity}</h1>
              {cityMeta ? <p className="holo-drive__tag">{cityMeta.tag}</p> : null}
            </div>
            <div className="holo-drive__panel" aria-live="polite">
              <h2>{t.drive.streetUnavailableTitle}</h2>
              <p>
                {hydrated
                  ? t.drive.streetUnavailableDesc
                  : provider === 'baidu'
                    ? t.drive.streetUnavailableDesc
                    : t.drive.loadingDesc}
              </p>
              <p className="holo-drive__provider">{t.drive.providerNote}</p>
              <button
                type="button"
                className="holo-drive__btn holo-drive__btn--primary"
                style={{ marginTop: 12, width: '100%' }}
                onClick={() => setContributeOpen(true)}
              >
                {t.drive.contributeBtn}
              </button>
            </div>
          </>
        )}

        <div className="holo-drive__mode-switch" role="group" aria-label={t.drive.modeSwitchLabel}>
          {canShowVideo ? (
            <button
              type="button"
              className={`holo-drive__mode-chip ${mediaMode === 'video' ? 'is-active' : ''}`}
              onClick={() => switchMode('video')}
            >
              {t.drive.modeVideo}
            </button>
          ) : null}
          {canShowMapillary ? (
            <button
              type="button"
              className={`holo-drive__mode-chip ${mediaMode === 'mapillary' ? 'is-active' : ''}`}
              onClick={() => switchMode('mapillary')}
            >
              {t.drive.modeMapillary}
            </button>
          ) : null}
          {canShowBaidu ? (
            <button
              type="button"
              className={`holo-drive__mode-chip ${mediaMode === 'baidu' ? 'is-active' : ''}`}
              onClick={() => switchMode('baidu')}
            >
              {t.drive.modeBaidu}
            </button>
          ) : null}
          <button
            type="button"
            className="holo-drive__mode-chip holo-drive__mode-chip--accent"
            onClick={() => setContributeOpen(true)}
          >
            {t.drive.contributeBtn}
          </button>
        </div>

        {provider === 'baidu' && holoStreetViewCities.length > 0 ? (
          <div className="holo-drive__alt-cities">
            {holoStreetViewCities
              .filter((city) => city.label !== decodedCity)
              .map((city) => (
                <Link
                  key={city.id}
                  to={driveCityPath(city.label)}
                  className="holo-drive__alt-chip"
                >
                  {city.label} · {t.drive.tryStreetCity}
                </Link>
              ))}
          </div>
        ) : null}

        <div className="holo-drive__actions">
          <Link to={paths.home} className="holo-drive__btn holo-drive__btn--primary">
            {t.drive.backHome}
          </Link>
          <Link to={paths.guides} className="holo-drive__btn holo-drive__btn--ghost">
            {t.drive.viewGuides}
          </Link>
        </div>
      </main>

      <DriveVideoContributeModal
        cityLabel={decodedCity}
        open={contributeOpen}
        onClose={() => setContributeOpen(false)}
        onSubmitted={(result) => {
          setMediaMode('video');
          setStreetReady(false);
          setPlaying(false);
          if (result?.source === 'cloud' && result.playUrl && result.autoApproved !== false) {
            setCloudPlay({ playUrl: result.playUrl, title: result.title || decodedCity });
          }
          setCloudTick((value) => value + 1);
        }}
        labels={contributeLabels}
      />
    </div>
  );
}
