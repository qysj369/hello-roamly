import { BRAND_DOMAIN } from '@/lib/config/brand';
import { cn } from '@/utils/cn';

type BrandDomainLabelProps = {
  className?: string;
};

/** 品牌域名小字 — 顶栏 Logo 下 / 页脚 */
export default function BrandDomainLabel({ className }: BrandDomainLabelProps) {
  return (
    <span className={cn('brand-domain-label block truncate font-mono text-[10px] tracking-wide text-slate-400', className)}>
      {BRAND_DOMAIN}
    </span>
  );
}
