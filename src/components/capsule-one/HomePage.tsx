import { useEffect } from 'react';
import CapsuleHudChrome from '@/components/capsule-one/CapsuleHudChrome';
import CapsuleOneScene from '@/components/capsule-one/CapsuleOneScene';
import type { CapsuleCityPoint } from '@/data/capsuleHotRoutes';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { homePageSeo } from '@/lib/seo';
import '@/styles/capsule-one.css';

/** 蜗牛号飞行漫游座舱：圆点短按打印城市名，暂不跳行程 */
export default function CapsuleOneHomePage() {
  usePageSeo(homePageSeo());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('capsule-one-active');
    return () => root.classList.remove('capsule-one-active');
  }, []);

  const handleCitySelect = (city: CapsuleCityPoint) => {
    console.log(city.label);
  };

  return (
    <div className="capsule-one-home capsule-one-home--cockpit">
      <h1 className="sr-only">蜗牛旅行 HelloRoamly — 飞行漫游座舱</h1>
      <CapsuleHudChrome />
      <CapsuleOneScene onCitySelect={handleCitySelect} />
    </div>
  );
}
