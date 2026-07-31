import { Link } from 'react-router-dom';
import { resolveCityCoverUrl } from '@/data/cityCoverImages';
import { CityCoverImage } from '@/components/features/home/CityCoverImage';
import type { GuideCardDisplay } from '@/utils/guideCardDisplay';
import { guideDetailPath, profilePathForUser } from '@/router/paths';
import { AvatarImage } from '@/components/ui';
import { cn } from '@/utils/cn';

export type HomeGuideCardProps = {
  card: GuideCardDisplay;
  className?: string;
};

/** 首页统一攻略卡片 — 封面 / 元信息 / 启示 / 作者 */
export default function HomeGuideCard({ card, className }: HomeGuideCardProps) {
  const coverUrl = card.coverImageUrl ?? resolveCityCoverUrl(card.city);

  return (
    <article
      className={cn(
        'home-guide-card group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-emerald-300/60 hover:shadow-[0_12px_40px_rgba(16,185,129,0.12)]',
        className,
      )}
    >
      <Link to={guideDetailPath(card.id)} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <CityCoverImage
            city={card.city}
            src={coverUrl}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            fallbackTextClassName="text-xl"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 shadow-sm">
            黏液轨迹
          </span>
        </div>

        <div className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            {card.metaTag}
          </p>
          <h3 className="mt-1.5 text-base font-bold leading-snug text-slate-900 group-hover:text-emerald-800">
            {card.title}
          </h3>
          {card.insight ? (
            <p className="home-guide-card__insight mt-2 text-xs leading-relaxed text-emerald-800">
              💡 {card.insight}
            </p>
          ) : null}
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{card.excerpt}</p>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          {card.authorAvatar ? (
            <AvatarImage
              src={card.authorAvatar}
              displayName={card.authorName}
              size={24}
              className="h-6 w-6 shrink-0"
            />
          ) : (
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700"
              aria-hidden
            >
              {card.authorName.slice(0, 1)}
            </span>
          )}
          {card.authorId ? (
            <Link
              to={profilePathForUser(card.authorId)}
              className="truncate text-xs font-medium text-slate-600 hover:text-emerald-700 hover:underline"
            >
              {card.authorName}
            </Link>
          ) : (
            <p className="truncate text-xs font-medium text-slate-600">{card.authorName}</p>
          )}
        </div>
        {card.updatedAtLabel ? (
          <time className="shrink-0 text-[10px] text-slate-400">{card.updatedAtLabel}</time>
        ) : null}
      </div>
    </article>
  );
}
