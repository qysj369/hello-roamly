import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { AIChatInterface } from '@/components/features/ai';
import MotionPage, { MotionBlock } from '@/components/motion/MotionPage';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { useUserMapOrigin } from '@/hooks/map/useUserMapOrigin';
import { aiChatPageSeo } from '@/lib/seo';
import { historyItemsToAdvisorMessages } from '@/lib/ai/advisorSessionSync';
import { handoffStateToChatContext } from '@/lib/ai/buildAdvisorHandoff';
import { formatPlanDemandForDisplay } from '@/lib/home/launchHomeMapQiongYouPlan';
import { parseTravelSearchIntent } from '@/lib/map/planQueryBuilder';
import type { AiChatMessage } from '@/types/domain/aiChat';
import type { AiChatPageState } from '@/types/router-state';
import { getAiProviderDisplay, getAiProviderDisplayLabel } from '@/lib/config/ai';
import { CAPSULE_FONT_URL } from '@/lib/config/capsuleDesignTokens';
import { clearCapsuleAiSession, isCapsuleAiSession } from '@/lib/capsule/capsuleAiSession';
import TravelAgentHost from '@/components/agent/TravelAgentHost';
import { paths } from '@/router/paths';
import { fetchUserAiSessionById } from '@/services/user/api/userAiSessions';
import { extractDaysFromPrompt, extractDestinationFromPrompt } from '@/utils/extractTravelIntent';
import '@/styles/capsule-one.css';

