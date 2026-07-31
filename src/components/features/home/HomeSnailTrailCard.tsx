import { Link } from 'react-router-dom';
import { resolveCityCoverUrl } from '@/data/cityCoverImages';
import { CityCoverImage } from '@/components/features/home/CityCoverImage';
import type { GuideCardDisplay } from '@/utils/guideCardDisplay';
import { guideDetailPath, profilePathForUser } from '@/router/paths';
import { cn } from '@/utils/cn';

type HomeSnailTrailCardProps = {
  card: GuideCardDisplay;
  className?: string;
};

/** 首页攻略卡片 — 封面 / 标题 / 元标签 / 摘要 / 作者 */
export default function HomeSnailTrailCard({ card, className }: HomeSnailTrailCardProps) {
  const destination = card.city || card.metaTag.split(' · ')[0] || '';
  const coverUrl = card.coverImageUrl ?? resolveCityCoverUrl(destination);

  return (
    <article
      className={cn(
        'mb-4 break-inside-avoid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm',
        className,
      )}
    >
      <Link to={guideDetailPath(card.id)} className="block">
        <CityCoverImage
          city={destination}
          src={coverUrl}
          className="aspect-[16/10] w-full object-cover"
          fallbackTextClassName="text-lg"
        />

        <div className="p-4">
          <h3 className="text-base font-bold leading-snug text-slate-900">{card.title}</h3>
          <p className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            {card.metaTag}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.excerpt}</p>
        </div>
      </Link>

      <div className="border-t border-slate-100 px-4 py-2.5">
        {card.authorId ? (
          <Link
            to={profilePathForUser(card.authorId)}
            className="text-xs font-medium text-slate-500 hover:text-emerald-700 hover:underline"
          >
            {card.authorName}
          </Link>
        ) : (
          <p className="text-xs font-medium text-slate-500">{card.authorName}</p>
        )}
      </div>
    </article>
  );
}
