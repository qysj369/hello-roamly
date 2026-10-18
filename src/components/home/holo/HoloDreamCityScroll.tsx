import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildCityMoodPlaceholderSrc } from '@/data/holoCityPreviewGalleryResolve';
import {
  findHoloHomeCityKit,
  getHoloHomeCityNames,
  localizeHoloHomeCityLabel,
} from '@/data/holoHotCityKit';
import { useI18n } from '@/i18n/useI18n';
import { paths } from '@/router/paths';

type HoloDreamCityScrollProps = {
  ariaLabel: string;
  onSelectCity: (city: string) => void;
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

/** 仅移动端渲染封面；PC 保持文字胶囊 */
function DestCover({ city }: { city: string }) {
  const fallback = useMemo(() => buildCityMoodPlaceholderSrc(city, 0), [city]);
  const coverPath = findHoloHomeCityKit(city)?.coverPath;
  const [src, setSrc] = useState(coverPath || fallback);

  useEffect(() => {
    setSrc(coverPath || fallback);
  }, [coverPath, fallback]);

  return (
    <img
      className="holo-home__dest-cover"
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => {
        if (src !== fallback) setSrc(fallback);
      }}
    />
  );
}

/** 首页热门城市：13 城种草弹窗 +「更多」进完整列表 */
export default function HoloDreamCityScroll({
  ariaLabel,
  onSelectCity,
}: HoloDreamCityScrollProps) {
  const { locale, messages: t } = useI18n();
  const cities = getHoloHomeCityNames();
  const isNarrow = useIsNarrowViewport(767);

  return (
    <div className="holo-home__dest-strip">
      <div className="holo-home__dest-track" role="list" aria-label={ariaLabel}>
        {cities.map((city, index) => (
          <span key={city} className="holo-home__dest-item" role="listitem">
            {index > 0 ? (
              <span className="holo-home__dest-sep" aria-hidden>
                {' · '}
              </span>
            ) : null}
            <button
              type="button"
              className="holo-home__dest-link"
              onClick={() => onSelectCity(city)}
            >
              {isNarrow ? <DestCover city={city} /> : null}
              {localizeHoloHomeCityLabel(city, locale)}
            </button>
          </span>
        ))}
        <span className="holo-home__dest-item" role="listitem">
          <span className="holo-home__dest-sep" aria-hidden>
            {' · '}
          </span>
          <Link className="holo-home__dest-link holo-home__dest-link--more" to={paths.cities}>
            {t.city.more}
          </Link>
        </span>
      </div>
    </div>
  );
}
