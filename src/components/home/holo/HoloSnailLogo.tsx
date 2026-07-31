type HoloSnailLogoProps = {
  size?: number;
  strokeWidth?: number;
};

/** @deprecated 请使用 `@/components/brand/SnailBrandLogo`；保留以兼容旧引用 */
export default function HoloSnailLogo({ size = 36, strokeWidth = 1.5 }: HoloSnailLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden
      className="holo-snail-logo"
    >
      <path
        d="M10 24c0-5 3.5-9 8-10 3.5-.8 7 1.2 8.5 4.2"
        stroke="var(--theme-accent, #5c7a6b)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M18 14c3.8 0 7 3.2 7 7.2S21.8 28.5 18 28.5 11 25.2 11 21.2 14.2 14 18 14Z"
        stroke="var(--theme-accent, #5c7a6b)"
        strokeWidth={strokeWidth}
      />
      <path
        d="M24.5 12.5v-2.2M27.2 13.8l1.6-1.5"
        stroke="var(--theme-accent, #5c7a6b)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <circle cx="24.5" cy="9.4" r="1.1" fill="var(--theme-accent, #5c7a6b)" />
      <circle cx="29.4" cy="11.4" r="1.1" fill="var(--theme-accent, #5c7a6b)" />
    </svg>
  );
}
