import { motion, useReducedMotion } from 'framer-motion';
import { Bot, CalendarDays, MapPin, Sparkles, Wallet } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import TravelPlanCardActions from '@/components/features/plans/TravelPlanCardActions';
import TravelPlanCardStyleTags from '@/components/features/plans/TravelPlanCardStyleTags';
import MotionLink from '@/components/motion/MotionLink';
import { AvatarImage, OptimizedImage } from '@/components/ui';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { cardHoverMotion } from '@/lib/motion';
import { travelPlanDetailPath } from '@/router/paths';
import {
  getPlanBudgetLabel,
  getPlanCoverAlt,
  getPlanCoverUrl,
  getPlanCreator,
  getPlanDaysLabel,
  getPlanDestination,
  getPlanGeneratedAt,
  getPlanStyleTags,
} from '@/utils/travelPlanView';
import { cn } from '@/utils/cn';
import { formatRelativeZh } from '@/utils/date';
import { areTravelPlanCardPropsEqual } from '@/utils/react/memoComparators';

export type TravelPlanCardProps = {
  plan: TravelPlan;
  className?: string;
  /** 跑马灯克隆项等场景的无障碍标签 */
  duplicateLabel?: string;
  showAction?: boolean;
  /** 点赞 / 收藏 / 分享，默认开启 */
  showInteractions?: boolean;
};

const TRAVEL_INFO_FIELDS = [
  {
    key: 'destination',
    label: '目的地',
    icon: MapPin,
    value: getPlanDestination,
  },
  {
    key: 'days',
    label: '天数',
    icon: CalendarDays,
    value: getPlanDaysLabel,
  },
  {
    key: 'budget',
    label: '总预算',
    icon: Wallet,
    value: getPlanBudgetLabel,
  },
] as const;

