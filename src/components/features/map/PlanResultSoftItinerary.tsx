import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import ChunkedAiChatMarkdown from '@/components/features/map/ChunkedAiChatMarkdown';
import PlanResultSceneImage from '@/components/features/map/PlanResultSceneImage';
import { resolvePlanSpotImage, type PlanSceneImageRef } from '@/data/planSceneImages';
import type { SoftDayBlock, SoftItineraryView, SoftSpotCard } from '@/utils/planResultDisplay';
import { cn } from '@/utils/cn';

type PlanResultSoftItineraryProps = {
  view: SoftItineraryView;
  className?: string;
};

function TransportFold({ spot }: { spot: SoftSpotCard }) {
  const [open, setOpen] = useState(false);
  const hasDetail = Boolean(spot.transportDetail.trim());
  const showShort =
    Boolean(spot.transportShort.trim()) &&
    spot.transportShort.trim() !== spot.feel.trim();

  return (
    <div className="mt-2">
      {showShort ? (
        <p className="text-[13px] leading-relaxed text-slate-600">
          <span className="mr-1 font-medium text-slate-800">出行</span>
          {spot.transportShort}
        </p>
      ) : null}
      {hasDetail ? (
        <div className={showShort ? 'mt-1' : undefined}>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '收起完整出行明细' : '展开完整出行明细'}
            <ChevronDown
              className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
              aria-hidden
            />
          </button>
          {open ? (
            <p className="mt-1.5 rounded-xl bg-slate-50/90 px-3 py-2 text-[12px] leading-relaxed text-slate-500">
              {spot.transportDetail}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SpotCard({
  spot,
  image,
}: {
  spot: SoftSpotCard;
  image: PlanSceneImageRef | null;
}) {
  const showTransport =
    Boolean(spot.transportShort.trim()) &&
    spot.transportShort.trim() !== spot.feel.trim();

  return (
    <article className="space-y-3 rounded-2xl border border-emerald-100/80 bg-white/90 px-3.5 py-3 shadow-sm">
      {image ? <PlanResultSceneImage src={image.src} alt={image.alt} variant="spot" /> : null}
      <div>
        <h4 className="break-words text-sm font-bold text-slate-900">{spot.title}</h4>
        <p className="mt-2 whitespace-normal break-words text-[13px] leading-7 text-slate-600">
          {spot.feel}
        </p>
        {showTransport || spot.transportDetail ? <TransportFold spot={spot} /> : null}
        {spot.tip ? (
          <p className="mt-2 text-[12px] leading-relaxed text-amber-800/90">
            <span className="font-medium">提醒</span> {spot.tip}
          </p>
        ) : null}
      </div>
    </article>
  );
}

/** 一次性分配配图，保证互不重复 */
function buildSpotImageMap(view: SoftItineraryView): Map<string, PlanSceneImageRef> {
  const usedIds = new Set<string>();
  const map = new Map<string, PlanSceneImageRef>();

  for (const day of view.days) {
    let spotIndex = 0;
    for (const scene of day.scenes) {
      for (const spot of scene.spots) {
        const key = `${day.dayLabel}::${spotIndex}::${spot.title}`;
        if (spot.imageSrc) {
          map.set(key, { src: spot.imageSrc, alt: spot.imageAlt || spot.title });
        } else {
          const image = resolvePlanSpotImage(spot.title, {
            dayLabel: day.dayLabel,
            context: `${spot.feel}\n${spot.tip}\n${scene.label}`,
            spotIndex,
            usedIds,
          });
          if (image) map.set(key, image);
        }
        spotIndex += 1;
      }
    }
  }
  return map;
}

function DayBlock({
  day,
  imageMap,
}: {
  day: SoftDayBlock;
  imageMap: Map<string, PlanSceneImageRef>;
}) {
  if (day.fallbackMarkdown) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-bold text-slate-900">{day.dayLabel}</p>
        <ChunkedAiChatMarkdown
          content={day.fallbackMarkdown}
          soft
          className="text-[15px] leading-7 text-slate-600"
        />
      </div>
    );
  }

  let spotIndex = 0;

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-slate-900">{day.dayLabel}</p>
      {day.scenes.map((scene) => (
        <div key={`${day.dayLabel}-${scene.id}`} className="space-y-2">
          <p className="text-[13px] font-semibold text-emerald-800">
            {scene.marker} {scene.label}
          </p>
          <div className="space-y-4">
            {scene.spots.map((spot) => {
              const key = `${day.dayLabel}::${spotIndex}::${spot.title}`;
              const image = imageMap.get(key) ?? null;
              const index = spotIndex;
              spotIndex += 1;
              return (
                <SpotCard
                  key={`${spot.title}-${index}-${spot.feel.slice(0, 12)}`}
                  spot={spot}
                  image={image}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PlanResultSoftItinerary({
  view,
  className,
}: PlanResultSoftItineraryProps) {
  const imageMap = useMemo(() => buildSpotImageMap(view), [view]);

  if (view.fallbackMarkdown) {
    return (
      <ChunkedAiChatMarkdown
        content={view.fallbackMarkdown}
        soft
        className={cn('text-[15px] leading-7 text-slate-600', className)}
      />
    );
  }

  if (view.days.length === 0) return null;

  return (
    <div className={cn('space-y-5', className)}>
      {view.days.map((day) => (
        <DayBlock key={day.dayLabel} day={day} imageMap={imageMap} />
      ))}
    </div>
  );
}
