import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bot, Clock, FileText, Loader2, MapPin, Search, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import { usePlanHistorySessions } from '@/hooks/api/useUserAiSessions';
import { sessionToHistoryEntry } from '@/lib/plan/sessionAdapters';
import { paths } from '@/router/paths';
import { useGlobalMapPlanningStore } from '@/stores/globalMapPlanning/store';
import { usePlanHistoryStore } from '@/stores/planHistory/store';
import { usePlanHistoryUiStore } from '@/stores/planHistory/uiStore';
import type { PlanHistoryEntry, PlanHistoryTrigger } from '@/types/domain/planHistory';
import { formatRelativeZh } from '@/utils/date';
import { motionTransition } from '@/lib/motion';
import { cn } from '@/utils/cn';

const TRIGGER_META: Record<
  PlanHistoryTrigger,
  { label: string; icon: typeof MapPin; emoji: string }
> = {
  map_click: { label: '地图点击', icon: MapPin, emoji: '📍' },
  card_click: { label: '卡片点击', icon: FileText, emoji: '📄' },
  search: { label: '搜索生成', icon: Search, emoji: '🔍' },
  advisor: { label: 'AI 顾问', icon: Bot, emoji: '🐌' },
};

function HistoryListItem({
  entry,
  onSelect,
}: {
  entry: PlanHistoryEntry;
  onSelect: (entry: PlanHistoryEntry) => void;
}) {
  const meta = TRIGGER_META[entry.trigger];

  return (
    <button
      type="button"
      onClick={() => onSelect(entry)}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-brand-200 hover:bg-brand-50/40"
    >
      <div className="flex items-start gap-2.5">
        <span
          className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base"
          aria-hidden
        >
          {meta.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-slate-900">{entry.summary}</span>
          <span className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
            <meta.icon className="h-3 w-3 shrink-0" aria-hidden />
            {meta.label}
            <span aria-hidden>·</span>
            {formatRelativeZh(entry.updatedAt)}
          </span>
        </span>
      </div>
    </button>
  );
}

/** 右侧可折叠「规划历史」侧边栏 */
export default function HistorySidebar() {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const isHomeCockpit = useMatch({ path: paths.home, end: true });
  const open = usePlanHistoryUiStore((state) => state.open);
  const setOpen = usePlanHistoryUiStore((state) => state.setOpen);
  const { data, isLoading, isError } = usePlanHistorySessions();
  const localEntries = usePlanHistoryStore((state) => state.entries);
  const hydrate = usePlanHistoryStore((state) => state.hydrate);
  const restoreFromHistory = useGlobalMapPlanningStore((state) => state.restoreFromHistory);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const entries = useMemo(() => {
    const byId = new Map<string, PlanHistoryEntry>();
    for (const session of data?.items ?? []) {
      byId.set(session.id, sessionToHistoryEntry(session));
    }
    for (const entry of localEntries) {
      if (!byId.has(entry.sessionId)) {
        byId.set(entry.sessionId, entry);
      }
    }
    return [...byId.values()].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [data?.items, localEntries]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open]);

  const handleSelect = (entry: PlanHistoryEntry) => {
    if (entry.trigger === 'advisor') {
      navigate(`${paths.ai}?session=${encodeURIComponent(entry.sessionId)}`);
      setOpen(false);
      return;
    }
    restoreFromHistory(entry);
    setOpen(false);
  };

  return (
    <>
      {!isHomeCockpit ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'fixed right-3 top-1/2 z-[45] inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-700 shadow-lg backdrop-blur-sm transition hover:border-brand-200 hover:text-brand-700 sm:right-4',
            open && 'pointer-events-none opacity-0',
          )}
          aria-label="打开规划历史"
          title="规划历史"
        >
          <Clock className="h-5 w-5" aria-hidden />
        </button>
      ) : null}

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="关闭规划历史"
              className="fixed inset-0 z-[55] bg-slate-900/35 backdrop-blur-[1px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={motionTransition(reduceMotion)}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 right-0 z-[56] flex w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={motionTransition(reduceMotion)}
              aria-label="规划历史"
            >
              <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">规划历史</h2>
                  <p className="mt-0.5 text-xs text-slate-500">最近 AI 穷游规划与追问</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  aria-label="关闭"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    加载历史…
                  </div>
                ) : entries.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
                    <Clock className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
                    <p className="mt-3 text-sm font-medium text-slate-700">暂无规划记录</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {isError
                        ? '无法连接服务器，请稍后再试'
                        : '在地图点击、搜索或卡片生成方案后会出现在这里'}
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {entries.map((entry) => (
                      <li key={entry.sessionId}>
                        <HistoryListItem entry={entry} onSelect={handleSelect} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
