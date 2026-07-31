import { BRAND_NAME, BRAND_NAME_EN, BRAND_SPIRIT_SLOGAN } from '@/lib/config/brand';

type SnailBrandLogoProps = {
  size?: number;
  /** compact=仅图标+中文名；full=含英文与 slogan */
  variant?: 'compact' | 'full';
  className?: string;
};

/** 全局蜗牛品牌标：螺旋线壳 + 蜗牛旅行 HelloRoamly + slogan */
export default function SnailBrandLogo({
  size = 32,
  variant = 'full',
  className = '',
}: SnailBrandLogoProps) {
  return (
    <div className={`snail-brand-logo ${className}`.trim()}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden
        className="snail-brand-logo__icon"
      >
        {/* 螺旋壳 */}
        <path
          d="M18 28.5c-5.2 0-9.4-3.8-9.4-9.2 0-6.2 4.6-10.8 10.4-10.8 4.6 0 8.2 3 8.2 7.2 0 3.4-2.4 5.8-5.6 5.8-2.6 0-4.4-1.8-4.4-4.2 0-2.2 1.6-3.6 3.6-3.6"
          stroke="var(--theme-accent)"
          strokeWidth="1.55"
          strokeLinecap="round"
        />
        {/* 触角 */}
        <path
          d="M24.2 12.2V8.8M27.4 13.4l1.8-1.8"
          stroke="var(--theme-accent)"
          strokeWidth="1.45"
          strokeLinecap="round"
        />
        <circle cx="24.2" cy="7.8" r="1.15" fill="var(--theme-accent)" />
        <circle cx="29.8" cy="10.8" r="1.15" fill="var(--theme-accent)" />
      </svg>

      <div className="snail-brand-logo__text">
        <p className="snail-brand-logo__title">
          <span className="snail-brand-logo__zh">{BRAND_NAME}</span>
          {variant === 'full' ? (
            <span className="snail-brand-logo__en">{BRAND_NAME_EN}</span>
          ) : null}
        </p>
        {variant === 'full' ? (
          <p className="snail-brand-logo__slogan">{BRAND_SPIRIT_SLOGAN}</p>
        ) : null}
      </div>
    </div>
  );
}
