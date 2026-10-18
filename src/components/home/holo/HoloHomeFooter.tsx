import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/useI18n';
import {
  SITE_ICP_NUMBER,
  SITE_ICP_URL,
  SITE_MPS_BEIAN_NUMBER,
  SITE_MPS_BEIAN_URL,
  SITE_PLATFORM_DISCLAIMER,
} from '@/lib/config/siteCompliance';
import { paths } from '@/router/paths';

type HoloHomeFooterProps = {
  isDesktop: boolean;
};

/** 首页页脚：标语 + 合规链接 + 备案/版权（品牌介绍改至 /about） */
export default function HoloHomeFooter({ isDesktop }: HoloHomeFooterProps) {
  const { messages: t } = useI18n();

  const legalLinks = [
    { to: paths.about, label: t.footer.about },
    { to: paths.privacy, label: t.footer.privacy },
    { to: paths.terms, label: t.footer.terms },
    { to: paths.contact, label: t.footer.contact },
    { to: paths.feedback, label: t.footer.feedback },
  ] as const;

  return (
    <footer className={`holo-home__footer${isDesktop ? '' : ' holo-home__footer--mobile'}`}>
      <div className="holo-home__footer-grid">
        <p className="holo-home__footer-motto">{t.footer.motto}</p>
        <p className="holo-home__footer-legal">{SITE_PLATFORM_DISCLAIMER}</p>

        <nav className="holo-home__footer-links" aria-label={t.footer.legalNav}>
          {legalLinks.map((link, index) => (
            <span key={link.to} className="holo-home__footer-link-item">
              {index > 0 ? <span className="holo-home__footer-link-sep" aria-hidden>｜</span> : null}
              <Link to={link.to}>{link.label}</Link>
            </span>
          ))}
        </nav>

        <div className="holo-home__footer-meta">
          <p className="holo-home__beian">
            <a href={SITE_ICP_URL} rel="noreferrer" target="_blank">
              {SITE_ICP_NUMBER}
            </a>
            <span aria-hidden> · </span>
            <a href={SITE_MPS_BEIAN_URL} rel="noreferrer" target="_blank">
              {SITE_MPS_BEIAN_NUMBER}
            </a>
          </p>
          <p className="holo-home__copyright">{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
