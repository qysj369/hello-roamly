import { cn } from '@/utils/cn';

export type DiscoverFilterOption<T extends string> = {
  value: T;
  label: string;
};

export type DiscoverFilterChipsProps<T extends string> = {
  label: string;
  value: T;
  options: DiscoverFilterOption<T>[];
  onChange: (value: T) => void;
  className?: string;
};

export default function DiscoverFilterChips<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: DiscoverFilterChipsProps<T>) {
  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className="mb-2 text-sm font-medium text-slate-600 sm:mb-1.5 sm:text-xs">{label}</legend>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:pb-0.5">
        {options.map((option) => (
          <button
            key={option.value || `all-${label}`}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition sm:px-3 sm:py-1 sm:text-xs',
              value === option.value
                ? 'border-violet-600 bg-violet-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200',
            )}
            aria-pressed={value === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
