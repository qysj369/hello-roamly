import {
  BRAND_ABOUT_SNAIL_BODY,
  BRAND_ABOUT_SNAIL_TITLE,
  BRAND_ABOUT_VALUES,
} from '@/lib/config/brand';
import {
  FOOTER_ROLLOUT_PLAN_LINES,
  FOOTER_ROLLOUT_PLAN_TITLE,
} from '@/lib/config/rolloutPhases';

/**
 * 关于我们页 · 品牌介绍 + 迭代规划（文案与首页原卡片一致，仅归属迁移）
 * 上下堆叠；卡片限高；无链接 / 无商业引导
 */
export default function AboutBrandStorySection() {
  return (
    <div className="holo-about__brand-stack">
      <section className="holo-about__brand-card" aria-labelledby="about-brand-snail-title">
        <h2 id="about-brand-snail-title" className="holo-about__brand-card-title">
          {BRAND_ABOUT_SNAIL_TITLE}
        </h2>
        <p className="holo-about__brand-card-body">{BRAND_ABOUT_SNAIL_BODY}</p>
        <ul className="holo-about__brand-card-values">
          {BRAND_ABOUT_VALUES.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span>：{item.line}</span>
            </li>
          ))}
        </ul>
      </section>

      <aside className="holo-about__brand-card" aria-labelledby="about-brand-rollout-title">
        <h2 id="about-brand-rollout-title" className="holo-about__brand-card-title">
          {FOOTER_ROLLOUT_PLAN_TITLE}
        </h2>
        <ul className="holo-about__brand-rollout-list">
          {FOOTER_ROLLOUT_PLAN_LINES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
