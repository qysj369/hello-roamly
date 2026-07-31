import type { SharePosterVariant } from '@/lib/share/xhsPosterTypes';
import { cn } from '@/utils/cn';

export type SharePosterVariantTabsProps = {
  variants: SharePosterVariant[];
  activeVariantId: SharePosterVariant['id'];
  onSelect: (id: SharePosterVariant['id']) => void;
};

export default function SharePosterVariantTabs({
  variants,
  activeVariantId,
  onSelect,
}: SharePosterVariantTabsProps) {
  if (variants.length <= 1) {
    return null;
  }

  return (
    <div
      className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1"
      role="tablist"
      aria-label="海报样式"
    >
      {variants.map((variant) => {
        const selected = variant.id === activeVariantId;
        return (
          <button
            key={variant.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(variant.id)}
            className={cn(
              'flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition',
              selected
                ? variant.id === 'xhs'
                  ? 'bg-[#FF2442] text-white shadow-sm'
                  : 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white',
            )}
          >
            {variant.label}
          </button>
        );
      })}
    </div>
  );
}
