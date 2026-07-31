import { Loader2 } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export type AIPlanningModalProps = {
  open: boolean;
  anchor: { x: number; y: number };
  locationLabel: string;
  query: string;
  loading?: boolean;
  error?: string | null;
  variant?: 'light' | 'dark';
  onQueryChange: (value: string) => void;
  onGenerate: () => void;
  onCancel: () => void;
};

const MODAL_WIDTH = 288;
const MODAL_HEIGHT = 280;
const OFFSET = 12;
const EDGE_PADDING = 8;

type Box = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const HUD_OBSTACLE_SELECTORS = [
  '.home-map-trail-control',
  '.home-map-trail-strip',
] as const;

function clampToContainer(position: { left: number; top: number }, container: Box): { left: number; top: number } {
  return {
    left: Math.max(
      EDGE_PADDING,
      Math.min(position.left, container.width - MODAL_WIDTH - EDGE_PADDING),
    ),
    top: Math.max(
      EDGE_PADDING,
      Math.min(position.top, container.height - MODAL_HEIGHT - EDGE_PADDING),
    ),
  };
}

function modalBoxAt(position: { left: number; top: number }): Box {
  return {
    left: position.left,
    top: position.top,
    width: MODAL_WIDTH,
    height: MODAL_HEIGHT,
  };
}

function boxesOverlap(a: Box, b: Box, padding = 10): boolean {
  return !(
    a.left + a.width + padding <= b.left ||
    b.left + b.width + padding <= a.left ||
    a.top + a.height + padding <= b.top ||
    b.top + b.height + padding <= a.top
  );
}

function collectHudObstacles(container: HTMLElement): Box[] {
  const containerRect = container.getBoundingClientRect();

  return HUD_OBSTACLE_SELECTORS.flatMap((selector) => {
    const element = container.querySelector(selector);
    if (!(element instanceof HTMLElement)) {
      return [];
    }
    const rect = element.getBoundingClientRect();
    return [
      {
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
      },
    ];
  });
}

function resolveModalPosition(
  anchor: { x: number; y: number },
  container: Box,
  obstacles: Box[],
): { left: number; top: number } {
  const candidates = [
    { left: anchor.x + OFFSET, top: anchor.y + OFFSET },
    { left: anchor.x - MODAL_WIDTH - OFFSET, top: anchor.y + OFFSET },
    { left: anchor.x + OFFSET, top: anchor.y - MODAL_HEIGHT - OFFSET },
    { left: anchor.x - MODAL_WIDTH - OFFSET, top: anchor.y - MODAL_HEIGHT - OFFSET },
    { left: container.width - MODAL_WIDTH - 24, top: container.height * 0.34 },
    { left: (container.width - MODAL_WIDTH) / 2, top: container.height * 0.34 },
    { left: 24, top: container.height - MODAL_HEIGHT - 24 },
  ];

  for (const candidate of candidates) {
    const clamped = clampToContainer(candidate, container);
    const modal = modalBoxAt(clamped);
    if (!obstacles.some((obstacle) => boxesOverlap(modal, obstacle))) {
      return clamped;
    }
  }

  return clampToContainer(
    { left: (container.width - MODAL_WIDTH) / 2, top: container.height * 0.34 },
    container,
  );
}

/** 地图点击后出现的 AI 规划浮窗 */
export default function AIPlanningModal({
  open,
  anchor,
  locationLabel,
  query,
  loading = false,
  error = null,
  variant = 'light',
  onQueryChange,
  onGenerate,
  onCancel,
}: AIPlanningModalProps) {
  const titleId = useId();
  const [position, setPosition] = useState({ left: anchor.x, top: anchor.y });
  const isDark = variant === 'dark';

  useEffect(() => {
    if (!open) {
      return;
    }

    const container = document.querySelector('[data-map-planning-root]');
    if (!(container instanceof HTMLElement)) {
      setPosition({ left: anchor.x + OFFSET, top: anchor.y + OFFSET });
      return;
    }

    const rect = container.getBoundingClientRect();
    const containerBox: Box = { left: 0, top: 0, width: rect.width, height: rect.height };
    const obstacles = collectHudObstacles(container);

    setPosition(resolveModalPosition(anchor, containerBox, obstacles));
  }, [anchor.x, anchor.y, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="关闭规划浮窗"
        className={cn(
          'absolute inset-0 z-[45]',
          isDark ? 'bg-slate-950/55 backdrop-blur-[2px]' : 'bg-slate-900/20',
        )}
        onClick={onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'absolute z-[50] w-72 rounded-2xl border p-4 shadow-2xl backdrop-blur-md',
          isDark
            ? 'border-emerald-400/25 bg-slate-900/95 text-slate-100 shadow-black/40 ring-1 ring-white/10'
            : 'border-slate-200 bg-white/95 shadow-xl',
        )}
        style={{ left: position.left, top: position.top }}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3
          id={titleId}
          className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-slate-900')}
        >
          规划您的行程
        </h3>

        <div
          className={cn(
            'mt-2 rounded-lg px-3 py-2 text-xs leading-relaxed',
            isDark ? 'bg-slate-800/90 text-emerald-100/95' : 'bg-slate-50 text-slate-600',
          )}
        >
          {locationLabel}
        </div>

        <label className="mt-3 block">
          <span className="sr-only">旅行需求</span>
          <textarea
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            rows={3}
            disabled={loading}
            placeholder="例如：'半天时间，100元预算，想吃本地小吃'"
            className={cn(
              'w-full resize-none rounded-xl border px-3 py-2 text-sm',
              'focus:outline-none focus:ring-2',
              isDark
                ? 'border-slate-600 bg-slate-950/70 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400/30'
                : 'border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-brand-400 focus:ring-brand-200',
              loading && 'cursor-not-allowed opacity-70',
            )}
          />
        </label>

        {error ? (
          <p className="mt-2 text-xs text-rose-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            className={
              isDark ? 'border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700' : undefined
            }
          >
            {loading ? '停止生成' : '取消'}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onGenerate}
            disabled={loading || !query.trim()}
            className="inline-flex"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                生成中
              </>
            ) : (
              '生成'
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
