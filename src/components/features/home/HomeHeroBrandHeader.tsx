import {
  BRAND_FUNCTION_DESC,
  BRAND_MARK,
  BRAND_SPIRIT_SLOGAN,
} from '@/lib/config/brandCopy';
import { cn } from '@/utils/cn';

type HomeHeroBrandHeaderProps = {
  className?: string;
};

/**
 * 首页品牌头区 — 攻略库入口
 * mark → 攻略库定位标题 → 精神口号
 */
export default function HomeHeroBrandHeader({ className }: HomeHeroBrandHeaderProps) {
  return (
    <header className={cn('brand-header', className)}>
      <p className="brand-header__mark">{BRAND_MARK}</p>
      <h1 id="home-brand-slogan" className="brand-header__slogan text-balance">
        {BRAND_FUNCTION_DESC}
      </h1>
      <p className="brand-header__subtitle">{BRAND_SPIRIT_SLOGAN}</p>
    </header>
  );
}
