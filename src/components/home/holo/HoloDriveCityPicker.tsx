import { useEffect, useId, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  holoFeatureCities,
  holoImmerseCityIds,
  type HoloFeatureCity,
} from '@/data/holoFeatureCities';
import { localizeHotCityLabel } from '@/data/holoDreamDestinations';
import { useUserMapOrigin } from '@/hooks/map/useUserMapOrigin';
import { useI18n } from '@/i18n/useI18n';
import { isMobileDriveClient } from '@/lib/drive/isMobileDriveClient';
import { DRIVE_CITY_STORAGE_KEY } from '@/lib/drive/driveCityStorage';
import { resolveDriveVideoRoute } from '@/lib/drive/resolveDriveVideoRoute';
import { navigateHoloPlanSearch } from '@/lib/home/launchHoloPlanSearch';
import { driveCityPath } from '@/router/paths';

type HoloDriveCityPickerProps = {
  open: boolean;
  onClose: () => void;
  /** all=全部城市；immerse=沉浸式漫游热门城 */
  variant?: 'all' | 'immerse';
};

function readLastDriveCity(): string | null {
  try {
    return sessionStorage.getItem(DRIVE_CITY_STORAGE_KEY);
  } catch {
    return null;
  }
}

const FEATURE_CITY_TAG_EN: Record<string, string> = {
  jinan: 'Spring city · budget',
  dali: 'Lakeside niche',
  chengdu: 'Food · slow days',
  lhasa: 'Highland calm',
  xian: 'Ancient capital walk',
  hangzhou: 'West Lake pace',
  xiamen: 'Island light trip',
  qingdao: 'Seaside stay',
  yangshuo: 'Karst roam',
};

/** 首页选城进入街景驾驶舱（主视觉 / 沉浸式漫游双通路共用） */
export default function HoloDriveCityPicker({
  open,
  onClose,
  variant = 'all',
}: HoloDriveCityPickerProps) {
  const navigate = useNavigate();
  const { locale, messages: t } = useI18n();
  const { origin: userOrigin } = useUserMapOrigin();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastCity = readLastDriveCity();

  const cities = useMemo(() => {
    const source =
      variant === 'immerse'
        ? holoImmerseCityIds
            .map((id) => holoFeatureCities.find((city) => city.id === id))
            .filter((city): city is HoloFeatureCity => Boolean(city))
        : [...holoFeatureCities];

    return source.sort((a, b) => {
      if (a.label === lastCity) return -1;
      if (b.label === lastCity) return 1;
      if (variant === 'immerse') return 0;
      if (a.streetViewAvailable === b.streetViewAvailable) return 0;
      return a.streetViewAvailable ? -1 : 1;
    });
  }, [lastCity, variant]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  function enterCity(city: HoloFeatureCity) {
    onClose();
    const mobile = isMobileDriveClient();
    const hasVideo = Boolean(resolveDriveVideoRoute(city.label));
    const hasStreet = Boolean(city.streetViewAvailable);
    /**
     * 秘境漫游：无可用漫游素材时直接生成攻略，避免空壳「不可用」。
     * - 手机：无路况视频 → 攻略（轻量页不挂完整街景）
     * - 电脑：无视频且无百度街景 → 攻略
     */
    const noDriveMedia = mobile ? !hasVideo : !hasVideo && !hasStreet;
    if (variant === 'immerse' && noDriveMedia) {
      navigateHoloPlanSearch(navigate, {
        query: `去${city.label}漫行`,
        destination: city.label,
        originLabel: userOrigin?.label,
      });
      return;
    }
    navigate(driveCityPath(city.label));
  }

  return (
    <div className="holo-drive-picker" role="presentation" onClick={onClose}>
      <div
        className="holo-drive-picker__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="holo-drive-picker__head">
          <div>
            <p className="holo-drive-picker__eyebrow">
              {variant === 'immerse' ? t.picker.immerseEyebrow : t.picker.cabinEyebrow}
            </p>
            <h2 id={titleId} className="holo-drive-picker__title">
              {variant === 'immerse' ? t.picker.immerseTitle : t.picker.cabinTitle}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="holo-drive-picker__close"
            onClick={onClose}
            aria-label={t.picker.close}
          >
            ×
          </button>
        </div>
        <p className="holo-drive-picker__hint">
          {variant === 'immerse' ? t.picker.immerseHint : t.picker.cabinHint}
        </p>
        <ul className="holo-drive-picker__list">
          {cities.map((city) => (
            <li key={city.id}>
              <button
                type="button"
                className="holo-drive-picker__city"
                onClick={() => enterCity(city)}
              >
                <span className="holo-drive-picker__city-name">
                  {localizeHotCityLabel(city.label, locale)}
                  {city.label === lastCity ? (
                    <span className="holo-drive-picker__badge">{t.picker.justNow}</span>
                  ) : null}
                </span>
                <span className="holo-drive-picker__city-tag">
                  {locale === 'en' ? (FEATURE_CITY_TAG_EN[city.id] ?? city.tag) : city.tag}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