const TravelPlanCardTravelInfo = memo(function TravelPlanCardTravelInfo({ plan }: { plan: TravelPlan }) {
  return (
    <section
      className="rounded-xl border border-slate-200/80 bg-white/75 p-2.5"
      aria-label="旅行信息"
    >
      <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-wider text-slate-500">
        旅行信息
      </p>
      <dl className="grid grid-cols-3 gap-1.5">
        {TRAVEL_INFO_FIELDS.map(({ key, label, icon: Icon, value }) => (
          <div key={key} className="min-w-0 rounded-lg bg-slate-50/90 px-1.5 py-2 text-center">
            <dt className="flex flex-col items-center gap-0.5 text-[10px] text-slate-500">
              <Icon className="h-3.5 w-3.5 shrink-0 text-brand-600" strokeWidth={2} aria-hidden />
              <span>{label}</span>
            </dt>
            <dd className="mt-1 break-words text-xs font-semibold leading-snug text-slate-800">
              {value(plan)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
});

const TravelPlanCardCover = memo(function TravelPlanCardCover({ plan }: { plan: TravelPlan }) {
  const [imageFailed, setImageFailed] = useState(false);
  const destination = getPlanDestination(plan);
  const coverUrl = getPlanCoverUrl(plan);
  const coverAlt = getPlanCoverAlt(plan);
  const showImage = Boolean(coverUrl) && !imageFailed;

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-brand-100 via-slate-100 to-violet-100">
      {showImage ? (
        <OptimizedImage
          src={coverUrl!}
          alt={coverAlt}
          fill
          sizes="(max-width: 640px) 88vw, 17.5rem"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className="flex h-full flex-col items-center justify-center gap-1.5 text-brand-700/70"
          aria-hidden={Boolean(coverUrl)}
        >
          <MapPin className="h-6 w-6" strokeWidth={1.5} />
          <span className="text-sm font-semibold tracking-wide">{destination}</span>
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/45 via-slate-900/5 to-transparent"
        aria-hidden
      />
      <p className="pointer-events-none absolute bottom-2 left-3 text-xs font-semibold text-white drop-shadow-sm">
        {destination}
      </p>
    </div>
  );
});

function getCreatorInitial(nickname: string): string {
  const match = nickname.match(/[\p{L}\p{N}]/u);
  return match?.[0] ?? '?';
}

const TravelPlanCardCreator = memo(function TravelPlanCardCreator({ plan }: { plan: TravelPlan }) {
  const creator = getPlanCreator(plan);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const showAvatar = Boolean(creator.avatarUrl) && !avatarFailed;
  const labelId = `travel-plan-creator-${plan.id}`;

  return (
    <div className="flex items-center gap-2.5" aria-labelledby={labelId}>
      {showAvatar ? (
        <AvatarImage
          src={creator.avatarUrl!}
          displayName={creator.nickname}
          size={36}
          className="h-9 w-9 shrink-0 ring-2 ring-white shadow-sm"
          onError={() => setAvatarFailed(true)}
        />
      ) : (
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-violet-100 text-sm font-bold text-brand-700 ring-2 ring-white"
          aria-hidden
        >
          {getCreatorInitial(creator.nickname)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-slate-500">创建者</p>
        <p id={labelId} className="truncate text-sm font-semibold text-slate-800">
          {creator.nickname}
        </p>
      </div>
    </div>
  );
});

const TravelPlanCardHeading = memo(function TravelPlanCardHeading({ plan }: { plan: TravelPlan }) {
  const titleId = `travel-plan-title-${plan.id}`;
  const descriptionId = `travel-plan-desc-${plan.id}`;

  return (
    <header className="border-b border-slate-100/90 pb-3">
      <h3
        id={titleId}
        className="line-clamp-2 text-base font-bold leading-snug tracking-tight text-slate-900"
        aria-describedby={descriptionId}
      >
        {plan.title}
      </h3>
      <p id={descriptionId} className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-slate-600">
        {plan.summary}
      </p>
    </header>
  );
});

/** 展示 AI 生成的旅行计划：封面、标题、旅行信息、创建者、互动与详情入口 */
function TravelPlanCard({
  plan,
  className,
  duplicateLabel,
  showAction = true,
  showInteractions = true,
}: TravelPlanCardProps) {
  const reduceMotion = useReducedMotion();
  const ariaLabel = duplicateLabel ? `${plan.title}（${duplicateLabel}）` : plan.title;
  const generatedAt = getPlanGeneratedAt(plan);
  const styleTags = useMemo(() => getPlanStyleTags(plan), [plan]);

  return (
    <motion.article
      className={cn(
        'home-plan-card group overflow-hidden rounded-2xl border border-slate-200/90 bg-white',
        'shadow-sm transition-[box-shadow,border-color] duration-300',
        'hover:border-brand-200/80 hover:shadow-[0_8px_32px_rgba(59,130,246,0.14)]',
        className,
      )}
      aria-label={ariaLabel}
      initial="rest"
      whileHover={reduceMotion ? 'rest' : 'hover'}
      variants={cardHoverMotion}
    >
      <TravelPlanCardCover plan={plan} />

      <div className="space-y-3 bg-gradient-to-br from-white via-slate-50/80 to-brand-50/20 p-4">
        <TravelPlanCardHeading plan={plan} />

        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 font-mono text-[10px] font-medium text-violet-700">
            <Bot className="h-3 w-3" aria-hidden />
            AI Generated
          </span>
          <time
            className="font-mono text-[10px] text-slate-400"
            dateTime={generatedAt}
            title={generatedAt}
          >
            {formatRelativeZh(generatedAt)}
          </time>
        </div>

        <TravelPlanCardTravelInfo plan={plan} />

        <TravelPlanCardCreator plan={plan} />

        <TravelPlanCardStyleTags tags={styleTags} />

        {showInteractions && <TravelPlanCardActions plan={plan} />}

        {showAction && (
          <MotionLink
            to={travelPlanDetailPath(plan.id)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            查看计划详情
          </MotionLink>
        )}
      </div>
    </motion.article>
  );
}

export default memo(TravelPlanCard, areTravelPlanCardPropsEqual);
