import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HOME_CONSTITUTION } from '@/lib/config/homeConstitution';
import { paths } from '@/router/paths';
import { cn } from '@/utils/cn';

type HomeSearchProps = {
  onCommit?: (value: string) => void;
};

/** 首页核心搜索区 — 唯一主 CTA：查找攻略 */
export default function HomeSearch({ onCommit }: HomeSearchProps) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = draft.trim();
    onCommit?.(query);
    navigate(paths.guides, {
      state: query ? { aiDream: query } : undefined,
    });
  }

  return (
    <section aria-labelledby="home-guide-search-title" className="w-full py-4">
      <h2 id="home-guide-search-title" className="sr-only">
        搜索攻略
      </h2>
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-3xl">        <label htmlFor="home-guide-search-input" className="sr-only">
          搜索攻略
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <input
            id="home-guide-search-input"
            type="search"
            name="q"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={HOME_CONSTITUTION.searchPlaceholder}
            className={cn(
              'min-h-[3.5rem] flex-1 rounded-xl border border-slate-300 bg-white px-5 py-4',
              'text-base text-slate-900 placeholder:text-slate-400',
              'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/25',
              'md:min-h-[4rem] md:text-lg',
            )}
          />
          <button
            type="submit"
            className={cn(
              'min-h-[3.5rem] shrink-0 rounded-xl bg-emerald-600 px-8 py-4',
              'text-base font-bold text-white md:min-h-[4rem] md:text-lg',
              'hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
            )}
          >
            {HOME_CONSTITUTION.searchCta}
          </button>
        </div>
      </form>

      <p className="mt-3 text-center text-xs text-slate-500">
        <Link
          to={paths.aiSnail}
          className="text-slate-500 underline-offset-2 hover:text-emerald-700 hover:underline"
        >
          {HOME_CONSTITUTION.aiSnailLink}
        </Link>
        <span className="mx-2 text-slate-300">·</span>
        <Link
          to={paths.guidesPublish}
          className="text-slate-500 underline-offset-2 hover:text-emerald-700 hover:underline"
        >
          留下黏液轨迹
        </Link>
      </p>
    </section>
  );
}
