import { Link } from 'react-router-dom';
import SnailBrandLogo from '@/components/brand/SnailBrandLogo';
import { useI18n } from '@/i18n/useI18n';
import { paths } from '@/router/paths';
import '@/styles/holo-inner.css';
import '@/styles/snail-brand-logo.css';

type HoloInnerHeaderProps = {
  /** 右侧短标签，如「穷游攻略」 */
  pageLabel: string;
};

/** Holo 内页顶栏：品牌回首页 + 当前页标签 */
export default function HoloInnerHeader({ pageLabel }: HoloInnerHeaderProps) {
  const { messages: t } = useI18n();
  return (
    <header className="holo-inner-shell__header">
      <div className="holo-inner-shell__header-inner">
        <Link to={paths.home} className="holo-inner-shell__brand" aria-label={t.tabs.home}>
          <SnailBrandLogo variant="full" size={28} />
        </Link>
        <div className="holo-inner-shell__header-right">
          <p className="holo-inner-shell__page-label">{pageLabel}</p>
          <Link to={paths.home} className="holo-inner-shell__home-link">
            {t.tabs.home}
          </Link>
        </div>
      </div>
    </header>
  );
}
