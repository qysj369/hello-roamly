import { ChevronDown, RotateCcw, X } from 'lucide-react';
import type { DiscoverFilters } from '@/types/domain/discover';
import {
  DISCOVER_CONTENT_TYPES,
  DISCOVER_TIME_RANGES,
  DISCOVER_TRAVEL_TYPES,
} from '@/data/discoverOptions';
import type { TravelInterest } from '@/types/domain/aiTravelParams';
import type { DiscoverContentType, DiscoverTimeRange } from '@/types/domain/discover';
import { cn } from '@/utils/cn';

type DiscoverFilterStatusProps = {
  filters: DiscoverFilters;
  total: number;
  onClearDestination: () => void;
  onClearQuery: () => void;
  onClearTravelType: () => void;
  onClearTimeRange: () => void;
  onClearContentType: () => void;
  onReset: () => void;
  onJumpToFeed: () => void;
  onRelax?: () => void;
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

export default function DiscoverFilterStatus({
  filters,
  total,
  onClearDestination,
  onClearQuery,
  onClearTravelType,
  onClearTimeRange,
  onClearContentType,
  onReset,
  onJumpToFeed,
  onRelax,
  className,
}: DiscoverFilterStatusProps) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.destination) {
    chips.push({ key: 'destination', label: filters.destination, onRemove: onClearDestination });
  }
  if (filters.q.trim()) {
    chips.push({ key: 'query', label: filters.q.trim(), onRemove: onClearQuery });
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

  return (
    <div
      className={cn(
        'space-y-2 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50/70 px-4 py-3 shadow-sm',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-violet-900">
          {total > 0 ? `已找到 ${total} 条旅行灵感` : '这组条件暂时没有内容'}
        </p>
        <div className="flex shrink-0 gap-2">
          {total > 0 ? (
            <button
              type="button"
              onClick={onJumpToFeed}
              className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
            >
              往下看
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : onRelax ? (
            <button
              type="button"
              onClick={onRelax}
              className="rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
            >
              换一组条件
            </button>
          ) : null}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-full border border-violet-300 bg-white px-3 py-1.5 text-xs font-semibold text-violet-800 hover:bg-violet-100"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
            重置
          </button>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-violet-900 hover:bg-white"
            >
              {chip.label}
              <X className="h-3 w-3 opacity-60" aria-hidden />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
