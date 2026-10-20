import {
  lazy,
  Suspense,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { KNOWLEDGE_VERIFY_TIP } from '@/lib/agent/cityTravelKnowledge';
import { formatSpiralPlanVoice } from '@/lib/agent/spiralPlanVoice';
import { describeRememberedPreference } from '@/lib/agent/travelAgentCopy';
import {
  matchSnailFlightButler,
  SNAIL_FLIGHT_BUTLER_LEAD,
  SNAIL_FLIGHT_BUTLER_WELCOME,
  SNAIL_FLIGHT_SCENE_CHIPS,
} from '@/lib/snail-flight/butlerCommands';
import type { CaptionPackId } from '@/lib/snail-flight/captionPacks';
import { useSnailFlightCaptionStore } from '@/lib/snail-flight/captionPackStore';
import { useFlightButlerStore } from '@/lib/snail-flight/flightButlerStore';
import { useTravelAgentStore } from '@/stores/travelAgent/store';
import { copyTextToClipboard } from '@/utils/copyTextToClipboard';
import '@/styles/travel-agent.css';

const HoloSearchPlanPosterPanel = lazy(
  () => import('@/components/home/holo/HoloSearchPlanPosterPanel'),
);
const HoloSearchPlanShareSheet = lazy(
  () => import('@/components/home/holo/HoloSearchPlanShareSheet'),
);

const PLAN_QUICK_CHIPS = [
  { label: '补充景点详情', text: '补充景点详情' },
  { label: '增加本地美食', text: '增加本地美食' },
  { label: '完善出行交通', text: '完善出行交通' },
] as const;

const FLIGHT_QUICK_CHIPS = [
  { label: '人文主版本', text: '切换为主版本文案', packId: 'story' as const },
  { label: '极简诗意', text: '切换极简诗意版', packId: 'verse' as const },
  { label: '科普叙事', text: '切换科普叙事版', packId: 'guide' as const },
] as const;

const SPIRAL_ASSET_OPEN_COPY =
  '已打开图文攻略预览。可滚动查看卡片，底部【保存图片】即可下载；文案仅作漫游灵感参考，不含订票、组团服务。';

function panelLeadText(spiralMode: boolean, flightMode: boolean, hasPlan: boolean): string {
  if (spiralMode) return '告诉我你想听什么，我陪你一路漫游';
  if (flightMode) return SNAIL_FLIGHT_BUTLER_LEAD;
  if (hasPlan) return '点下面改一处，或直接打字。';
  return '说目的地和天数即可。';
}

function emptyLogText(spiralMode: boolean, flightMode: boolean): string {
  if (spiralMode) return '可以直接说「青岛3天情侣」或「杭州周末闲逛」，我帮你排一版松弛慢游。';
  if (flightMode) return SNAIL_FLIGHT_BUTLER_WELCOME;
  return '点下面改一处，或直接打字。';
}

function composerPlaceholder(spiralMode: boolean, flightMode: boolean, hasPlan: boolean): string {
  if (spiralMode) return '例如：青岛3天情侣';
  if (flightMode) return '例如：切换极简诗意版';
  if (hasPlan) return '改行程…';
  return '例如：杭州3天亲子';
}

const SPIRAL_LOG_WINDOW = 24;
const SPIRAL_PANEL_FADE_MS = 180;

export type TravelAgentHostProps = {
  /** page：/ai 管家整页；embed：行程卡右侧；fab：首页角落入口 */
  layout?: 'fab' | 'page' | 'embed';
  /** flight：蜗牛号漫游专用对话；spiral：螺旋首页管家面板 */
  variant?: 'default' | 'flight' | 'spiral';
  narrating?: boolean;
  onNarrate?: () => void;
  onRollback?: () => void;
  extraHeader?: ReactNode;
  extraFooter?: ReactNode;
};

export default function TravelAgentHost({
  layout = 'fab',
  variant = 'default',
  narrating = false,
  onNarrate,
  onRollback,
  extraHeader,
  extraFooter,
}: TravelAgentHostProps) {
  const titleId = useId();
  const logRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');
  const [flashChip, setFlashChip] = useState<string | null>(null);
  const [logCap, setLogCap] = useState(SPIRAL_LOG_WINDOW);
  const [panelEntered, setPanelEntered] = useState(false);
  const isPage = layout === 'page';
  const isEmbed = layout === 'embed';
  const spiralMode = variant === 'spiral';
  const flightOnly = variant === 'flight';
  const flightMode = flightOnly || spiralMode;
  const captionPackId = useSnailFlightCaptionStore((state) => state.packId);
  const open = useTravelAgentStore((state) => state.open);
  const busy = useTravelAgentStore((state) => state.busy);
  const tripMessages = useTravelAgentStore((state) => state.messages);
  const flightMessages = useFlightButlerStore((state) => state.messages);
  const sendFlight = useFlightButlerStore((state) => state.send);
  const noteLocal = useTravelAgentStore((state) => state.noteLocal);
  const messages = flightOnly ? flightMessages : tripMessages;
  const plan = useTravelAgentStore((state) => state.plan);
  const posterOpen = useTravelAgentStore((state) => state.posterOpen);
  const shareOpen = useTravelAgentStore((state) => state.shareOpen);
  const sessionId = useTravelAgentStore((state) => state.sessionId);
  const openChat = useTravelAgentStore((state) => state.openChat);
  const closeChat = useTravelAgentStore((state) => state.closeChat);
  const send = useTravelAgentStore((state) => state.send);
  const closePoster = useTravelAgentStore((state) => state.closePoster);
  const closeShare = useTravelAgentStore((state) => state.closeShare);
  const remembered = describeRememberedPreference();
  const [embedOnPage, setEmbedOnPage] = useState(false);

  useEffect(() => {
    if (isEmbed || isPage) return undefined;
    const sync = () => {
      setEmbedOnPage(Boolean(document.querySelector('.travel-agent-host--embed')));
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isEmbed, isPage]);

  const showPanel = isPage || (open && (isEmbed || !embedOnPage));
  const [railOpen, setRailOpen] = useState(showPanel);

  useEffect(() => {
    if (showPanel) {
      setRailOpen(true);
      return undefined;
    }
    if (!spiralMode) {
      setRailOpen(false);
      setPanelEntered(false);
      return undefined;
    }
    setPanelEntered(false);
    const timer = window.setTimeout(() => setRailOpen(false), SPIRAL_PANEL_FADE_MS);
    return () => window.clearTimeout(timer);
  }, [showPanel, spiralMode]);

  useEffect(() => {
    if (!spiralMode || !railOpen) {
      setPanelEntered(false);
      return undefined;
    }
    const frame = window.requestAnimationFrame(() => setPanelEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, [spiralMode, railOpen]);

  useEffect(() => {
    if (isPage) openChat();
  }, [isPage, openChat]);

  useEffect(() => {
    if (showPanel && spiralMode) setLogCap(SPIRAL_LOG_WINDOW);
  }, [showPanel, spiralMode]);

  useEffect(() => {
    const node = logRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, open, busy, logCap]);

  const visibleMessages = spiralMode ? messages.slice(-logCap) : messages;
  const hiddenCount = spiralMode ? Math.max(0, messages.length - visibleMessages.length) : 0;
  const canSend = Boolean(draft.trim()) && !busy;

  const sendSpiral = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const hit = matchSnailFlightButler(trimmed, useSnailFlightCaptionStore.getState().progress);
    if (hit?.packId) {
      sendFlight(trimmed);
      const restyle = plan ? `\n\n${formatSpiralPlanVoice(plan, hit.packId)}` : '';
      noteLocal(trimmed, `${hit.message}${restyle}`);
      return;
    }
    if (hit) {
      noteLocal(trimmed, hit.message);
      return;
    }
    send(trimmed).catch(() => undefined);
  };

  const dispatchChipText = (text: string) => {
    if (spiralMode) {
      sendSpiral(text);
      return;
    }
    if (flightMode) {
      sendFlight(text);
      return;
    }
    send(text).catch(() => undefined);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    setDraft('');
    dispatchChipText(text);
  };

  const flashThenSend = (label: string, text: string) => {
    setFlashChip(label);
    setDraft(text);
    window.setTimeout(() => setFlashChip((current) => (current === label ? null : current)), 520);
    window.setTimeout(() => {
      setDraft('');
      dispatchChipText(text);
    }, 40);
  };

  const hostClass = [
    'travel-agent-host',
    layout === 'page' ? 'travel-agent-host--page' : '',
    layout === 'embed' ? 'travel-agent-host--embed' : '',
    railOpen && layout === 'fab' ? 'travel-agent-host--open' : '',
    isEmbed && railOpen ? 'travel-agent-host--embed-open' : '',
    spiralMode ? 'travel-agent-host--spiral' : '',
    flightOnly ? 'travel-agent-host--flight' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const chips = (() => {
    if (spiralMode || flightOnly) return [...FLIGHT_QUICK_CHIPS, ...SNAIL_FLIGHT_SCENE_CHIPS];
    return PLAN_QUICK_CHIPS;
  })();
  const chipsNeedPlan = !spiralMode && !flightOnly;

  const posterPanel = plan ? (
    <Suspense
      fallback={<p className="travel-agent-msg travel-agent-msg--assistant">正在打开图文预览…</p>}
    >
      <HoloSearchPlanPosterPanel
        plan={plan}
        savedSessionId={sessionId}
        onSystemShare={async () => 'shared'}
        copyPlainText={async (text) => (await copyTextToClipboard(text)) === 'copied'}
        onClose={closePoster}
      />
    </Suspense>
  ) : null;

  return (
    <div className={hostClass}>
      {railOpen ? (
        <section
          className={`travel-agent-panel${spiralMode && panelEntered ? ' is-entered' : ''}`}
          aria-labelledby={titleId}
        >
          <header className="travel-agent-panel__head">
            <div>
              <h2 id={titleId} className="travel-agent-panel__title">
                {spiralMode ? '蜗牛管家已就位' : '蜗牛管家'}
              </h2>
              <p className="travel-agent-panel__lead">
                {panelLeadText(spiralMode, flightMode, Boolean(plan))}
              </p>
              {!flightMode && !isEmbed && remembered ? (
                <p className="travel-agent-panel__memory">{remembered}</p>
              ) : null}
            </div>
            {isPage ? null : (
              <button
                type="button"
                className="travel-agent-panel__close"
                aria-label="关闭对话"
                onClick={closeChat}
              >
                ×
              </button>
            )}
          </header>

          {extraHeader}

          <div ref={logRef} className="travel-agent-panel__log">
            {hiddenCount ? (
              <button
                type="button"
                className="travel-agent-log-more"
                onClick={() => setLogCap((cap) => cap + 20)}
              >
                显示更早的 {hiddenCount} 条对话
              </button>
            ) : null}
            {visibleMessages.length ? (
              visibleMessages.map((item) =>
                spiralMode ? (
                  <article
                    key={item.id}
                    className={`travel-agent-msg travel-agent-row travel-agent-msg--${item.role}`}
                  >
                    <span className="travel-agent-row__avatar" aria-hidden>
                      {item.role === 'assistant' ? '蜗' : '我'}
                    </span>
                    <p className="travel-agent-row__text">{item.text}</p>
                    <button type="button" className="travel-agent-row__more" aria-label="更多">
                      ⋯
                    </button>
                  </article>
                ) : (
                  <p key={item.id} className={`travel-agent-msg travel-agent-msg--${item.role}`}>
                    {item.text}
                  </p>
                ),
              )
            ) : (
              <p className="travel-agent-msg travel-agent-msg--assistant">
                {emptyLogText(spiralMode, flightMode)}
              </p>
            )}
            {spiralMode && busy ? (
              <article
                className="travel-agent-msg travel-agent-row travel-agent-msg--assistant travel-agent-msg--pending"
                aria-live="polite"
              >
                <span className="travel-agent-row__avatar" aria-hidden>
                  蜗
                </span>
                <p className="travel-agent-row__text">
                  <span className="travel-agent-typing" aria-hidden>
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="travel-agent-pending-label">正在为你规划行程…</span>
                </p>
              </article>
            ) : null}
          </div>

          <div className="travel-agent-chips travel-agent-chips--primary">
            {chips.map((chip) => {
              const packId = 'packId' in chip ? (chip.packId as CaptionPackId) : null;
              const isScene = SNAIL_FLIGHT_SCENE_CHIPS.some((item) => item.label === chip.label);
              const isOn = packId != null && packId === captionPackId;
              return (
                <button
                  key={chip.label}
                  type="button"
                  className={`travel-agent-chip travel-agent-chip--next${isScene ? ' travel-agent-chip--scene' : ''}${flashChip === chip.label ? ' is-flash' : ''}${isOn ? ' is-active' : ''}`}
                  disabled={busy || (chipsNeedPlan && !plan)}
                  onClick={() => flashThenSend(chip.label, chip.text)}
                >
                  {chip.label}
                </button>
              );
            })}
            {onNarrate ? (
              <button type="button" className="travel-agent-chip" onClick={onNarrate}>
                {narrating ? '停止朗读' : '朗读'}
              </button>
            ) : null}
            {onRollback ? (
              <button type="button" className="travel-agent-chip" onClick={onRollback}>
                回退上一版
              </button>
            ) : null}
          </div>

          {spiralMode && plan ? (
            <button
              type="button"
              className="spiral-home__cta spiral-home__cta--panel spiral-home__cta--asset"
              disabled={busy}
              onClick={() => {
                useTravelAgentStore.setState({ posterOpen: true, open: true });
                noteLocal('', SPIRAL_ASSET_OPEN_COPY);
              }}
            >
              确认行程，生成图文资产包
            </button>
          ) : null}

          {extraFooter}

          {!flightMode && !isEmbed && plan ? (
            <p className="travel-agent-plan__meta">{KNOWLEDGE_VERIFY_TIP}</p>
          ) : null}

          {spiralMode && posterOpen && plan
            ? createPortal(
                <div
                  className="spiral-home__asset-modal"
                  role="dialog"
                  aria-label="图文旅行攻略资产包"
                >
                  <div className="spiral-home__asset-card">
                    <p className="spiral-home__asset-title">图文旅行攻略资产包</p>
                    <p className="spiral-home__asset-hint">
                      可滚动预览卡片；底部「保存图片」下载，成功后会有简短提示。
                    </p>
                    {posterPanel}
                  </div>
                </div>,
                document.body,
              )
            : null}

          {!flightMode && !spiralMode && posterOpen && plan ? (
            <div className="travel-agent-poster">{posterPanel}</div>
          ) : null}

          {!flightMode && shareOpen && plan ? (
            <Suspense fallback={null}>
              <HoloSearchPlanShareSheet
                plan={plan}
                savedSessionId={sessionId}
                onClose={closeShare}
              />
            </Suspense>
          ) : null}

          <form className="travel-agent-form" onSubmit={onSubmit}>
            <input
              value={draft}
              disabled={busy}
              onChange={(event) => setDraft(event.currentTarget.value)}
              placeholder={composerPlaceholder(spiralMode, flightMode, Boolean(plan))}
              aria-label="对管家说"
            />
            <button type="submit" disabled={!canSend}>
              {busy ? '…' : '发送'}
            </button>
          </form>
        </section>
      ) : null}

      {isPage ? null : (
        <button
          type="button"
          className="travel-agent-fab"
          aria-expanded={open}
          aria-controls={open ? titleId : undefined}
          aria-label={open ? '收起蜗牛管家' : '打开蜗牛管家'}
          onClick={() => (open ? closeChat() : openChat())}
        >
          {spiralMode ? '蜗' : '管家'}
        </button>
      )}
    </div>
  );
}
