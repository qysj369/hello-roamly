import { cn } from '@/utils/cn';

type HomeHeroLiveStatProps = {
  label: string;
  value: number;
  hint: string;
  accent?: 'cyan' | 'violet';
  className?: string;
};

export default function HomeHeroLiveStat({
  label,
  value,
  hint,
  accent = 'cyan',
  className,
}: HomeHeroLiveStatProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-left backdrop-blur-sm',
        className,
      )}
    >
      <dt className="font-mono text-[10px] uppercase tracking-wider text-indigo-200/80">{label}</dt>
      <dd
        className={cn(
          'mt-0.5 text-lg font-semibold tabular-nums tracking-tight',
          accent === 'cyan' ? 'text-cyan-300' : 'text-violet-200',
        )}
        aria-live="polite"
      >
        {value}
      </dd>
      <p className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-indigo-200/70">{hint}</p>
    </div>
  );
}
