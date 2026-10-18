import { CalendarDays, ChevronDown, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import ChunkedAiChatMarkdown from '@/components/features/map/ChunkedAiChatMarkdown';
import PlanResultBudgetSoftCard from '@/components/features/map/PlanResultBudgetSoftCard';
import PlanResultSceneImage from '@/components/features/map/PlanResultSceneImage';
import PlanResultQingdaoCoupleCards from '@/components/features/map/PlanResultQingdaoCoupleCards';
import PlanResultSoftItinerary from '@/components/features/map/PlanResultSoftItinerary';
import PlanResultSummaryCards from '@/components/features/map/PlanResultSummaryCards';
import { resolvePlanCoverImage } from '@/data/planSceneImages';
import { isQingdaoCoupleFoodCardPlan } from '@/lib/home/qingdaoCoupleFoodCards';
import { parsePlanSections } from '@/lib/plan/parsePlanSections';
import {
  buildPlanSummaryCards,
  buildSoftItineraryView,
  enrichHomeKitIntroDisplay,
  enrichShenzhenIntroDisplay,
  extractBudgetFromIntro,
  softenPlanDisplayCopy,
} from '@/utils/planResultDisplay';
import { cn } from '@/utils/cn';

type PlanResultStructuredContentProps = {
  content: string;
  planStreaming?: boolean;
  initialQuery?: string | null;
  className?: string;
};

/** 贴士 / 避坑穿插在每日行程内，结果页不再单独分区 */
const SECTIONS = [
  {
    key: 'itinerary' as const,
    label: '行程流水账',
    icon: CalendarDays,
    accent: 'border-emerald-200/80 bg-emerald-50/40',
    titleClass: 'text-emerald-800',
    marker: '🌿',
  },
] as const;

type PanelKey = 'intro' | (typeof SECTIONS)[number]['key'];

function useIsMobileViewport(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined') return () => undefined;
      const mq = window.matchMedia('(max-width: 767px)');
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false),
    () => false,
  );
}

type CollapsiblePanelProps = {
  panelKey: PanelKey;
  title: string;
  titleClass: string;
  accent: string;
  open: boolean;
  onToggle: () => void;
  badge?: ReactNode;
  children: ReactNode;
  emptyHint?: string | null;
};

function CollapsiblePanel({
  panelKey,
  title,
  titleClass,
  accent,
  open,
  onToggle,
  badge,
  children,
  emptyHint,
}: CollapsiblePanelProps) {
  return (
    <section className={cn('rounded-2xl border px-4 py-4 sm:px-5', accent)}>
      <button
        type="button"
        className={cn(
          'flex w-full items-center gap-2 text-left text-sm font-bold',
          'outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
          titleClass,
        )}
        aria-expanded={open}
        aria-controls={`plan-panel-${panelKey}`}
        onClick={onToggle}
      >
        {badge}
        <span className="min-w-0 flex-1">{title}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-200',
            open ? 'rotate-180' : 'rotate-0',
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={`plan-panel-${panelKey}`} className="mt-3 min-h-[1.5rem]">
          {children}
        </div>
      ) : emptyHint ? (
        <p className="mt-2 text-xs text-slate-500">{emptyHint}</p>
      ) : (
        <p className="mt-2 text-xs text-slate-500">点击展开完整内容</p>
      )}
    </section>
  );
}

/** 深圳开篇三张问答卡：标题文案固定，仅填充推荐内容 */
function ShenzhenIntroQaCards({
  cards,
}: {
  cards: Array<{ id: string; title: string; body: string }>;
}) {
  return (
    <div className="mt-4 space-y-2.5">
      {cards.map((card) => (
        <details
          key={card.id}
          className="group rounded-2xl border border-brand-100/90 bg-white/90 px-3.5 py-3 open:shadow-[var(--theme-shadow-sm)]"
        >
          <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-2">
              <span>{card.title}</span>
              <span className="shrink-0 text-slate-400 transition group-open:rotate-90" aria-hidden>
                →
              </span>
            </span>
          </summary>
          <p className="mt-2.5 text-[13px] leading-7 text-slate-600">{card.body}</p>
        </details>
      ))}
    </div>
  );
}

