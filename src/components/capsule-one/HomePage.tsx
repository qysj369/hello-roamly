import { useEffect } from 'react';
import CapsuleHudChrome from '@/components/capsule-one/CapsuleHudChrome';
import CapsuleOneScene from '@/components/capsule-one/CapsuleOneScene';
import CapsuleOverlay from '@/components/capsule-one/CapsuleOverlay';
import type { CapsuleCityPoint } from '@/data/capsuleHotRoutes';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { CAPSULE_FONT_URL } from '@/lib/config/capsuleDesignTokens';
import { playCapsuleCityLockChime, speakCapsuleSystemLine } from '@/lib/capsule/capsuleSystemVoice';
import { homePageSeo } from '@/lib/seo';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';
import '@/styles/capsule-one.css';

/** 首页 · 纸上行旅（Paper Roam）— 地球与搜索主导，东方现代留白 */
export default function CapsuleOneHomePage() {
  usePageSeo(homePageSeo());

  const lockCity = useCapsuleOneStore((state) => state.lockCity);
  const triggerPulse = useCapsuleOneStore((state) => state.triggerPulse);

  useEffect(() => {
    document.documentElement.classList.add('capsule-one-active');

    let link = document.getElementById('capsule-one-fonts') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = 'capsule-one-fonts';
      link.rel = 'stylesheet';
      link.href = CAPSULE_FONT_URL;
      document.head.appendChild(link);
    }

    return () => {
      document.documentElement.classList.remove('capsule-one-active');
    };
  }, []);

  const handleCitySelect = (city: CapsuleCityPoint) => {
    lockCity(city);
    triggerPulse(0.75);
    const muted = useCapsuleOneStore.getState().muted;
    playCapsuleCityLockChime(muted);
    void speakCapsuleSystemLine('destinationConfirmed', muted);
  };

  return (
    <div className="capsule-one-home capsule-one-home--paper-roam">
      <div className="capsule-one-home__nebula" aria-hidden />
      <h1 className="sr-only">蜗牛旅行 HelloRoamly — 极简于心，慢行致远</h1>
      <CapsuleHudChrome />
      <CapsuleOneScene onCitySelect={handleCitySelect} />
      <CapsuleOverlay />
    </div>
  );
}
