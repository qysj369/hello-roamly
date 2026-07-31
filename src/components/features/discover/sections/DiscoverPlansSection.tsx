import { MapPinned } from 'lucide-react';
import DiscoverGridSection from '@/components/features/discover/DiscoverGridSection';
import DiscoverMasonryItemGrid from '@/components/features/discover/DiscoverMasonryItemGrid';
import type { RecommendedDiscoverItem } from '@/types/domain/discover';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { paths } from '@/router/paths';

type DiscoverPlansSectionProps = {
  plans: RecommendedDiscoverItem[];
  sortHint?: string;
};

export default function DiscoverPlansSection({ plans, sortHint }: DiscoverPlansSectionProps) {
  return (
    <DiscoverGridSection
      id="discover-grid-plans"
      title="旅行计划"
      subtitle="AI 穷游行程 · 预算与路线一目了然"
      icon={MapPinned}
      href={paths.guides}
      count={plans.length}
      sortHint={sortHint}
    >
      <DiscoverMasonryItemGrid
        items={plans}
        emptyMessage={SNAIL_GLOBAL_COPY.emptyState}
        gridClassName="grid-cols-1 sm:grid-cols-2"
      />
    </DiscoverGridSection>
  );
}
