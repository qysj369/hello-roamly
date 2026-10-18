import { BookOpen, MapPinned, Sparkles } from 'lucide-react';
import { memo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { findUserById } from '@/data/findUserById';
import { demoGuides } from '@/data/demoGuides';
import { findTravelPlanById } from '@/data/findTravelPlan';
import type { DiscoverFeedItem } from '@/types/domain/discover';
import { guideDetailPath, savedUserPlanDetailPath, travelPlanDetailPath, userProfilePath } from '@/router/paths';
import { formatRelativeZh } from '@/utils/date';
import {
  getGuideCoverUrl,
  getMomentCoverUrl,
  getPlanCoverImage,
} from '@/utils/discoverMedia';
import {
  getPlanBudgetLabel,
  getPlanDaysLabel,
  getPlanDestination,
} from '@/utils/travelPlanView';
import { getMomentDescription } from '@/utils/travelMomentDisplay';
import { getSavedUserPlanCoverUrl } from '@/utils/userPlanView';
import { getDiscoverPinAspectClass, type DiscoverPinSize } from '@/utils/discoverMasonry';
import { getGuideCoverAlt, getMomentImageAlt, getTravelPlanCoverAlt } from '@/utils/imageAlt';
import DiscoverRecommendBadge from '@/components/features/discover/DiscoverRecommendBadge';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { cn } from '@/utils/cn';

export type DiscoverMasonryCardProps = {
  item: DiscoverFeedItem;
  recommendScore?: number;
  recommendReasons?: string[];
  /** Pinterest 叠图布局 */
  layout?: 'classic' | 'pinterest';
  pinSize?: DiscoverPinSize;
  className?: string;
};

const KIND_META = {
  guide: { label: '攻略', Icon: BookOpen, accent: 'bg-emerald-500/90' },
  plan: { label: '计划', Icon: MapPinned, accent: 'bg-[#54786c]/90' },
  savedPlan: { label: '漫行方案', Icon: MapPinned, accent: 'bg-brand-500/90' },
  moment: { label: '瞬间', Icon: Sparkles, accent: 'bg-[#2c6b58]/90' },
} as const;

function PinShell({
  href,
  coverUrl,
  coverAlt,
  badge,
  recommendBadge,
  title,
  subtitle,
  meta,
  aspectClass,
  className,
}: {
  href: string;
  coverUrl: string;
  coverAlt: string;
  badge: ReactNode;
  recommendBadge?: ReactNode;
  title: string;
  subtitle: string;
  meta: string;
  aspectClass: string;
  className?: string;
}) {
  return (
    <Link
      to={href}
      className={cn(
        'group relative block overflow-hidden rounded-xl bg-slate-200 shadow-none ring-1 ring-[#b7cdc4]/70 transition duration-300 hover:ring-[#2c6b58]/35',
        className,
      )}
    >
      <div className={cn('relative w-full overflow-hidden', aspectClass)}>
        <OptimizedImage
          src={coverUrl}
          alt={coverAlt}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px"
          className="transition duration-500 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/75" aria-hidden />
        <div className="absolute left-2 right-2 top-2 flex flex-wrap items-start justify-between gap-1">
          {badge}
          {recommendBadge}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3 pt-8">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-white drop-shadow-sm">
            {title}
          </p>
          <p className="mt-0.5 line-clamp-1 text-xs text-white/85">{subtitle}</p>
          <p className="mt-1 text-[10px] text-white/70">{meta}</p>
        </div>
      </div>
    </Link>
  );
}

function CardShell({
  href,
  coverUrl,
  coverAlt,
  badge,
  title,
  subtitle,
  meta,
  tall = false,
  recommendBadge,
  className,
}: {
  href: string;
  coverUrl: string;
  coverAlt: string;
  badge: ReactNode;
  recommendBadge?: ReactNode;
  title: string;
  subtitle: string;
  meta: string;
  tall?: boolean;
  className?: string;
}) {
  return (
    <Link
      to={href}
      className={cn(
        'group block overflow-hidden rounded-xl border border-[#b7cdc4] bg-[#fffef6] shadow-none transition hover:border-[#2c6b58]',
        className,
      )}
    >
      <div className={cn('relative overflow-hidden bg-slate-100', tall ? 'aspect-[3/4]' : 'aspect-[4/3]')}>
        <OptimizedImage
          src={coverUrl}
          alt={coverAlt}
          fill
          sizes="(max-width: 640px) 90vw, 320px"
          className="transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
        <div className="absolute left-2 right-2 top-2 flex flex-wrap items-start justify-between gap-1">
          {badge}
          {recommendBadge}
        </div>
      </div>
      <div className="space-y-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{title}</p>
        <p className="line-clamp-1 text-xs text-slate-500">{subtitle}</p>
        <p className="text-[10px] text-slate-400">{meta}</p>
      </div>
    </Link>
  );
}

function DiscoverMasonryCard({
  item,
  recommendScore = 0,
  recommendReasons = [],
  layout = 'pinterest',
  pinSize = 'standard',
  className,
}: DiscoverMasonryCardProps) {
  const kindMeta = KIND_META[item.kind];
  const badge = (
    <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-semibold text-white', kindMeta.accent)}>
      {kindMeta.label}
    </span>
  );
  const recommendBadge = (
    <DiscoverRecommendBadge
      score={recommendScore}
      reasons={recommendReasons}
      interactive
    />
  );

  const usePin = layout === 'pinterest';
  const aspectClass = getDiscoverPinAspectClass(pinSize);

  const render = (
    shell: (props: {
      href: string;
      coverUrl: string;
      coverAlt: string;
      title: string;
      subtitle: string;
      meta: string;
      tall?: boolean;
    }) => ReactNode,
  ) => {
    if (item.kind === 'guide') {
      const guide = demoGuides.find((entry) => entry.id === item.guideId);
      if (!guide) {
        return null;
      }
      return shell({
        href: guideDetailPath(guide.id),
        coverUrl: getGuideCoverUrl(guide),
        coverAlt: getGuideCoverAlt(guide),
        title: guide.title,
        subtitle: `${guide.city} · ${guide.budget}`,
        meta: `${guide.days} · ${formatRelativeZh(guide.updatedAt)}`,
        tall: guide.tags.includes('摄影') || guide.tags.includes('自然'),
      });
    }

    if (item.kind === 'plan') {
      const plan = findTravelPlanById(item.planId);
      if (!plan) {
        return null;
      }
      return shell({
        href: travelPlanDetailPath(plan.id),
        coverUrl: getPlanCoverImage(plan),
        coverAlt: getTravelPlanCoverAlt(plan),
        title: plan.title,
        subtitle: `${getPlanDestination(plan)} · ${getPlanBudgetLabel(plan)}`,
        meta: `${getPlanDaysLabel(plan)} · ${formatRelativeZh(item.updatedAt)}`,
      });
    }

    if (item.kind === 'savedPlan') {
      return shell({
        href: savedUserPlanDetailPath(item.userPlanId),
        coverUrl: getSavedUserPlanCoverUrl(item.userPlanId, item.locationName),
        coverAlt: `${item.title} 封面`,
        title: item.title,
        subtitle: `${item.locationName} · 蜗友公开方案`,
        meta: formatRelativeZh(item.updatedAt),
      });
    }

    const user = findUserById(item.authorId);
    const moment = user?.travelMoments.find((entry) => entry.id === item.momentId);
    if (!moment || !user) {
      return null;
    }

    const momentTitle = moment.title ?? getMomentDescription(moment);

    return shell({
      href: userProfilePath(user.id),
      coverUrl: getMomentCoverUrl(moment),
      coverAlt: getMomentImageAlt(moment),
      title: momentTitle,
      subtitle: `${user.username}${moment.location ? ` · ${moment.location}` : ''}`,
      meta: `${moment.likeCount} 赞 · ${formatRelativeZh(moment.createdAt)}`,
      tall: Boolean(moment.imageUrls && moment.imageUrls.length > 1),
    });
  };

  return render(({ href, coverUrl, coverAlt, title, subtitle, meta, tall }) => {
    if (usePin) {
      return (
        <PinShell
          href={href}
          coverUrl={coverUrl}
          coverAlt={coverAlt}
          badge={badge}
          recommendBadge={recommendBadge}
          title={title}
          subtitle={subtitle}
          meta={meta}
          aspectClass={tall && pinSize !== 'compact' ? getDiscoverPinAspectClass('tall') : aspectClass}
          className={className}
        />
      );
    }

    return (
      <CardShell
        href={href}
        coverUrl={coverUrl}
        coverAlt={coverAlt}
        badge={badge}
        recommendBadge={recommendBadge}
        title={title}
        subtitle={subtitle}
        meta={meta}
        tall={tall}
        className={className}
      />
    );
  });
}

function areDiscoverMasonryCardPropsEqual(
  prev: DiscoverMasonryCardProps,
  next: DiscoverMasonryCardProps,
): boolean {
  return (
    prev.item === next.item &&
    prev.recommendScore === next.recommendScore &&
    prev.recommendReasons === next.recommendReasons &&
    prev.layout === next.layout &&
    prev.pinSize === next.pinSize &&
    prev.className === next.className
  );
}

export default memo(DiscoverMasonryCard, areDiscoverMasonryCardPropsEqual);
