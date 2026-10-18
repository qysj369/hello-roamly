import { useNavigate } from 'react-router-dom';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import { holoHotCitiesAll, localizeHotCityLabel } from '@/data/holoDreamDestinations';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { useUserMapOrigin } from '@/hooks/map/useUserMapOrigin';
import { useI18n } from '@/i18n/useI18n';
import { citiesPageSeo } from '@/lib/seo';
import { navigateHoloPlanSearch } from '@/lib/home/launchHoloPlanSearch';
import '@/styles/holo-home.css';
import '@/styles/holo-inner.css';

/**
 * 热门城市二级列表（「更多」入口）。
 * 点城直接生成穷游攻略，不挂 WebGL 弹窗，避免从首页 SPA 跳入时崩溃。
 */
export default function CitiesPage() {
  const { locale, messages: t } = useI18n();
  const navigate = useNavigate();
  const { origin: userOrigin } = useUserMapOrigin();

  usePageSeo(citiesPageSeo());

  const goPlan = (city: string) => {
    navigateHoloPlanSearch(navigate, {
      query: `去${city}漫行`,
      destination: city,
      originLabel: userOrigin?.label,
    });
  };

  return (
    <MotionPage className="holo-cities-page">
      <MotionBlock>
        <h1 className="holo-cities-page__title">{t.city.listTitle}</h1>
        <p className="holo-cities-page__desc">{t.city.listDesc}</p>
      </MotionBlock>
      <MotionBlock>
        <div className="holo-cities-page__grid" role="list">
          {holoHotCitiesAll.map((city) => (
            <button
              key={city}
              type="button"
              role="listitem"
              className="holo-cities-page__chip"
              onClick={() => goPlan(city)}
            >
              {localizeHotCityLabel(city, locale)}
            </button>
          ))}
        </div>
      </MotionBlock>
    </MotionPage>
  );
}
