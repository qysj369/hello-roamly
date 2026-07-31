import { BRAND_NAME, BRAND_SPIRIT_SLOGAN } from '@/lib/config/brand';
import PaperRoamBrandSnail from '@/components/capsule-one/PaperRoamBrandSnail';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';

/** 纸上行旅 — 品牌角标 + 竖排 slogan + 锁定提示 */
export default function CapsuleHudChrome() {
  const lockedCity = useCapsuleOneStore((state) => state.lockedCity);
  const blindBoxActive = useCapsuleOneStore((state) => state.blindBoxActive);

  return (
    <div className="capsule-hud-chrome" aria-hidden>
      <div className="capsule-hud-chrome__vignette" />

      <div className="capsule-hud-chrome__brand">
        <div className="capsule-hud-chrome__brand-title">
          <PaperRoamBrandSnail />
          <span className="capsule-hud-chrome__brand-name">{BRAND_NAME}</span>
        </div>
        <span className="capsule-hud-chrome__brand-slogan">{BRAND_SPIRIT_SLOGAN}</span>
      </div>

      {lockedCity ? (
        <div className="capsule-hud-chrome__lock">
          <span className="capsule-hud-chrome__lock-dot" aria-hidden />
          <span>{lockedCity.label}</span>
          <span className="capsule-hud-chrome__lock-coords">
            {lockedCity.lat.toFixed(2)}°N · {lockedCity.lng.toFixed(2)}°E
          </span>
        </div>
      ) : null}

      {!lockedCity && !blindBoxActive ? (
        <p className="capsule-hud-chrome__earth-guide">转动地球 · 点选目的地</p>
      ) : null}
    </div>
  );
}
