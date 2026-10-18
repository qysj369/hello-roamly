import { Link } from 'react-router-dom';
import HoloInnerHeader from '@/components/layout/HoloInnerHeader';
import SiteComplianceBar from '@/components/layout/SiteComplianceBar';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { useI18n } from '@/i18n/useI18n';
import { paths } from '@/router/paths';
import '@/styles/holo-inner.css';

type LegalPlaceholderPageProps = {
  kind: 'privacy' | 'terms' | 'contact';
};

/** 合规静态页占位：首页只挂链接，正文后续单独开发 */
export default function LegalPlaceholderPage({ kind }: LegalPlaceholderPageProps) {
  const { messages: t } = useI18n();
  const title =
    kind === 'privacy' ? t.footer.privacy : kind === 'terms' ? t.footer.terms : t.footer.contact;

  usePageSeo({
    title: `${title} | ${t.brand.logo}`,
    description: t.footer.placeholderHint,
  });

  return (
    <div className="holo-inner-shell">
      <HoloInnerHeader pageLabel={title} />
      <main className="holo-inner-shell__main" style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 64px' }}>
        <h1 style={{ fontSize: 22, margin: '0 0 12px', color: 'var(--text-title)' }}>{title}</h1>
        <p style={{ color: 'var(--theme-muted)', lineHeight: 1.7, marginBottom: 24 }}>
          {t.footer.placeholderHint}
        </p>
        <Link to={paths.home} style={{ color: 'var(--color-main)' }}>
          {t.tabs.home}
        </Link>
        <SiteComplianceBar className="mt-8" />
      </main>
    </div>
  );
}