export default function PlanResultStructuredContent({
  content,
  planStreaming = false,
  initialQuery = null,
  className,
}: PlanResultStructuredContentProps) {
  const isMobile = useIsMobileViewport();
  const parsed = parsePlanSections(content);
  const hasIntro = Boolean(parsed.intro.trim());
  const hasAnySection = SECTIONS.some((section) => parsed[section.key].trim());

  const summary = useMemo(
    () =>
      buildPlanSummaryCards({
        intro: parsed.intro,
        itinerary: parsed.itinerary,
        snailTips: parsed.snailTips,
        initialQuery,
      }),
    [parsed.intro, parsed.itinerary, parsed.snailTips, initialQuery],
  );

  const budgetBlock = useMemo(() => extractBudgetFromIntro(parsed.intro), [parsed.intro]);
  const softItinerary = useMemo(
    () => buildSoftItineraryView(parsed.itinerary),
    [parsed.itinerary],
  );
  const coverImage = useMemo(
    () =>
      resolvePlanCoverImage({
        intro: parsed.intro,
        itinerary: parsed.itinerary,
        initialQuery,
      }),
    [parsed.intro, parsed.itinerary, initialQuery],
  );

  const shenzhenIntro = useMemo(
    () =>
      enrichShenzhenIntroDisplay({
        proseMarkdown: budgetBlock.proseMarkdown || parsed.intro,
        intro: parsed.intro,
        itinerary: parsed.itinerary,
        initialQuery,
      }),
    [budgetBlock.proseMarkdown, parsed.intro, parsed.itinerary, initialQuery],
  );

  const kitIntro = useMemo(
    () =>
      enrichHomeKitIntroDisplay({
        proseMarkdown: budgetBlock.proseMarkdown || parsed.intro,
        intro: parsed.intro,
        itinerary: parsed.itinerary,
        initialQuery,
      }),
    [budgetBlock.proseMarkdown, parsed.intro, parsed.itinerary, initialQuery],
  );

  const summaryForLists: typeof summary = {
    ...summary,
    totalBudgetYuan: null,
    userBudgetYuan: null,
    surplusYuan: null,
  };
  const qingdaoCoupleCards = isQingdaoCoupleFoodCardPlan(initialQuery, content);
  const showListCards =
    !qingdaoCoupleCards &&
    (summaryForLists.mustEat.length > 0 || summaryForLists.mustVisit.length > 0);
  const showBudget =
    budgetBlock.totalYuan != null ||
    budgetBlock.items.length > 0 ||
    summary.totalBudgetYuan != null;

  const [openPanels, setOpenPanels] = useState<Partial<Record<PanelKey, boolean>>>({});

  useEffect(() => {
    if (!isMobile) {
      setOpenPanels({
        intro: true,
        itinerary: true,
      });
      return;
    }
    if (planStreaming) {
      const next: Partial<Record<PanelKey, boolean>> = {};
      if (hasIntro) next.intro = true;
      for (const section of SECTIONS) {
        if (parsed[section.key].trim()) next[section.key] = true;
      }
      setOpenPanels((prev) => ({ ...prev, ...next }));
      return;
    }
    setOpenPanels(
      isQingdaoCoupleFoodCardPlan(initialQuery, content)
        ? { intro: true, itinerary: true }
        : {},
    );
  }, [isMobile, planStreaming, hasIntro, content, initialQuery]);

  const togglePanel = (key: PanelKey) => {
    setOpenPanels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!hasIntro && !hasAnySection && planStreaming) {
    return <p className="text-sm text-slate-500">AI 正在撰写方案，首字即将出现…</p>;
  }

  const atmosphereBody = (
    <div>
      <ChunkedAiChatMarkdown
        content={softenPlanDisplayCopy(
          shenzhenIntro.isShenzhen
            ? shenzhenIntro.leadProse || budgetBlock.proseMarkdown || parsed.intro
            : kitIntro.active
              ? kitIntro.leadProse || budgetBlock.proseMarkdown || parsed.intro
              : budgetBlock.proseMarkdown || parsed.intro,
        )}
        soft
        className="text-[15px] leading-7 text-slate-600 [&_p]:mb-3 [&_p]:last:mb-0"
      />
      {shenzhenIntro.isShenzhen && shenzhenIntro.cards.length > 0 ? (
        <ShenzhenIntroQaCards cards={shenzhenIntro.cards} />
      ) : null}
      {!shenzhenIntro.isShenzhen && kitIntro.active && kitIntro.softBlocks.length > 0 ? (
        <ShenzhenIntroQaCards cards={kitIntro.softBlocks} />
      ) : null}
    </div>
  );

  const renderSectionBody = (body: string) => {
    if (qingdaoCoupleCards) {
      return <PlanResultQingdaoCoupleCards diaryMarkdown={body} />;
    }
    if (!body) {
      return <p className="text-sm text-slate-500">生成中…</p>;
    }
    return <PlanResultSoftItinerary view={softItinerary} />;
  };

  return (
    <div className={cn('space-y-5 scroll-smooth', className)}>
      {/* 封面实景大图 → 紧跟氛围开篇（不改既有文字分层） */}
      {coverImage ? (
        <PlanResultSceneImage
          src={coverImage.src}
          alt={coverImage.alt}
          variant="cover"
          className="mb-1"
        />
      ) : null}

      {/* ① 氛围开篇 */}
      {hasIntro ? (
        isMobile ? (
          <CollapsiblePanel
            panelKey="intro"
            title="氛围开篇"
            titleClass="text-brand-700"
            accent="border-[color-mix(in_srgb,var(--theme-line)_80%,transparent)] bg-gradient-to-br from-[color-mix(in_srgb,var(--color-main)_6%,var(--bg-card,#fffef8))] to-white"
            open={Boolean(openPanels.intro)}
            onToggle={() => togglePanel('intro')}
            badge={<Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />}
          >
            {atmosphereBody}
          </CollapsiblePanel>
        ) : (
          <div className="rounded-2xl border border-[color-mix(in_srgb,var(--theme-line)_80%,transparent)] bg-gradient-to-br from-[color-mix(in_srgb,var(--color-main)_6%,var(--bg-card,#fffef8))] to-white px-4 py-4 sm:px-5">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-brand-700">
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
              ▫️ 氛围开篇
            </p>
            {atmosphereBody}
          </div>
        )
      ) : null}

      {/* ② 轻量预算 */}
      {showBudget ? (
        <PlanResultBudgetSoftCard
          summary={{
            ...summary,
            totalBudgetYuan: budgetBlock.totalYuan ?? summary.totalBudgetYuan,
          }}
          items={budgetBlock.items}
        />
      ) : null}

      {showListCards ? <PlanResultSummaryCards summary={summaryForLists} /> : null}

      {isMobile && !qingdaoCoupleCards && (showBudget || showListCards) ? (
        <p className="text-xs leading-relaxed text-slate-500">
          下方为完整攻略，默认折叠以提升滑动流畅度，点击标题展开。
        </p>
      ) : null}

      {/* ③ 行程（贴士避坑已写入各天，不再单独分区） */}
      {SECTIONS.map((section) => {
        const body = parsed[section.key].trim();
        if (!qingdaoCoupleCards && !body && !planStreaming) {
          return null;
        }

        const Icon = section.icon;
        const badge = (
          <>
            <span className="text-sm" aria-hidden>
              {section.marker}
            </span>
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
          </>
        );

        if (isMobile) {
          return (
            <CollapsiblePanel
              key={section.key}
              panelKey={section.key}
              title={qingdaoCoupleCards ? '三日卡片行程' : section.label}
              titleClass={section.titleClass}
              accent={section.accent}
              open={Boolean(openPanels[section.key])}
              onToggle={() => togglePanel(section.key)}
              badge={badge}
              emptyHint={!body && planStreaming ? '生成中…' : undefined}
            >
              {renderSectionBody(body)}
            </CollapsiblePanel>
          );
        }

        return (
          <section
            key={section.key}
            className={cn('rounded-2xl border px-4 py-4 sm:px-5', section.accent)}
          >
            <p className={cn('mb-3 flex items-center gap-2 text-sm font-bold', section.titleClass)}>
              {badge}
              {qingdaoCoupleCards ? '三日卡片行程' : section.label}
            </p>
            {renderSectionBody(body)}
          </section>
        );
      })}

      {planStreaming ? (
        <span
          className="ml-1 inline-block h-[1em] w-0.5 animate-pulse bg-brand-500 align-text-bottom"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
