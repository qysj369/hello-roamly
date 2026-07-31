import { BookOpen, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { findUserById } from '@/data/findUserById';
import { demoGuides } from '@/data/demoGuides';
import { GuideCardList } from '@/components/features';
import DiscoverPlanCardsSection from '@/components/features/discover/DiscoverPlanCardsSection';
import TravelMomentCard from '@/components/features/moments/TravelMomentCard';
import type { DiscoverFeedItem } from '@/types/domain/discover';
import { guideDetailPath, paths } from '@/router/paths';
import { cn } from '@/utils/cn';

export type DiscoverContentFeedProps = {
  items: DiscoverFeedItem[];
  className?: string;
};

function FeedSectionTitle({
  icon: Icon,
  title,
  href,
}: {
  icon: typeof BookOpen;
  title: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
        <Icon className="h-4 w-4 text-violet-600" aria-hidden />
        {title}
      </h2>
      {href && (
        <Link to={href} className="text-xs font-medium text-violet-700 hover:underline">
          查看全部
        </Link>
      )}
    </div>
  );
}

export default function DiscoverContentFeed({ items, className }: DiscoverContentFeedProps) {
  if (items.length === 0) {
    return (
      <p
        className={cn(
          'rounded-xl border border-dashed border-slate-200 bg-white py-14 text-center text-sm text-slate-500',
          className,
        )}
      >
        没有匹配的内容，试试调整搜索或筛选条件
      </p>
    );
  }

  const guides = useMemo(() => {
    const guideIds = items
      .filter((item): item is Extract<DiscoverFeedItem, { kind: 'guide' }> => item.kind === 'guide')
      .map((item) => item.guideId);
    return guideIds
      .map((id) => demoGuides.find((guide) => guide.id === id))
      .filter((guide): guide is NonNullable<typeof guide> => guide != null);
  }, [items]);

  const hasPlans = useMemo(() => items.some((item) => item.kind === 'plan'), [items]);
  const hasMoments = useMemo(() => items.some((item) => item.kind === 'moment'), [items]);
  const showMixed = guides.length > 0 && (hasPlans || hasMoments);

  return (
    <div className={cn('space-y-6', className)}>
      {guides.length > 0 && (
        <section className="space-y-3">
          {showMixed && (
            <FeedSectionTitle icon={BookOpen} title="攻略" href={paths.guides} />
          )}
          <GuideCardList
            guides={guides}
            title={showMixed ? '攻略精选' : '推荐攻略'}
            subtitle={
              showMixed
                ? `共 ${guides.length} 条，点击查看详情`
                : '穷游路线与省钱贴士'
            }
          />
        </section>
      )}

      {hasPlans && <DiscoverPlanCardsSection items={items} showSectionTitle={showMixed} />}

      {hasMoments && (
        <section className="space-y-3">
          <FeedSectionTitle icon={Sparkles} title="旅行瞬间" href={paths.profile} />
          <ul className="mx-auto max-w-lg space-y-6">
            {items
              .filter((item): item is Extract<DiscoverFeedItem, { kind: 'moment' }> => item.kind === 'moment')
              .map((item) => {
              const user = findUserById(item.authorId);
              const moment = user?.travelMoments.find((entry) => entry.id === item.momentId);
              if (!moment || !user) {
                return null;
              }
              return (
                <li key={item.id}>
                  <TravelMomentCard
                    moment={moment}
                    author={{
                      userId: user.id,
                      username: user.username,
                      avatar: user.avatar,
                    }}
                    interactive
                  />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {guides.length === 1 && guides[0] && (
        <p className="text-center text-xs text-slate-400">
          <Link to={guideDetailPath(guides[0].id)} className="text-violet-700 hover:underline">
            打开攻略详情
          </Link>
        </p>
      )}
    </div>
  );
}
