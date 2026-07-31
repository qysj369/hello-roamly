import { Link } from 'react-router-dom';
import { SNAIL_COMMUNITY, SNAIL_UI_COPY } from '@/lib/config/snailCommunity';
import { paths } from '@/router/paths';
import { cn } from '@/utils/cn';

type SnailCultureHintProps = {
  message?: string;
  className?: string;
};

/** 轻量提示 — 链至蜗牛黑话手册 */
export default function SnailCultureHint({
  message = SNAIL_UI_COPY.guideDetailGlossaryHint,
  className,
}: SnailCultureHintProps) {
  return (
    <p className={cn('text-center text-xs text-slate-500', className)}>
      {message}
      <Link
        to={paths.snailCulture}
        className="ml-1 font-medium text-emerald-700 underline-offset-2 hover:underline"
      >
        {SNAIL_COMMUNITY.glossaryTitle}
      </Link>
    </p>
  );
}
