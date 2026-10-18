import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import ChunkedAiChatMarkdown from '@/components/features/map/ChunkedAiChatMarkdown';
import {
  QINGDAO_COUPLE_FOOD_DAYS,
  QINGDAO_COUPLE_FOOD_META,
  type QingdaoCoupleCardBlock,
} from '@/lib/home/qingdaoCoupleFoodCards';
import { cn } from '@/utils/cn';

type PlanResultQingdaoCoupleCardsProps = {
  diaryMarkdown: string;
  className?: string;
};

function AddressChip({ text }: { text: string }) {
  return (
    <p className="mt-2">
      <span
        className={cn(
          'inline-block max-w-full break-words rounded-md px-2 py-1 text-[12px] leading-6',
          'bg-[color-mix(in_srgb,var(--color-sand)_34%,var(--bg-card,#fffef8))]',
          'text-[color:var(--text-title,#222c28)]',
        )}
      >
        {text}
      </span>
    </p>
  );
}

function TipChip({ text }: { text: string }) {
  return (
    <p
      className={cn(
        'break-words rounded-md px-2 py-1.5 text-[12px] leading-6',
        'bg-[color-mix(in_srgb,var(--color-sky)_26%,var(--bg-card,#fffef8))]',
        'text-[color:var(--text-body,#444440)]',
      )}
    >
      {text}
    </p>
  );
}

function BlockCard({ block }: { block: QingdaoCoupleCardBlock }) {
  return (
    <article
      className={cn(
        'rounded-2xl border px-3.5 py-3',
        'border-[color-mix(in_srgb,var(--theme-line)_85%,transparent)]',
        'bg-[color:var(--bg-card,#fffef8)]',
        'shadow-[var(--theme-shadow-sm)]',
      )}
    >
      <h4 className="text-[13px] font-semibold text-[color:var(--color-main,#285948)]">
        {block.label}
      </h4>
      <p className="mt-1.5 break-words text-[13px] leading-7 text-[color:var(--text-body,#444440)]">
        {block.body}
      </p>
      {block.address ? <AddressChip text={block.address} /> : null}
      {block.tips?.length ? (
        <div className="mt-2 space-y-1.5">
          {block.tips.map((tip) => (
            <TipChip key={tip} text={tip} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default function PlanResultQingdaoCoupleCards({
  diaryMarkdown,
  className,
}: PlanResultQingdaoCoupleCardsProps) {
  const [diaryOpen, setDiaryOpen] = useState(false);
  const hasDiary = Boolean(diaryMarkdown.trim());

  return (
    <div className={cn('space-y-4', className)}>
      <header className="space-y-1.5">
        <p className="text-sm font-bold text-[color:var(--text-title,#222c28)]">
          {QINGDAO_COUPLE_FOOD_META.eyebrow}
        </p>
        <p className="break-words text-[12px] leading-6 text-[color:var(--text-light,#70706a)]">
          {QINGDAO_COUPLE_FOOD_META.subtitle}
        </p>
      </header>

      {QINGDAO_COUPLE_FOOD_DAYS.map((day) => (
        <section
          key={day.id}
          className={cn(
            'space-y-2.5 rounded-2xl border px-3.5 py-3.5 sm:px-4',
            'border-[color-mix(in_srgb,var(--color-assist)_35%,var(--theme-line))]',
            'bg-[color-mix(in_srgb,var(--color-main)_5%,var(--bg-card,#fffef8))]',
          )}
        >
          <h3 className="break-words text-sm font-bold leading-6 text-[color:var(--text-title,#222c28)]">
            {day.title}
          </h3>
          <div className="space-y-2.5">
            {day.blocks.map((block) => (
              <BlockCard key={`${day.id}-${block.label}`} block={block} />
            ))}
          </div>
          <p
            className={cn(
              'break-words rounded-md px-2 py-1.5 text-[12px] leading-6',
              'bg-[color-mix(in_srgb,var(--color-sand)_28%,var(--bg-card,#fffef8))]',
              'text-[color:var(--text-title,#222c28)]',
            )}
          >
            {day.lodging}
          </p>
        </section>
      ))}

      {hasDiary ? (
        <div
          className={cn(
            'rounded-2xl border px-3.5 py-3',
            'border-[color-mix(in_srgb,var(--theme-line)_85%,transparent)]',
            'bg-[color:var(--bg-card,#fffef8)]',
          )}
        >
          <button
            type="button"
            className="inline-flex w-full items-center justify-between gap-2 text-left text-[13px] font-medium text-[color:var(--color-main,#285948)]"
            aria-expanded={diaryOpen}
            onClick={() => setDiaryOpen((open) => !open)}
          >
            <span>{diaryOpen ? '收起原始完整日记流水账' : '查看原始完整日记流水账'}</span>
            <ChevronDown
              className={cn('h-4 w-4 shrink-0 transition-transform', diaryOpen && 'rotate-180')}
              aria-hidden
            />
          </button>
          {diaryOpen ? (
            <div className="mt-3 max-w-full overflow-x-hidden break-words">
              <ChunkedAiChatMarkdown
                content={diaryMarkdown}
                soft
                className="text-[13px] leading-7 text-[color:var(--text-body,#444440)] [&_p]:break-words [&_p]:whitespace-pre-wrap"
              />
            </div>
          ) : (
            <p className="mt-1.5 text-[11px] leading-5 text-[color:var(--text-light,#70706a)]">
              默认只看卡片精简版，长文收在这里，不占首屏。
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
