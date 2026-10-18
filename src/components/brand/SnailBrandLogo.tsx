import { BRAND_NAME, BRAND_NAME_EN, BRAND_SPIRIT_SLOGAN } from '@/lib/config/brand';
import { useI18n } from '@/i18n/useI18n';

type SnailBrandLogoProps = {
  size?: number;
  /** compact=仅图标+中文名；full=含英文与 slogan */
  variant?: 'compact' | 'full';
  className?: string;
};

/** 全局蜗牛品牌标：螺旋线壳 + 蜗牛旅行 HelloRoamly + slogan（跟随 i18n） */
export default function SnailBrandLogo({
  size = 32,
  variant = 'full',
  className = '',
}: SnailBrandLogoProps) {
  const { locale, messages: t } = useI18n();
  const isEn = locale === 'en';
  const primaryName = isEn ? t.brand.logo : BRAND_NAME;
  const secondaryName = isEn ? null : BRAND_NAME_EN;
  const slogan = isEn ? t.brand.slogan : BRAND_SPIRIT_SLOGAN;

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
        <path
          d="M18 28.5c-5.2 0-9.4-3.8-9.4-9.2 0-6.2 4.6-10.8 10.4-10.8 4.6 0 8.2 3 8.2 7.2 0 3.4-2.4 5.8-5.6 5.8-2.6 0-4.4-1.8-4.4-4.2 0-2.2 1.6-3.6 3.6-3.6"
          stroke="var(--theme-accent)"
          strokeWidth="1.55"
          strokeLinecap="round"
        />
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
          <span className="snail-brand-logo__zh">{primaryName}</span>
          {variant === 'full' && secondaryName ? (
            <span className="snail-brand-logo__en">{secondaryName}</span>
          ) : null}
        </p>
        {variant === 'full' ? <p className="snail-brand-logo__slogan">{slogan}</p> : null}
      </div>
    </div>
  );
}
