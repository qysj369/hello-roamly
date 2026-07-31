import { Link } from 'react-router-dom';
import SnailSlangTerm from '@/components/features/community/SnailSlangTerm';
import {
  SNAIL_COMMUNITY,
  SNAIL_COMMUNITY_CREED,
  SNAIL_SLANG_GLOSSARY,
} from '@/lib/config/snailCommunity';
import { paths } from '@/router/paths';

const PREVIEW_SLANG_IDS = [
  'slime-trail',
  'snail-insights',
  'shell',
  'pitfall-radar',
  'slow-crawl',
  'trail-master',
] as const;

/** 关于页 — 蜗牛社区文化摘要（链至完整黑话手册） */
export default function AboutSnailCultureSection() {
  const previewEntries = PREVIEW_SLANG_IDS.map((id) =>
    SNAIL_SLANG_GLOSSARY.find((entry) => entry.id === id),
  ).filter((entry): entry is (typeof SNAIL_SLANG_GLOSSARY)[number] => Boolean(entry));

  return (
    <section className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            {SNAIL_COMMUNITY.name}
          </p>
          <h3 className="mt-1 text-base font-bold text-slate-900">{SNAIL_COMMUNITY.glossaryTitle}</h3>
          <p className="mt-2 text-sm text-slate-600">{SNAIL_COMMUNITY.glossarySubtitle}</p>
        </div>
        <Link
          to={paths.snailCulture}
          className="inline-flex rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          完整手册
        </Link>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-semibold text-slate-900">{SNAIL_COMMUNITY.creedTitle}</h4>
        <ul className="mt-2 space-y-1.5">
          {SNAIL_COMMUNITY_CREED.map((line) => (
            <li key={line} className="text-sm leading-relaxed text-slate-700">
              · {line}
            </li>
          ))}
        </ul>
      </div>

      <dl className="mt-5 grid gap-2 sm:grid-cols-2">
        {previewEntries.map((entry) => (
          <div key={entry.id} className="rounded-xl border border-emerald-100 bg-white px-3 py-2.5">
            <dt className="text-sm font-bold text-slate-900">
              <SnailSlangTerm entry={entry} />
            </dt>
            <dd className="mt-0.5 text-xs leading-relaxed text-slate-600">{entry.meaning}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
