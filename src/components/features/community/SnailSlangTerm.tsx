import type { SnailSlangEntry } from '@/lib/config/snailCommunity';
import { getSnailSlangById, getSnailSlangByTerm } from '@/utils/snailCommunity';
import { cn } from '@/utils/cn';

type SnailSlangTermProps = {
  /** 词典 id，如 slime-trail */
  id?: string;
  /** 或直接传词条名 */
  term?: string;
  entry?: SnailSlangEntry;
  className?: string;
};

function buildTooltip(entry: SnailSlangEntry): string {
  const lines = [entry.meaning];
  if (entry.example) {
    lines.push(`例：${entry.example}`);
  }
  return lines.join('\n');
}

/** 站内黑话词条 — 虚线下划线，悬停显示释义 */
export default function SnailSlangTerm({ id, term, entry: entryProp, className }: SnailSlangTermProps) {
  const entry =
    entryProp ?? (id ? getSnailSlangById(id) : term ? getSnailSlangByTerm(term) : undefined);

  if (!entry) {
    return <span className={className}>{term ?? id}</span>;
  }

  return (
    <abbr
      title={buildTooltip(entry)}
      className={cn(
        'cursor-help border-b border-dotted border-emerald-400/80 font-medium text-emerald-800 no-underline',
        className,
      )}
    >
      {entry.term}
    </abbr>
  );
}
