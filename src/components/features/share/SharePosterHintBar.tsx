import { QrCode } from 'lucide-react';
import { cn } from '@/utils/cn';

export type SharePosterHintBarProps = {
  hint: string;
  isXhs: boolean;
};

export default function SharePosterHintBar({ hint, isXhs }: SharePosterHintBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs',
        isXhs
          ? 'border-rose-100 bg-rose-50/90 text-rose-900'
          : 'border-violet-100 bg-violet-50/80 text-violet-900',
      )}
    >
      <QrCode className="h-4 w-4 shrink-0" aria-hidden />
      {hint}
    </div>
  );
}
