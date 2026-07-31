import { Sparkles } from 'lucide-react';
import DiscoverGridSection from '@/components/features/discover/DiscoverGridSection';
import DiscoverMasonryItemGrid from '@/components/features/discover/DiscoverMasonryItemGrid';
import type { RecommendedDiscoverItem } from '@/types/domain/discover';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { paths } from '@/router/paths';

type DiscoverMomentsSectionProps = {
  moments: RecommendedDiscoverItem[];
  sortHint?: string;
};

export default function DiscoverMomentsSection({ moments, sortHint }: DiscoverMomentsSectionProps) {
  return (
    <DiscoverGridSection
      id="discover-grid-moments"
      title="旅行瞬间"
      subtitle="蜗友实拍 · 美食风景与地图足迹"
      icon={Sparkles}
      href={paths.profile}
      linkLabel="去发布瞬间"
      count={moments.length}
      sortHint={sortHint}
    >
      <DiscoverMasonryItemGrid
        items={moments}
        emptyMessage={SNAIL_GLOBAL_COPY.emptyState}
        gridClassName="grid-cols-2 md:grid-cols-3"
      />
    </DiscoverGridSection>
  );
}
