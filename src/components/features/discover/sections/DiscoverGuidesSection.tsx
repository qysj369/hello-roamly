import { BookOpen } from 'lucide-react';
import DiscoverGridSection from '@/components/features/discover/DiscoverGridSection';
import DiscoverMasonryItemGrid from '@/components/features/discover/DiscoverMasonryItemGrid';
import type { RecommendedDiscoverItem } from '@/types/domain/discover';
import { SNAIL_GLOBAL_COPY } from '@/lib/config/snailCommunity';
import { paths } from '@/router/paths';

type DiscoverGuidesSectionProps = {
  visibleGuides: RecommendedDiscoverItem[];
  guidesTotal: number;
  guidesPreviewMode: boolean;
  sortHint?: string;
};

export default function DiscoverGuidesSection({
  visibleGuides,
  guidesTotal,
  guidesPreviewMode,
  sortHint,
}: DiscoverGuidesSectionProps) {
  return (
    <DiscoverGridSection
      id="discover-grid-guides"
      title={guidesPreviewMode ? '精选攻略' : '漫行攻略'}
      subtitle={
        guidesPreviewMode
          ? '根据兴趣为你挑选 · 查看更多完整列表'
          : '路线模板 · 省钱吃住玩'
      }
      icon={BookOpen}
      href={paths.guides}
      linkLabel={guidesPreviewMode ? '全部攻略' : '查看更多'}
      count={guidesPreviewMode ? guidesTotal : visibleGuides.length}
      sortHint={sortHint}
    >
      <DiscoverMasonryItemGrid
        items={visibleGuides}
        emptyMessage={SNAIL_GLOBAL_COPY.emptyState}
        gridClassName="grid-cols-1 sm:grid-cols-2"
      />
    </DiscoverGridSection>
  );
}
