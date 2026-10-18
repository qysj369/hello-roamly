import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/useI18n';
import { paths } from '@/router/paths';

type HoloCommunitySectionProps = {
  /** 移动端：与底栏入口去重，只保留紧凑芯片 */
  compact?: boolean;
};

/** 蜗友在路上：只导到已上线页面，不把人送进空社区 */
export default function HoloCommunitySection({ compact = false }: HoloCommunitySectionProps) {
  const { messages: t } = useI18n();

  const allItems = [
    {
      key: 'track',
      title: t.track.suburbTitle,
      desc: t.track.suburbDesc,
      to: paths.cities,
    },
    {
      key: 'budget',
      title: t.track.budgetTitle,
      desc: t.track.budgetDesc,
      to: paths.budget,
    },
    {
      key: 'stories',
      title: t.ugc.storiesTitle,
      desc: t.ugc.storiesDesc,
      to: paths.inspire,
    },
    {
      key: 'buddy',
      title: t.ugc.buddyTitle,
      desc: t.ugc.buddyDesc,
      to: paths.ai,
    },
  ] as const;

  /** 移动端底栏已是首页 / 管家 / 我的，四张卡片都保留 */
  const items = compact
    ? allItems.filter((item) => item.key === 'stories' || item.key === 'buddy')
    : allItems;

  return (
    <section
      className={`holo-home__community${compact ? ' holo-home__community--compact' : ''}`}
      aria-label={t.ugc.sectionTitle}
    >
      <h2 className="holo-home__section-title holo-home__section-title--block">{t.ugc.sectionTitle}</h2>
      {compact ? null : <p className="holo-home__community-lead">{t.ugc.browseHint}</p>}
      <div className="holo-home__community-grid" role="list">
        {items.map((item) => (
          <Link key={item.key} role="listitem" to={item.to} className="holo-home__community-card">
            <span className="holo-home__community-card-title">{item.title}</span>
            {compact ? null : (
              <>
                <span className="holo-home__community-card-desc">{item.desc}</span>
                <span className="holo-home__community-card-more">{t.ugc.readMore}</span>
              </>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
