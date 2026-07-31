import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { DISCOVER_CHINA_CITIES } from '@/data/discoverChinaCities';
import { cn } from '@/utils/cn';

export const DISCOVER_CITY_PREVIEW_COUNT = 16;

export type DiscoverChinaCityPickerProps = {
  activeDestination: string;
  onSelect: (destination: string) => void;
  className?: string;
  /** 嵌入筛选面板时可开启城市名搜索 */
  searchable?: boolean;
  /** 默认折叠时展示的城市数量；0 表示始终全部展示 */
  previewCount?: number;
};

function buildVisibleCities(
  cities: readonly string[],
  previewCount: number,
  expanded: boolean,
  isSearching: boolean,
  activeDestination: string,
): readonly string[] {
  if (previewCount <= 0 || expanded || isSearching) {
    return cities;
  }

  const preview = cities.slice(0, previewCount);
  if (
    activeDestination &&
    cities.includes(activeDestination) &&
    !preview.includes(activeDestination)
  ) {
    return [...preview, activeDestination];
  }

  return preview;
}

export default function DiscoverChinaCityPicker({
  activeDestination,
  onSelect,
  className,
  searchable = false,
  previewCount = DISCOVER_CITY_PREVIEW_COUNT,
}: DiscoverChinaCityPickerProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const isSearching = query.trim().length > 0;

  const cities = useMemo(() => {
    const normalized = query.trim();
    if (!normalized) {
      return DISCOVER_CHINA_CITIES;
    }
    return DISCOVER_CHINA_CITIES.filter((city) => city.includes(normalized));
  }, [query]);

  const visibleCities = useMemo(
    () => buildVisibleCities(cities, previewCount, expanded, isSearching, activeDestination),
    [cities, previewCount, expanded, isSearching, activeDestination],
  );

  const hiddenCount = Math.max(0, cities.length - visibleCities.length);
  const canCollapse = previewCount > 0 && !isSearching && hiddenCount > 0;

  return (
    <div className={cn('space-y-2', className)}>
      {searchable ? (
        <label className="relative block">
          <span className="sr-only">搜索城市</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索中国城市…"
            className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </label>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelect('')}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-medium transition',
            !activeDestination
              ? 'border-violet-600 bg-violet-600 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200',
          )}
          aria-pressed={!activeDestination}
        >
          全部
        </button>
        {visibleCities.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => onSelect(activeDestination === city ? '' : city)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition',
              activeDestination === city
                ? 'border-violet-600 bg-violet-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50/40',
            )}
            aria-pressed={activeDestination === city}
          >
            {city}
          </button>
        ))}
      </div>

      {canCollapse ? (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              收起
              <ChevronUp className="h-3.5 w-3.5" aria-hidden />
            </>
          ) : (
            <>
              更多 {hiddenCount} 个城市
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            </>
          )}
        </button>
      ) : null}

      {searchable && cities.length === 0 ? (
        <p className="text-xs text-slate-500">没有匹配的城市，试试别的关键词</p>
      ) : null}
    </div>
  );
}
