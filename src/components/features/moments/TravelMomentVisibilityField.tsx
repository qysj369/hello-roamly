import type { TravelMomentVisibility } from '@/types/domain/user/userSocial';
import { TRAVEL_MOMENT_VISIBILITY_OPTIONS } from '@/utils/travelMomentVisibility';
import { cn } from '@/utils/cn';

export type TravelMomentVisibilityFieldProps = {
  visibility: TravelMomentVisibility;
  onChange: (value: TravelMomentVisibility) => void;
};

export default function TravelMomentVisibilityField({
  visibility,
  onChange,
}: TravelMomentVisibilityFieldProps) {
  return (
    <fieldset className="mt-4">
      <legend className="text-xs font-medium text-slate-600">可见范围</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {TRAVEL_MOMENT_VISIBILITY_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={cn(
              'cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition',
              visibility === option.value
                ? 'border-violet-600 bg-violet-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200',
            )}
          >
            <input
              type="radio"
              name="moment-visibility"
              value={option.value}
              checked={visibility === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500">
        {TRAVEL_MOMENT_VISIBILITY_OPTIONS.find((option) => option.value === visibility)?.hint}
      </p>
    </fieldset>
  );
}