export default function AiChatPage() {
  usePageSeo(aiChatPageSeo());
  const { origin: userOrigin } = useUserMapOrigin();

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const routeState = location.state as AiChatPageState | null;

  const sessionIdFromUrl = searchParams.get('session')?.trim() || undefined;
  const isFreshHomeSearch =
    routeState?.source === 'home_map' && Boolean(routeState.searchNonce);
  /** 首页新搜索绝不恢复上一轮会话，避免测试对话污染 */
  const restoreSessionId = isFreshHomeSearch
    ? undefined
    : sessionIdFromUrl ?? routeState?.sessionId;

  const [restoredMessages, setRestoredMessages] = useState<AiChatMessage[] | undefined>();
  const [restoredInitialQuery, setRestoredInitialQuery] = useState<string | undefined>();
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(Boolean(restoreSessionId));

  const isCapsuleMode =
    routeState?.source === 'capsule_one' || isCapsuleAiSession();

  useEffect(() => {
    if (!isCapsuleMode) {
      return undefined;
    }

    document.documentElement.classList.add('capsule-one-ai-active');

    let link = document.getElementById('capsule-one-fonts') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = 'capsule-one-fonts';
      link.rel = 'stylesheet';
      link.href = CAPSULE_FONT_URL;
      document.head.appendChild(link);
    }

    return () => {
      document.documentElement.classList.remove('capsule-one-ai-active');
    };
  }, [isCapsuleMode]);

  useEffect(() => {
    if (!restoreSessionId) {
      setRestoreLoading(false);
      return undefined;
    }

    let cancelled = false;
    setRestoreLoading(true);
    setRestoreError(null);

    fetchUserAiSessionById(restoreSessionId)
      .then((session) => {
        if (cancelled) {
          return;
        }
        const messages = historyItemsToAdvisorMessages(session.fullHistory);
        setRestoredMessages(messages.length > 0 ? messages : undefined);
        setRestoredInitialQuery(session.initialQuery || undefined);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setRestoreError('无法加载该会话，将开启新对话');
        setRestoredMessages(undefined);
        setRestoredInitialQuery(undefined);
      })
      .finally(() => {
        if (!cancelled) {
          setRestoreLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [restoreSessionId]);

  const autoPrompt = useMemo(() => {
    if (restoreSessionId) {
      return undefined;
    }
    const fromQuery = searchParams.get('q') ?? searchParams.get('ask');
    return (
      fromQuery?.trim() ||
      routeState?.initialPrompt?.trim() ||
      routeState?.aiDream?.trim() ||
      undefined
    );
  }, [restoreSessionId, routeState?.aiDream, routeState?.initialPrompt, searchParams]);

  const [paramsOpen, setParamsOpen] = useState(false);

  const mergedState = useMemo((): AiChatPageState => {
    return {
      ...routeState,
      sessionId: restoreSessionId ?? routeState?.sessionId,
    };
  }, [restoreSessionId, routeState]);

  const context = useMemo(() => {
    const handoffContext = handoffStateToChatContext(mergedState);
    const dream = handoffContext.dream;
    const intent = dream ? parseTravelSearchIntent(dream) : null;
    const fromDream = dream ? extractDestinationFromPrompt(dream) : undefined;
    const daysFromDream = dream ? extractDaysFromPrompt(dream) : undefined;
    const storedOrigin =
      userOrigin?.label?.trim() && userOrigin.gcjLng != null && userOrigin.gcjLat != null
        ? {
            name: userOrigin.label.trim(),
            lng: userOrigin.gcjLng,
            lat: userOrigin.gcjLat,
          }
        : undefined;

    return {
      ...handoffContext,
      origin: handoffContext.origin ?? storedOrigin,
      destination:
        handoffContext.destination ??
        intent?.destinationHint ??
        fromDream,
      days: handoffContext.days ?? intent?.days ?? daysFromDream,
      budget:
        handoffContext.budget ??
        (intent?.budgetYuan != null ? String(intent.budgetYuan) : undefined),
    };
  }, [mergedState, userOrigin]);

  const seedAssistant = useMemo(() => {
    if (restoredMessages && restoredMessages.length > 0) {
      return undefined;
    }
    if (isCapsuleMode && autoPrompt) {
      return '';
    }
    if (context.planExcerpt) {
      const bits = [
        context.dream && `已记住你的想法：${context.dream}`,
        context.destination &&
          `目的地 ${context.destination}${context.days ? ` · ${context.days} 天` : ''}${context.budget ? ` · 预算约 ¥${context.budget}` : ''}`,
        '已从地图规划带入方案摘要，你可以直接追问细节、改预算或换节奏。',
      ].filter(Boolean);
      return `已带入地图方案。${bits.join(' · ')} · 直接在下方追问即可。`;
    }
    if (context.destination || context.dream) {
      const dreamShort = formatPlanDemandForDisplay(context.dream);
      const bits = [
        dreamShort && `想法：${dreamShort}`,
        context.destination &&
          `${context.destination}${context.days ? ` · ${context.days}天` : ''}${context.budget ? ` · ¥${context.budget}` : ''}`,
      ].filter(Boolean);
      if (isCapsuleMode) {
        return `已锁定${bits.length ? ` · ${bits.join(' · ')}` : ''}。说说偏好，我来构建路线。`;
      }
      if (mergedState?.source === 'home_map') {
        const summary =
          context.destination != null
            ? `${context.destination}${context.days ? ` · ${context.days}天` : ''}${context.budget ? ` · ¥${context.budget}` : ''}`
            : dreamShort || '你的漫行需求';
        return `已收到：${summary}。正在生成漫行攻略，请稍候…`;
      }
      return `你好，我是旅行顾问。${bits.join(' · ')} · 说说偏好或直接让我出行程。`;
    }
    if (context.origin?.name) {
      return `已从首页读取出发地：${context.origin.name}。直接说想去哪，我会按从你家出发来算交通。`;
    }
    if (isCapsuleMode || mergedState?.source === 'capsule_one') {
      return '说说偏好与节奏，我来为你构建路线。';
    }
    return '';
  }, [
    context.budget,
    context.days,
    context.destination,
    context.dream,
    context.origin?.name,
    context.planExcerpt,
    isCapsuleMode,
    mergedState?.source,
    restoredMessages,
    autoPrompt,
  ]);

  const aiProvider = getAiProviderDisplay();
  const useButlerPage =
    !isCapsuleMode && !restoreSessionId && routeState?.source !== 'capsule_one';

  if (useButlerPage) {
    return <TravelAgentHost layout="page" />;
  }

  const chatBody = (
    <AIChatInterface
      key={routeState?.searchNonce ?? restoreSessionId ?? 'ai-live'}
      className={isCapsuleMode ? 'capsule-ai-interface' : undefined}
      variant={isCapsuleMode ? 'capsule' : 'default'}
      context={context}
      seedAssistant={seedAssistant}
      autoPrompt={autoPrompt}
      hideAutoPromptBubble={isCapsuleMode && Boolean(autoPrompt)}
      paramsOpen={isCapsuleMode ? paramsOpen : undefined}
      onParamsOpenChange={isCapsuleMode ? setParamsOpen : undefined}
      initialMessages={isFreshHomeSearch ? undefined : restoredMessages}
      restoredSessionId={restoreSessionId}
      restoredInitialQuery={isFreshHomeSearch ? undefined : restoredInitialQuery}
      isSessionRestoring={isFreshHomeSearch ? false : restoreLoading}
    />
  );

  if (isCapsuleMode) {
    const lockedLabel = routeState?.location?.name ?? context.destination;

    return (
      <div className="capsule-ai-page capsule-ai-page--enter">
        <div className="capsule-ai-page__stars" aria-hidden />
        <header className="capsule-ai-page__hud">
          <Link
            to={paths.home}
            className="capsule-ai-page__back"
            onClick={() => clearCapsuleAiSession()}
          >
            ← 返回
          </Link>
          <p className="capsule-ai-page__title">
            {lockedLabel ? `构建中 · ${lockedLabel}` : '现实构建中'}
          </p>
          <button
            type="button"
            className="capsule-ai-page__action"
            onClick={() => setParamsOpen((open) => !open)}
            aria-label="旅行参数"
            aria-expanded={paramsOpen}
            aria-controls="ai-travel-params-panel"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          </button>
        </header>

        {restoreError ? (
          <p className="capsule-ai-page__status capsule-ai-page__status--warn" role="status">
            {restoreError}
          </p>
        ) : null}

        <div className="capsule-ai-page__panel">{chatBody}</div>
      </div>
    );
  }

  return (
    <MotionPage className="pb-2">
      <MotionBlock>
        <div className="mb-2 flex items-center justify-between gap-2">
          <Link to={paths.home} className="text-xs font-medium text-brand-600 hover:text-brand-700">
            ← 回首页
          </Link>
          {aiProvider !== 'deepseek' ? (
            <span className="text-[10px] text-slate-400">
              {aiProvider === 'unconfigured'
                ? getAiProviderDisplayLabel(aiProvider)
                : '演示模式'}
            </span>
          ) : null}
        </div>
        {restoreError ? (
          <p className="mb-3 text-sm text-amber-700" role="status">
            {restoreError}
          </p>
        ) : null}
        {chatBody}
      </MotionBlock>
    </MotionPage>
  );
}
