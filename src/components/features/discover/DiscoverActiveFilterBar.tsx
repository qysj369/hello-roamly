import { X } from 'lucide-react';
import type { DiscoverFilters } from '@/types/domain/discover';
import {
  DISCOVER_CONTENT_TYPES,
  DISCOVER_TIME_RANGES,
  DISCOVER_TRAVEL_TYPES,
} from '@/data/discoverOptions';
import type { TravelInterest } from '@/types/domain/aiTravelParams';
import type { DiscoverContentType, DiscoverTimeRange } from '@/types/domain/discover';
import { cn } from '@/utils/cn';

type DiscoverActiveFilterBarProps = {
  filters: DiscoverFilters;
  onClearDestination: () => void;
  onClearQuery: () => void;
  onClearTravelType: () => void;
  onClearTimeRange: () => void;
  onClearContentType: () => void;
  onReset: () => void;
  className?: string;
};

function labelForTravelType(value: TravelInterest | '') {
  return DISCOVER_TRAVEL_TYPES.find((item) => item.value === value)?.label;
}

function labelForContentType(value: DiscoverContentType) {
  return DISCOVER_CONTENT_TYPES.find((item) => item.value === value)?.label;
}

function labelForTimeRange(value: DiscoverTimeRange) {
  return DISCOVER_TIME_RANGES.find((item) => item.value === value)?.label;
}

export default function DiscoverActiveFilterBar({
  filters,
  onClearDestination,
  onClearQuery,
  onClearTravelType,
  onClearTimeRange,
  onClearContentType,
  onReset,
  className,
}: DiscoverActiveFilterBarProps) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.destination) {
    chips.push({
      key: 'destination',
      label: filters.destination,
      onRemove: onClearDestination,
    });
  }
  if (filters.q.trim()) {
    chips.push({
      key: 'query',
      label: filters.q.trim(),
      onRemove: onClearQuery,
    });
  }
  if (filters.travelType) {
    chips.push({
      key: 'travelType',
      label: labelForTravelType(filters.travelType) ?? filters.travelType,
      onRemove: onClearTravelType,
    });
  }
  if (filters.timeRange !== 'all') {
    chips.push({
      key: 'timeRange',
      label: labelForTimeRange(filters.timeRange) ?? filters.timeRange,
      onRemove: onClearTimeRange,
    });
  }
  if (filters.contentType !== 'all') {
    chips.push({
      key: 'contentType',
      label: labelForContentType(filters.contentType) ?? filters.contentType,
      onRemove: onClearContentType,
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-xl border border-[#b7cdc4] bg-emerald-50/60 px-3 py-2',
        className,
      )}
      aria-label="当前筛选"
    >
      <span className="text-xs font-medium text-[#2c6b58]">已选</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 rounded-full border border-[#b7cdc4] bg-white px-2.5 py-1 text-xs font-medium text-[#2c6b58] hover:bg-emerald-50"
        >
          {chip.label}
          <X className="h-3 w-3 opacity-70" aria-hidden />
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="ml-auto text-xs font-semibold text-[#2c6b58] hover:underline"
      >
        全部清除
      </button>
    </div>
  );
}
