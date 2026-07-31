import { BRAND_SPIRIT_SLOGAN } from '@/lib/config/brand';
import { cn } from '@/utils/cn';

type BrandSpiritSloganProps = {
  /** 首页地图驾驶舱深色顶栏 */
  variant?: 'cockpit' | 'default';
  className?: string;
};

/** 品牌精神口号 — 艺术体副标题 */
export default function BrandSpiritSlogan({
  variant = 'default',
  className,
}: BrandSpiritSloganProps) {
  return (
    <span
      className={cn(
        'brand-spirit-slogan block truncate',
        variant === 'cockpit' && 'brand-spirit-slogan--cockpit',
        className,
      )}
    >
      {BRAND_SPIRIT_SLOGAN}
    </span>
  );
}
