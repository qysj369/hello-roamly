import { useMemo, useState } from 'react';
import {
  TRAVEL_BUDDY_BUDGET_OPTIONS,
  TRAVEL_BUDDY_TAG_OPTIONS,
} from '@/lib/config/travelBuddy';
import { createTravelBuddyPostSchema } from '@/schemas/travelBuddy';
import type { CreateTravelBuddyPostInput } from '@/types/domain/travelBuddy';
import { defaultTravelBuddyStartDate } from '@/utils/travelBuddy';
import { cn } from '@/utils/cn';

export type TravelBuddyPublishFormProps = {
  initialDestination?: string;
  onSubmit: (payload: CreateTravelBuddyPostInput) => Promise<void> | void;
  isSubmitting?: boolean;
};

export default function TravelBuddyPublishForm({
  initialDestination = '',
  onSubmit,
  isSubmitting = false,
}: TravelBuddyPublishFormProps) {
  const [destination, setDestination] = useState(initialDestination);
  const [startDate, setStartDate] = useState(defaultTravelBuddyStartDate(3));
  const [budgetRange, setBudgetRange] =
    useState<CreateTravelBuddyPostInput['budgetRange']>('500_1000');
  const [tags, setTags] = useState<CreateTravelBuddyPostInput['tags']>([]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function toggleTag(value: CreateTravelBuddyPostInput['tags'][number]) {
    setTags((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const payload = {
      destination: destination.trim(),
      startDate,
      budgetRange,
      tags,
      description: description.trim() || undefined,
    };
    const parsed = createTravelBuddyPostSchema.safeParse(payload);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      setError(first ?? '请检查表单');
      return;
    }
    await onSubmit(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="buddy-destination" className="text-sm font-semibold text-slate-800">
          目的地 / 路线 <span className="text-red-500">*</span>
        </label>
        <input
          id="buddy-destination"
          type="text"
          required
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          placeholder="如：西安三天、大理洱海环线"
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div>
        <label htmlFor="buddy-start-date" className="text-sm font-semibold text-slate-800">
          出发日期 <span className="text-red-500">*</span>
        </label>
        <input
          id="buddy-start-date"
          type="date"
          required
          min={minDate}
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-800">
          大致人均预算 <span className="text-red-500">*</span>
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TRAVEL_BUDDY_BUDGET_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                'cursor-pointer rounded-xl border px-3 py-2.5 text-center text-xs font-medium',
                budgetRange === option.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
              )}
            >
              <input
                type="radio"
                name="budgetRange"
                value={option.value}
                checked={budgetRange === option.value}
                onChange={() => setBudgetRange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-800">
          结伴需求 <span className="text-red-500">*</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {TRAVEL_BUDDY_TAG_OPTIONS.map((option) => {
            const active = tags.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleTag(option.value)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium',
                  active
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="buddy-description" className="text-sm font-semibold text-slate-800">
          我的情况 / 要求
        </label>
        <textarea
          id="buddy-description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="如：本人男生，会开车，求拼房分摊"
          className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {isSubmitting ? '发布中…' : '发布需求'}
      </button>
    </form>
  );
}
