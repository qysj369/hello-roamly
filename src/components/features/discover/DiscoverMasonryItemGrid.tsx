import DiscoverMasonryCard from '@/components/features/discover/DiscoverMasonryCard';
import DiscoverSectionEmptyHint from '@/components/features/discover/DiscoverSectionEmptyHint';
import type { RecommendedDiscoverItem } from '@/types/domain/discover';
import { cn } from '@/utils/cn';

type DiscoverMasonryItemGridProps = {
  items: RecommendedDiscoverItem[];
  emptyMessage: string;
  gridClassName: string;
};

export default function DiscoverMasonryItemGrid({
  items,
  emptyMessage,
  gridClassName,
}: DiscoverMasonryItemGridProps) {
  if (items.length === 0) {
    return <DiscoverSectionEmptyHint message={emptyMessage} />;
  }

  return (
    <ul className={cn('grid gap-3', gridClassName)}>
      {items.map((item) => (
        <li key={item.id}>
          <DiscoverMasonryCard
            item={item}
            recommendScore={item.recommendScore}
            recommendReasons={item.recommendReasons}
          />
        </li>
      ))}
    </ul>
  );
}
