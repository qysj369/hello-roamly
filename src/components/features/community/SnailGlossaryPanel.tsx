import {
  SNAIL_COMMUNITY,
  SNAIL_COMMUNITY_CREED,
  SNAIL_RANKS,
  SNAIL_SLANG_CATEGORY_LABELS,
  SNAIL_SLANG_GLOSSARY,
  type SnailSlangCategory,
} from '@/lib/config/snailCommunity';
import SnailSlangTerm from '@/components/features/community/SnailSlangTerm';
import { cn } from '@/utils/cn';

type SnailGlossaryPanelProps = {
  showCreed?: boolean;
  showRanks?: boolean;
  className?: string;
};

const CATEGORY_ORDER: SnailSlangCategory[] = ['guide', 'budget', 'social', 'action'];

function groupGlossaryByCategory() {
  const groups = new Map<SnailSlangCategory, typeof SNAIL_SLANG_GLOSSARY>();
  for (const category of CATEGORY_ORDER) {
    groups.set(
      category,
      SNAIL_SLANG_GLOSSARY.filter((entry) => entry.category === category),
    );
  }
  return groups;
}

/** 蜗牛黑话手册 — 词典 + 可选公约与蜗阶 */
export default function SnailGlossaryPanel({
  showCreed = true,
  showRanks = true,
  className,
}: SnailGlossaryPanelProps) {
  const grouped = groupGlossaryByCategory();

  return (
    <div className={cn('space-y-8', className)}>
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          {SNAIL_COMMUNITY.name}
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">{SNAIL_COMMUNITY.glossaryTitle}</h2>
        <p className="mt-2 text-sm text-slate-600">{SNAIL_COMMUNITY.glossarySubtitle}</p>
      </header>

      {showCreed && (
        <section aria-labelledby="snail-creed-title">
          <h3 id="snail-creed-title" className="text-base font-bold text-slate-900">
            {SNAIL_COMMUNITY.creedTitle}
          </h3>
          <ul className="mt-3 space-y-2">
            {SNAIL_COMMUNITY_CREED.map((line) => (
              <li
                key={line}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-700"
              >
                {line}
              </li>
            ))}
          </ul>
        </section>
      )}

      {CATEGORY_ORDER.map((category) => {
        const entries = grouped.get(category) ?? [];
        if (entries.length === 0) {
          return null;
        }

        return (
          <section key={category} aria-labelledby={`snail-glossary-${category}`}>
            <h3
              id={`snail-glossary-${category}`}
              className="text-sm font-bold text-slate-900"
            >
              {SNAIL_SLANG_CATEGORY_LABELS[category]}
            </h3>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <dt className="text-sm font-bold text-slate-900">
                    <SnailSlangTerm entry={entry} />
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-600">{entry.meaning}</dd>
                  {entry.example && (
                    <dd className="mt-1.5 text-xs text-slate-400">{entry.example}</dd>
                  )}
                </div>
              ))}
            </dl>
          </section>
        );
      })}

      {showRanks && (
        <section aria-labelledby="snail-ranks-title">
          <h3 id="snail-ranks-title" className="text-sm font-bold text-slate-900">
            蜗阶称号
          </h3>
          <p className="mt-1 text-xs text-slate-500">按发布计划数粗略划分，正式版可接入轨迹点统计。</p>
          <ol className="mt-3 space-y-2">
            {SNAIL_RANKS.map((rank) => (
              <li
                key={rank.id}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <span className="text-lg" aria-hidden>
                  {rank.emoji}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{rank.title}</p>
                  <p className="mt-0.5 text-xs text-slate-600">{rank.description}</p>
                  {rank.minPublishedPlans > 0 && (
                    <p className="mt-1 text-[10px] text-slate-400">
                      约 {rank.minPublishedPlans}+ 条计划
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
