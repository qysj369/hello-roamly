import { BRAND_NAME } from '@/lib/config/brand';

/** 座舱极简顶栏：仅「蜗牛旅行」标题 */
export default function CapsuleHudChrome() {
  return (
    <div className="capsule-hud-chrome">
      <div className="capsule-hud-chrome__brand">
        <p className="capsule-hud-chrome__brand-name">{BRAND_NAME}</p>
      </div>
    </div>
  );
}
