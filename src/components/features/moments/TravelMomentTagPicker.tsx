import { Hash, Plus, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { TRAVEL_MOMENT_TAG_PRESETS } from '@/data/travelMomentTags';
import {
  addCustomTag,
  isPresetTag,
  toggleTagSelection,
  TRAVEL_MOMENT_TAG_LIMITS,
} from '@/utils/travelMomentTags';
import { cn } from '@/utils/cn';

export type TravelMomentTagPickerProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  className?: string;
};

export default function TravelMomentTagPicker({ value, onChange, className }: TravelMomentTagPickerProps) {
  const [customDraft, setCustomDraft] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);

  const handleTogglePreset = useCallback(
    (tag: string) => {
      setTagError(null);
      onChange(toggleTagSelection(value, tag));
    },
    [onChange, value],
  );

  const handleAddCustom = useCallback(() => {
    const result = addCustomTag(value, customDraft);
    onChange(result.tags);
    if (result.error) {
      setTagError(result.error);
      return;
    }
    setTagError(null);
    setCustomDraft('');
  }, [customDraft, onChange, value]);

  const handleCustomKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleAddCustom();
      }
    },
    [handleAddCustom],
  );

  const handleRemove = useCallback(
    (tag: string) => {
      onChange(value.filter((item) => item !== tag));
      setTagError(null);
    },
    [onChange, value],
  );

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-slate-600" htmlFor="moment-custom-tag">
          标签
        </label>
        <span className="text-[10px] text-slate-400">
          {value.length}/{TRAVEL_MOMENT_TAG_LIMITS.maxTags}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="推荐标签">
        {TRAVEL_MOMENT_TAG_PRESETS.map((tag) => {
          const selected = value.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleTogglePreset(tag)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium transition',
                selected
                  ? 'border-violet-600 bg-violet-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200',
              )}
              aria-pressed={selected}
            >
              #{tag}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Hash
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            id="moment-custom-tag"
            type="text"
            value={customDraft}
            onChange={(event) => setCustomDraft(event.target.value)}
            onKeyDown={handleCustomKeyDown}
            placeholder="自定义标签，回车添加"
            maxLength={TRAVEL_MOMENT_TAG_LIMITS.maxTagLength}
            className="block w-full rounded-xl border border-slate-200 py-2 pl-8 pr-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>
        <button
          type="button"
          onClick={handleAddCustom}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-violet-200"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          添加
        </button>
      </div>

      {tagError && (
        <p className="text-xs text-rose-600" role="status">
          {tagError}
        </p>
      )}

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="已选标签">
          {value.map((tag) => (
            <li key={tag}>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                  isPresetTag(tag)
                    ? 'border-violet-200 bg-violet-50 text-violet-800'
                    : 'border-cyan-200 bg-cyan-50 text-cyan-800',
                )}
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemove(tag)}
                  className="rounded-full p-0.5 hover:bg-black/10"
                  aria-label={`移除标签 ${tag}`}
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
