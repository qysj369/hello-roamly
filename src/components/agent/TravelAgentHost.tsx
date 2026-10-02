import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import HoloSearchPlanPosterPanel from '@/components/home/holo/HoloSearchPlanPosterPanel';
import HoloSearchPlanShareSheet from '@/components/home/holo/HoloSearchPlanShareSheet';
import { KNOWLEDGE_VERIFY_TIP } from '@/lib/agent/cityTravelKnowledge';
import { buildAgentNextActions, describeRememberedPreference } from '@/lib/agent/travelAgentCopy';
import { searchPlanHeaderLine } from '@/lib/home/searchPlanShareCopy';
import { paths } from '@/router/paths';
import { useTravelAgentStore } from '@/stores/travelAgent/store';
import { copyTextToClipboard } from '@/utils/copyTextToClipboard';
import '@/styles/travel-agent.css';

const MORE_TOOLS = [
  { tool: 'save' as const, label: '保存行程' },
  { tool: 'poster' as const, label: '生成海报' },
  { tool: 'recalc' as const, label: '重算预算' },
];

export default function TravelAgentHost() {
  const titleId = useId();
  const logRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');
  const open = useTravelAgentStore((state) => state.open);
  const busy = useTravelAgentStore((state) => state.busy);
  const messages = useTravelAgentStore((state) => state.messages);
  const plan = useTravelAgentStore((state) => state.plan);
  const posterOpen = useTravelAgentStore((state) => state.posterOpen);
  const shareOpen = useTravelAgentStore((state) => state.shareOpen);
  const sessionId = useTravelAgentStore((state) => state.sessionId);
  const openChat = useTravelAgentStore((state) => state.openChat);
  const closeChat = useTravelAgentStore((state) => state.closeChat);
  const send = useTravelAgentStore((state) => state.send);
  const runTool = useTravelAgentStore((state) => state.runTool);
  const rollback = useTravelAgentStore((state) => state.rollback);
  const canRollback = useTravelAgentStore((state) => state.snapshots.length > 0);
  const closePoster = useTravelAgentStore((state) => state.closePoster);
  const closeShare = useTravelAgentStore((state) => state.closeShare);
  const remembered = describeRememberedPreference();
  const nextActions = buildAgentNextActions(plan);

  useEffect(() => {
    const node = logRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, open]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    void send(text);
  };

  return (
    <div className="travel-agent-host">
      {open ? (
        <section className="travel-agent-panel" aria-labelledby={titleId}>
          <header className="travel-agent-panel__head">
            <div>
              <h2 id={titleId} className="travel-agent-panel__title">
                蜗牛管家
              </h2>
              {remembered ? <p className="travel-agent-panel__memory">{remembered}</p> : null}
            </div>
            <button type="button" className="travel-agent-panel__close" aria-label="关闭对话" onClick={closeChat}>
              ×
            </button>
          </header>

          <div ref={logRef} className="travel-agent-panel__log">
            {messages.map((item) => (
              <p key={item.id} className={`travel-agent-msg travel-agent-msg--${item.role}`}>
                {item.text}
              </p>
            ))}
          </div>

          {plan ? (
            <div className="travel-agent-plan">
              <p className="travel-agent-plan__meta">{searchPlanHeaderLine(plan)}</p>
              <ol>
                {plan.dayList.map((day) => (
                  <li key={day.day}>
                    D{day.day} {day.title}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <div className="travel-agent-chips">
            {nextActions.map((action) => (
              <button
                key={action.id}
                type="button"
                className="travel-agent-chip travel-agent-chip--next"
                disabled={busy}
                onClick={() => {
                  if (action.kind === 'tool') {
                    void runTool(action.tool);
                    return;
                  }
                  void send(action.text);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>

          {plan ? (
            <div className="travel-agent-tools">
              {MORE_TOOLS.map((item) => (
                <button
                  key={item.tool}
                  type="button"
                  className="travel-agent-chip"
                  disabled={busy}
                  onClick={() => void runTool(item.tool)}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                className="travel-agent-chip"
                disabled={busy}
                onClick={() => void send('换馆子')}
              >
                换馆子
              </button>
              <button type="button" className="travel-agent-chip" disabled={busy || !canRollback} onClick={rollback}>
                回退上一版
              </button>
              <button
                type="button"
                className="travel-agent-chip"
                disabled={busy}
                onClick={() => void send('重置偏好')}
              >
                重置偏好
              </button>
              <Link
                className="travel-agent-chip"
                to={`${paths.feedback}?category=city_error&city=${encodeURIComponent(plan.baseInfo.targetCity)}`}
              >
                信息报错
              </Link>
            </div>
          ) : null}
          {plan ? <p className="travel-agent-plan__meta">{KNOWLEDGE_VERIFY_TIP}</p> : null}

          {posterOpen && plan ? (
            <div className="travel-agent-poster">
              <HoloSearchPlanPosterPanel
                plan={plan}
                savedSessionId={sessionId}
                onSystemShare={async () => 'shared'}
                copyPlainText={async (text) => (await copyTextToClipboard(text)) === 'copied'}
                onClose={closePoster}
              />
            </div>
          ) : null}

          {shareOpen && plan ? (
            <HoloSearchPlanShareSheet plan={plan} savedSessionId={sessionId} onClose={closeShare} />
          ) : null}

          <form className="travel-agent-form" onSubmit={onSubmit}>
            <input
              value={draft}
              disabled={busy}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={plan ? '改行程、避雨或发给朋友' : '例如：杭州3天亲子'}
              aria-label="对管家说"
            />
            <button type="submit" disabled={busy || !draft.trim()}>
              {busy ? '…' : '发送'}
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="travel-agent-fab"
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
        onClick={() => (open ? closeChat() : openChat())}
      >
        问蜗牛
      </button>
    </div>
  );
}
