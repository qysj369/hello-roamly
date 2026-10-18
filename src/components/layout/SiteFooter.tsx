import { Link } from 'react-router-dom';
import {
  BRAND_ABOUT_SNAIL_BODY,
  BRAND_ABOUT_SNAIL_TITLE,
  BRAND_MARK,
  BRAND_SPIRIT_SLOGAN,
} from '@/lib/config/brand';
import BrandDomainLabel from '@/components/layout/BrandDomainLabel';
import SiteComplianceBar from '@/components/layout/SiteComplianceBar';
import { useI18n } from '@/i18n/useI18n';
import { PAGE_CONTAINER_MAX_WIDTH } from '@/lib/layout/pageLayout';
import { paths } from '@/router/paths';
import { cn } from '@/utils/cn';

/** 全站页脚：品牌 + 关于蜗牛摘要 + 反馈入口 + 备案 */
export default function SiteFooter() {
  const { messages: t } = useI18n();

  return (
    <footer className="site-footer mt-10 border-t border-slate-200/80 pt-8 pb-6">
      <div className={cn('mx-auto px-4 text-center', PAGE_CONTAINER_MAX_WIDTH)}>
        <div className="site-footer__brand mx-auto max-w-xs">
          <p className="site-footer__mark">{BRAND_MARK}</p>
          <p className="site-footer__slogan mt-1">{BRAND_SPIRIT_SLOGAN}</p>
          <BrandDomainLabel className="site-footer__domain mx-auto mt-1.5 max-w-fit" />
        </div>
        <section className="site-footer__about mx-auto mt-5 max-w-xl text-left sm:text-center">
          <h2 className="text-sm font-semibold text-slate-800">{BRAND_ABOUT_SNAIL_TITLE}</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">{BRAND_ABOUT_SNAIL_BODY}</p>
        </section>
        <nav
          className="site-footer__links mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-slate-600"
          aria-label={t.footer.legalNav}
        >
          <Link to={paths.feedback} className="hover:text-slate-900">
            {t.footer.feedback}
          </Link>
          <span aria-hidden className="text-slate-300">
            |
          </span>
          <Link to={paths.contact} className="hover:text-slate-900">
            {t.footer.contact}
          </Link>
          <span aria-hidden className="text-slate-300">
            |
          </span>
          <Link to={paths.about} className="hover:text-slate-900">
            {t.footer.about}
          </Link>
        </nav>
        <SiteComplianceBar className="site-footer__compliance mx-auto mt-5" />
      </div>
    </footer>
  );
}
