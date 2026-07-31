import {
  BRAND_MARK,
  BRAND_SPIRIT_SLOGAN,
} from '@/lib/config/brand';
import BrandDomainLabel from '@/components/layout/BrandDomainLabel';
import SiteComplianceBar from '@/components/layout/SiteComplianceBar';
import { PAGE_CONTAINER_MAX_WIDTH } from '@/lib/layout/pageLayout';
import { cn } from '@/utils/cn';

/** 全站页脚 */
export default function SiteFooter() {
  return (
    <footer className="site-footer mt-10 border-t border-slate-200/80 pt-8 pb-6">
      <div className={cn('mx-auto px-4 text-center', PAGE_CONTAINER_MAX_WIDTH)}>
        <div className="site-footer__brand mx-auto max-w-xs">
          <p className="site-footer__mark">{BRAND_MARK}</p>
          <p className="site-footer__slogan mt-1">{BRAND_SPIRIT_SLOGAN}</p>
          <BrandDomainLabel className="site-footer__domain mx-auto mt-1.5 max-w-fit" />
        </div>
        <SiteComplianceBar className="site-footer__compliance mx-auto mt-5" />
      </div>
    </footer>
  );
}
