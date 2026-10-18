import { Image as ImageIcon, QrCode } from 'lucide-react';
import { cn } from '@/utils/cn';

export type SharePosterHintBarProps = {
  hint: string;
  isXhs: boolean;
  isDouyin?: boolean;
  tone?: 'default' | 'brand';
};

export default function SharePosterHintBar({
  hint,
  isXhs,
  isDouyin = false,
  tone = 'default',
}: SharePosterHintBarProps) {
  const brand = tone === 'brand';
  const platformSave = isXhs || isDouyin;
  const Icon = platformSave ? ImageIcon : QrCode;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs',
        brand
          ? 'border-[color-mix(in_srgb,var(--color-main)_22%,var(--theme-line))] bg-[color-mix(in_srgb,var(--color-main)_8%,var(--theme-surface))] text-[var(--color-main)]'
          : platformSave
            ? 'border-rose-100 bg-rose-50/90 text-rose-900'
            : 'border-violet-100 bg-violet-50/80 text-violet-900',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {hint}
    </div>
  );
}
