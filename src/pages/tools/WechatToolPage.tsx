import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import { holoHotCitiesAll, localizeHotCityLabel } from '@/data/holoDreamDestinations';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { useUserMapOrigin } from '@/hooks/map/useUserMapOrigin';
import { useI18n } from '@/i18n/useI18n';
import { navigateHoloPlanSearch } from '@/lib/home/launchHoloPlanSearch';
import { SITE_PLATFORM_DISCLAIMER } from '@/lib/config/siteCompliance';
import { mpToolPageSeo } from '@/lib/seo';
import '@/styles/holo-home.css';
import '@/styles/holo-inner.css';

/**
 * 公众号内嵌轻量行程工具：搜索 + 热门城市，不挂 3D 地球。
 */
export default function WechatToolPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();
  const { origin: userOrigin } = useUserMapOrigin();
  const [query, setQuery] = useState('');

  usePageSeo(mpToolPageSeo());

  const goPlan = (cityOrQuery: string) => {
    const text = cityOrQuery.trim();
    if (!text) return;
    navigateHoloPlanSearch(navigate, {
      query: /去|玩|漫/.test(text) ? text : `去${text}漫行`,
      destination: text,
      originLabel: userOrigin?.label,
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    goPlan(query);
  };

  return (
    <MotionPage className="holo-cities-page">
      <MotionBlock>
        <h1 className="holo-cities-page__title">公众号行程工具</h1>
        <p className="holo-cities-page__desc">
          搜一个城市，生成周末漫游、单人短途或亲子出游灵感。仅作游玩参考，不组团、不代订。
        </p>
        <p className="holo-cities-page__desc">{SITE_PLATFORM_DISCLAIMER}</p>
      </MotionBlock>
      <MotionBlock>
        <form className="holo-mp-search" onSubmit={onSubmit}>
          <label className="holo-mp-search__field">
            <span>想去的城市</span>
            <input
              className="holo-mp-search__input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="例如：杭州周末漫游 / 成都亲子"
            />
          </label>
          <button type="submit" className="holo-mp-search__btn" disabled={!query.trim()}>
            生成灵感
          </button>
        </form>
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
