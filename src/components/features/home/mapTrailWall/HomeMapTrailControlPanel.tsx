import { Loader2, Sparkles } from 'lucide-react';
import { type FormEvent, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import HomeMapSearchVoiceControl from '@/components/features/home/mapTrailWall/HomeMapSearchVoiceControl';
import {
  HOME_MAP_TRAIL,
  HOME_MAP_TRAIL_SEARCH_EXAMPLES,
  HOME_MAP_TRAIL_VOICE_SEARCH_ENABLED,
  pickSearchExampleIndex,
  pickSearchPlaceholder,
  pickSearchPlaceholderHeader,
} from '@/lib/config/homeMapTrail';
import { useHomeMapSearchVoice } from '@/hooks/map/useHomeMapSearchVoice';
import { paths } from '@/router/paths';
import type { AiChatPageState } from '@/types/router-state';
import { cn } from '@/utils/cn';

type HomeMapTrailControlPanelProps = {
  searchQuery: string;
  generating?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (query: string) => Promise<string | null>;
  onRetrySearch?: () => void;
  /** overlay=地图内；above=地图上方；header=顶栏品牌与菜单之间 */
  placement?: 'overlay' | 'above' | 'header';
  /** 跳转 AI 顾问时携带的会话上下文 */
  advisorHandoff?: AiChatPageState;
};

const actionButtonClass = cn(
  'inline-flex min-h-9 items-center justify-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition',
);

export default function HomeMapTrailControlPanel({
  searchQuery,
  generating = false,
  onSearchChange,
  onSearchSubmit,
  onRetrySearch,
  placement = 'overlay',
  advisorHandoff,
}: HomeMapTrailControlPanelProps) {
  const [searchError, setSearchError] = useState<string | null>(null);
  const [exampleIndex] = useState(() => pickSearchExampleIndex());
  const [searchPlaceholder] = useState(() => pickSearchPlaceholder(exampleIndex));
  const exampleQuery = HOME_MAP_TRAIL_SEARCH_EXAMPLES[exampleIndex];
  const headerPlaceholder = pickSearchPlaceholderHeader(exampleIndex);
  const isHeader = placement === 'header';
  const isAbove = placement === 'above';

  const handleVoiceRecognized = useCallback(
    async (text: string) => {
      if (generating) {
        return;
      }
      setSearchError(null);
      onSearchChange(text);
      const errorMessage = await onSearchSubmit(text);
      if (errorMessage) {
        setSearchError(errorMessage);
      }
    },
    [generating, onSearchChange, onSearchSubmit],
  );

  const voice = useHomeMapSearchVoice({
    disabled: generating || !HOME_MAP_TRAIL_VOICE_SEARCH_ENABLED,
    onRecognized: handleVoiceRecognized,
  });

  const displayQuery =
    HOME_MAP_TRAIL_VOICE_SEARCH_ENABLED &&
    voice.active &&
    voice.preview?.trim()
      ? voice.preview.trim()
      : searchQuery;
  const effectiveTrimmed = displayQuery.trim();
  const submitQuery = effectiveTrimmed || exampleQuery;
  const usingExample = !effectiveTrimmed && Boolean(exampleQuery);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!submitQuery) {
      return;
    }
    if (generating) {
      return;
    }
    setSearchError(null);
    if (!effectiveTrimmed && exampleQuery) {
      onSearchChange(exampleQuery);
    }
    const errorMessage = await onSearchSubmit(submitQuery);
    if (errorMessage) {
      setSearchError(errorMessage);
    }
  }

  const busy = generating;
  const planTitle =
    busy
      ? '正在生成方案…'
      : usingExample
        ? `将使用示例：${exampleQuery}`
        : '一键生成漫行方案';

  return (
    <aside
      className={cn(
        'home-map-trail-control',
        isHeader
          ? cn('home-map-trail-control--header relative shrink-0', busy && 'home-map-trail-control--busy')
          : isAbove
            ? cn(
                'home-map-trail-control--above relative w-full rounded-xl p-3',
                busy && 'home-map-trail-control--busy',
              )
            : cn(
                'pointer-events-auto absolute left-3 top-3 z-[40] w-[min(calc(100%-1.5rem),17.5rem)] rounded-xl p-2.5 sm:left-4 sm:top-4',
                busy && 'home-map-trail-control--busy',
              ),
      )}
      aria-label="轨迹搜索与一键规划"
    >
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className={cn('flex flex-col gap-2', isHeader && 'gap-0')}
      >
        <label className="sr-only" htmlFor="trail-wall-search">
          搜索或描述旅行需求
        </label>

        {isHeader ? (
          <div className="home-map-trail-control__header-stack">
            <div className="home-map-trail-control__header-row flex items-center gap-1 sm:gap-1.5">
              {HOME_MAP_TRAIL_VOICE_SEARCH_ENABLED ? (
                <HomeMapSearchVoiceControl voice={voice} disabled={busy} part="mic" />
              ) : null}
              <input
                id="trail-wall-search"
                type="text"
                enterKeyHint="go"
                value={displayQuery}
                onChange={(event) => {
                  setSearchError(null);
                  if (HOME_MAP_TRAIL_VOICE_SEARCH_ENABLED && voice.active) {
                    voice.toggle();
                  }
                  onSearchChange(event.target.value);
                }}
                disabled={busy}
                placeholder={headerPlaceholder}
                className="home-map-trail-control__input rounded-lg text-xs disabled:opacity-60 sm:text-sm"
              />
              <button
                type="submit"
                disabled={busy || !submitQuery}
                className={cn(
                  actionButtonClass,
                  'home-map-trail-control__btn-primary shrink-0 gap-1 px-2.5 sm:gap-1.5 sm:px-3',
                  busy && 'home-map-trail-control__btn-primary--busy',
                )}
                title={planTitle}
                aria-busy={busy}
              >
                {generating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                )}
                <span>{busy ? '规划中' : HOME_MAP_TRAIL.planCta}</span>
              </button>
            </div>
            {HOME_MAP_TRAIL_VOICE_SEARCH_ENABLED ? (
              <HomeMapSearchVoiceControl voice={voice} disabled={busy} part="strip" />
            ) : null}
          </div>
        ) : (
          <div
            className={cn(
              'flex flex-col gap-2',
              isAbove && 'sm:flex-row sm:items-center',
            )}
          >
            <div className={cn('flex min-w-0 items-center gap-2', isAbove && 'min-w-0 flex-1')}>
              {HOME_MAP_TRAIL_VOICE_SEARCH_ENABLED ? (
                <HomeMapSearchVoiceControl voice={voice} disabled={busy} />
              ) : null}
              <input
                id="trail-wall-search"
                type="text"
                enterKeyHint="go"
                value={displayQuery}
                onChange={(event) => {
                  setSearchError(null);
                  if (HOME_MAP_TRAIL_VOICE_SEARCH_ENABLED && voice.active) {
                    voice.toggle();
                  }
                  onSearchChange(event.target.value);
                }}
                disabled={busy}
                placeholder={searchPlaceholder}
                className={cn(
                  'home-map-trail-control__input min-h-9 w-full min-w-0 rounded-lg px-3 text-sm disabled:opacity-60',
                  isAbove && 'flex-1',
                )}
              />
            </div>

            <div
              className={cn(
                'grid grid-cols-2 gap-2',
                isAbove && 'sm:w-auto sm:shrink-0',
              )}
            >
              <button
                type="submit"
                disabled={busy || !submitQuery}
                className={cn(
                  actionButtonClass,
                  'home-map-trail-control__btn-primary flex-1',
                  busy && 'home-map-trail-control__btn-primary--busy',
                  isAbove && 'sm:min-w-[6.5rem]',
                )}
                title={planTitle}
                aria-busy={busy}
              >
                {generating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                )}
                <span>{busy ? '规划中…' : HOME_MAP_TRAIL.planCta}</span>
              </button>

              <Link
                to={paths.ai}
                state={
                  advisorHandoff ??
                  (submitQuery ? { initialPrompt: submitQuery, source: 'home_map' as const } : undefined)
                }
                className={cn(
                  actionButtonClass,
                  'home-map-trail-control__btn-secondary flex-1',
                  isAbove && 'sm:min-w-[5.5rem]',
                )}
                title="AI 顾问"
              >
                <span aria-hidden>🐌</span>
                <span>AI 顾问</span>
              </Link>
            </div>
          </div>
        )}

        {usingExample && !busy && !isHeader ? (
          <p className="text-[10px] leading-snug text-slate-500">
            未输入时将使用示例「{exampleQuery}」
          </p>
        ) : null}

        {searchError ? (
          <div role="alert" className={cn(isHeader && 'absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-rose-200 bg-white p-2 shadow-md')}>
            <p
              className={cn(
                'text-[10px] leading-snug',
                isHeader || isAbove ? 'text-rose-600' : 'text-rose-400',
              )}
            >
              {searchError}
            </p>
            {onRetrySearch ? (
              <button
                type="button"
                onClick={() => {
                  setSearchError(null);
                  onRetrySearch();
                }}
                className={cn(
                  'mt-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium',
                  isHeader || isAbove
                    ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                    : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/30',
                )}
              >
                重试
              </button>
            ) : null}
          </div>
        ) : null}
      </form>
    </aside>
  );
}
