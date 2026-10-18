import { MapPinned } from 'lucide-react';
import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { findTravelPlanById } from '@/data/findTravelPlan';
import { TravelPlanCard } from '@/components/features/plans';
import type { DiscoverFeedItem } from '@/types/domain/discover';
import { paths } from '@/router/paths';

type PlanFeedEntry = {
  feedId: string;
  plan: NonNullable<ReturnType<typeof findTravelPlanById>>;
};

type DiscoverPlanCardsSectionProps = {
  items: DiscoverFeedItem[];
  showSectionTitle?: boolean;
};

function FeedSectionTitle({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
        <MapPinned className="h-4 w-4 text-[#2c6b58]" aria-hidden />
        {title}
      </h2>
      {href && (
        <Link to={href} className="text-xs font-medium text-[#2c6b58] hover:underline">
          查看全部
        </Link>
      )}
    </div>
  );
}

/** 发现页旅行计划列表：useMemo 解析 + memo 卡片，避免父级筛选状态牵连未变项 */
function DiscoverPlanCardsSection({ items, showSectionTitle = true }: DiscoverPlanCardsSectionProps) {
  const planEntries = useMemo(() => {
    const entries: PlanFeedEntry[] = [];
    for (const item of items) {
      if (item.kind !== 'plan') {
        continue;
      }
      const plan = findTravelPlanById(item.planId);
      if (plan) {
        entries.push({ feedId: item.id, plan });
      }
    }
    return entries;
  }, [items]);

  if (planEntries.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      {showSectionTitle && <FeedSectionTitle title="旅行计划" href={paths.guides} />}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {planEntries.map(({ feedId, plan }) => (
          <li key={feedId}>
            <TravelPlanCard plan={plan} showInteractions />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default memo(DiscoverPlanCardsSection);
