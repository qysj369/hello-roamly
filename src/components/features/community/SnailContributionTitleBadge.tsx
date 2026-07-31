import {
  formatContributionTitleLabel,
  resolveContributionTitle,
} from '@/utils/contributionScore';
import { cn } from '@/utils/cn';

type SnailContributionTitleBadgeProps = {
  score: number;
  showScore?: boolean;
  className?: string;
};

/** 贡献分称号 — 显示在头像旁 */
export default function SnailContributionTitleBadge({
  score,
  showScore = false,
  className,
}: SnailContributionTitleBadgeProps) {
  const tier = resolveContributionTitle(score);
  const label = formatContributionTitleLabel(tier, { withScore: showScore, score });

  return (
    <span
      className={cn(
        'inline-flex max-w-[10rem] items-center justify-center rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold leading-tight text-emerald-800 shadow-sm ring-1 ring-emerald-200/90',
        className,
      )}
      title={`贡献分 ${score} · ${tier.title}`}
    >
      {label}
    </span>
  );
}
