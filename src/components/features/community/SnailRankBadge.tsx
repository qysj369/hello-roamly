import type { SnailRank } from '@/lib/config/snailCommunity';
import { formatSnailRankLabel } from '@/utils/snailCommunity';
import { cn } from '@/utils/cn';

type SnailRankBadgeProps = {
  rank: SnailRank;
  showDescription?: boolean;
  className?: string;
};

/** 蜗阶称号徽章 */
export default function SnailRankBadge({
  rank,
  showDescription = false,
  className,
}: SnailRankBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80',
        className,
      )}
      title={rank.description}
    >
      {formatSnailRankLabel(rank)}
      {showDescription && (
        <span className="font-normal text-emerald-700/80">· {rank.description}</span>
      )}
    </span>
  );
}
