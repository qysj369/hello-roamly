import {
  SITE_COMPLAINT_EMAIL,
  SITE_ICP_NUMBER,
  SITE_ICP_URL,
  SITE_MPS_BEIAN_NUMBER,
  SITE_MPS_BEIAN_URL,
} from '@/lib/config/siteCompliance';
import { cn } from '@/utils/cn';

type SiteComplianceBarProps = {
  className?: string;
  /** about 页可展示稍大字号 */
  variant?: 'footer' | 'about';
};

/** ICP / 公安备案 / 投诉举报公示 */
export default function SiteComplianceBar({
  className,
  variant = 'footer',
}: SiteComplianceBarProps) {
  const isAbout = variant === 'about';

  return (
    <nav
      className={cn(
        'site-compliance',
        isAbout && 'site-compliance--about',
        className,
      )}
      aria-label="备案与投诉举报"
    >
      <p className="site-compliance__beian">
        <a
          href={SITE_ICP_URL}
          rel="noreferrer"
          target="_blank"
          className="site-compliance__link"
        >
          {SITE_ICP_NUMBER}
        </a>
        <span className="site-compliance__sep" aria-hidden>
          ·
        </span>
        <a
          href={SITE_MPS_BEIAN_URL}
          rel="noreferrer"
          target="_blank"
          className="site-compliance__link"
        >
          {SITE_MPS_BEIAN_NUMBER}
        </a>
      </p>
      <p className="site-compliance__contact">
        投诉举报邮箱：
        <a href={`mailto:${SITE_COMPLAINT_EMAIL}`} className="site-compliance__link">
          {SITE_COMPLAINT_EMAIL}
        </a>
      </p>
    </nav>
  );
}
