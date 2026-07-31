import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  AI_CHAT_FEATURED_CITIES,
  AI_CHAT_MORE_CITIES,
  buildHotCityPlanPrompt,
  type AiChatHotCity,
} from '@/data/aiChatHotCities';
import type { AiTravelParams } from '@/types/domain/aiTravelParams';
import { cn } from '@/utils/cn';

type AIChatHotCityPickerProps = {
  travelParams: AiTravelParams;
  disabled?: boolean;
  variant?: 'default' | 'capsule';
  onSelectCity: (prompt: string) => void;
};

function CityChip({
  city,
  disabled,
  variant = 'default',
  onClick,
}: {
  city: AiChatHotCity;
  disabled?: boolean;
  variant?: 'default' | 'capsule';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={`快捷规划：${city.name}`}
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-2.5 py-1.5 text-[10px] font-medium transition',
        variant === 'capsule'
          ? 'border-cyan-500/35 bg-cyan-500/8 text-cyan-100/88 hover:border-cyan-400/55 hover:bg-cyan-400/12 hover:text-cyan-50'
          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700',
        'disabled:pointer-events-none disabled:opacity-50',
      )}
    >
      {city.name}
    </button>
  );
}

export default function AIChatHotCityPicker({
  travelParams,
  disabled = false,
  variant = 'default',
  onSelectCity,
}: AIChatHotCityPickerProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const sendCity = useMemo(
    () => (cityName: string) => {
      onSelectCity(buildHotCityPlanPrompt(cityName, travelParams));
    },
    [onSelectCity, travelParams],
  );

  return (
    <div className="mb-2" role="region" aria-label="热门城市快捷规划">
      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {AI_CHAT_FEATURED_CITIES.map((city) => (
          <CityChip
            key={city.id}
            city={city}
            variant={variant}
            disabled={disabled}
            onClick={() => sendCity(city.name)}
          />
        ))}
        <button
          type="button"
          disabled={disabled}
          aria-expanded={moreOpen}
          aria-label={moreOpen ? '收起更多城市' : '展开更多城市'}
          onClick={() => setMoreOpen((open) => !open)}
          className={cn(
            'inline-flex shrink-0 items-center gap-0.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold',
            variant === 'capsule'
              ? moreOpen
                ? 'border-cyan-400/55 bg-cyan-400/12 text-cyan-50'
                : 'border-cyan-500/40 bg-cyan-500/8 text-cyan-100/88 hover:border-cyan-400/55 hover:bg-cyan-400/12'
              : moreOpen
                ? 'border-brand-300 bg-brand-50 text-brand-700'
                : 'border-slate-300 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          {moreOpen ? '收起' : `更多 ${AI_CHAT_MORE_CITIES.length}`}
          <ChevronDown
            className={cn('h-3 w-3 transition-transform', moreOpen && 'rotate-180')}
            aria-hidden
          />
        </button>
      </div>

      {moreOpen ? (
        <div
          className={cn(
            'mt-2 max-h-36 overflow-y-auto rounded-xl border p-2 [-webkit-overflow-scrolling:touch]',
            variant === 'capsule'
              ? 'border-cyan-500/25 bg-cyan-500/6'
              : 'border-slate-200/90 bg-slate-50/80',
          )}
        >
          <div className="flex flex-wrap gap-1.5">
            {AI_CHAT_MORE_CITIES.map((city) => (
              <CityChip
                key={city.id}
                city={city}
                variant={variant}
                disabled={disabled}
                onClick={() => sendCity(city.name)}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
