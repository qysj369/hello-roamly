import { useCallback, useEffect, useId, useRef, useState } from 'react';
import TravelAgentHost from '@/components/agent/TravelAgentHost';
import HoloSearchPlanCityAside from '@/components/home/holo/HoloSearchPlanCityAside';
import HoloSearchPlanItinerary from '@/components/home/holo/HoloSearchPlanItinerary';
import HoloSearchPlanShareSheet, {
  toShareAutoExport,
  type SearchPlanAutoExportKind,
} from '@/components/home/holo/HoloSearchPlanShareSheet';
import { useHomeMapSearchVoice } from '@/hooks/map/useHomeMapSearchVoice';
import {
  consumeAutoNarrateNextPlan,
  speakPlanVoiceNarration,
  stopPlanVoiceNarration,
} from '@/lib/browser/planVoiceNarration';
import { buildSearchPlanSpeakText } from '@/lib/home/buildSearchPlanSpeakText';
import { formatSearchPlanCopyText } from '@/lib/home/formatSearchPlanCopyText';
import { searchPlanHeaderLine } from '@/lib/home/searchPlanShareCopy';
import { travelVoiceExportAck } from '@/lib/home/travelVoiceIntent';
import { useTravelAgentStore } from '@/stores/travelAgent/store';
import { getPlanCityAtmosphere } from '@/lib/home/planCityAtmosphere';
import {
  defaultSearchPlanTitle,
  ensureSharedSearchPlan,
  saveSearchStructuredPlan,
} from '@/lib/home/saveSearchStructuredPlan';
import { showGlobalApiError } from '@/stores/apiErrorStore';
import { toErrorMessage } from '@/utils/toErrorMessage';
import { copyTextToClipboard, copyTextToClipboardSync } from '@/utils/copyTextToClipboard';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

type HoloSearchPlanReadySheetProps = {
  plan: SearchStructuredPlan | null;
  pendingExport?: SearchPlanAutoExportKind | null;
  onPendingExportConsumed?: () => void;
  onPlanChange?: (plan: SearchStructuredPlan) => void;
  onClose: () => void;
};

type PlanShareFeedback = 'idle' | 'copied' | 'shared' | 'failed';

/**
 * 环节5：结构化行程卡片 + 三个局部增量按钮。
 */
export default function HoloSearchPlanReadySheet({
  plan,
  pendingExport = null,
  onPendingExportConsumed,
  onClose,
}: HoloSearchPlanReadySheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const copyAreaRef = useRef<HTMLTextAreaElement>(null);
  const titleId = useId();
  const open = Boolean(plan);
  const [copyFeedback, setCopyFeedback] = useState<PlanShareFeedback>('idle');
  const [shareFeedback, setShareFeedback] = useState<PlanShareFeedback>('idle');
  const [manualCopyText, setManualCopyText] = useState<string | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [savePublic, setSavePublic] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveDone, setSaveDone] = useState(false);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);
  const [autoExport, setAutoExport] = useState<SearchPlanAutoExportKind | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [actionHint, setActionHint] = useState('');
  const sendAgent = useTravelAgentStore((state) => state.send);
  const rollbackAgent = useTravelAgentStore((state) => state.rollback);
  const openChat = useTravelAgentStore((state) => state.openChat);
  const closeChat = useTravelAgentStore((state) => state.closeChat);
  const adoptPlan = useTravelAgentStore((state) => state.adoptPlan);
  const agentOpen = useTravelAgentStore((state) => state.open);
  const agentBusy = useTravelAgentStore((state) => state.busy);
  const canRollback = useTravelAgentStore((state) => state.snapshots.length > 0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (open) closeChat();
  }, [open, closeChat]);

  useEffect(() => {
    if (!open) {
      setCopyFeedback('idle');
      setShareFeedback('idle');
      setManualCopyText(null);
      setSaveOpen(false);
      setSaveBusy(false);
      setSaveDone(false);
      setSavedSessionId(null);
      setIsNarrating(false);
      setPosterOpen(false);
      setAutoExport(null);
      setMoreOpen(false);
      setActionHint('');
      stopPlanVoiceNarration();
      closeChat();
    }
  }, [open, closeChat]);

  useEffect(() => {
    if (copyFeedback === 'idle') return undefined;
    const timer = window.setTimeout(() => setCopyFeedback('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [copyFeedback]);

  useEffect(() => {
    if (shareFeedback === 'idle') return undefined;
    const timer = window.setTimeout(() => setShareFeedback('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [shareFeedback]);

  useEffect(() => {
    if (plan) {
      setSaveTitle(defaultSearchPlanTitle(plan));
      adoptPlan(plan);
    }
  }, [plan, adoptPlan]);

  useEffect(() => {
    if (!plan) return;
    if (!consumeAutoNarrateNextPlan()) return;
    setIsNarrating(true);
    speakPlanVoiceNarration(buildSearchPlanSpeakText(plan), {
      immediate: true,
      onEnd: () => setIsNarrating(false),
      onError: () => setIsNarrating(false),
    });
  }, [plan]);

  useEffect(() => {
    if (saveDone) {
      const timer = window.setTimeout(() => setSaveDone(false), 2000);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [saveDone]);

  const copyPlanText = useCallback(async (text: string): Promise<boolean> => {
    if (copyTextToClipboardSync(text) === 'copied') return true;
    return (await copyTextToClipboard(text)) === 'copied';
  }, []);

  const copyPlan = () => {
    if (!plan) return;
    const text = formatSearchPlanCopyText(plan);
    void (async () => {
      if (await copyPlanText(text)) {
        setCopyFeedback('copied');
        setManualCopyText(null);
        return;
      }
      setManualCopyText(text);
      setCopyFeedback('failed');
    })();
  };

  const persistShareLink = async (): Promise<string | null> => {
    if (!plan) return null;
    try {
      const sessionId = await ensureSharedSearchPlan(plan, savedSessionId);
      setSavedSessionId(sessionId);
      return sessionId;
    } catch (error) {
      showGlobalApiError(toErrorMessage(error, '分享链接生成失败，扫码将打开首页搜索'));
      return savedSessionId;
    }
  };

  const openSharePanel = () => {
    if (!plan || posterOpen) return;
    setSaveOpen(false);
    setMoreOpen(false);
    setShareFeedback('idle');
    closeChat();
    setPosterOpen(true);
    void persistShareLink();
  };

  const toggleSaveForm = () => {
    if (saveBusy) return;
    setMoreOpen(false);
    setSaveOpen(true);
    setPosterOpen(false);
  };

  const confirmSave = async () => {
    if (!plan || saveBusy) return;
    setSaveBusy(true);
    try {
      const result = await saveSearchStructuredPlan({
        plan,
        title: saveTitle,
        isPublic: savePublic,
        sessionId: savedSessionId ?? undefined,
      });
      setSavedSessionId(result.sessionId);
      setSaveDone(true);
      setSaveOpen(false);
    } catch (error) {
      showGlobalApiError(toErrorMessage(error, '保存失败，请稍后再试'));
    } finally {
      setSaveBusy(false);
    }
  };

  const toggleNarration = () => {
    if (!plan) return;
    if (isNarrating) {
      stopPlanVoiceNarration();
      setIsNarrating(false);
      setActionHint('已停止朗读');
      return;
    }
    const text = buildSearchPlanSpeakText(plan);
    if (!text.trim()) {
      setActionHint('暂无可朗读内容');
      showGlobalApiError('暂无可朗读内容');
      return;
    }
    setIsNarrating(true);
    setActionHint('正在朗读…');
    speakPlanVoiceNarration(text, {
      immediate: true,
      onEnd: () => {
        setIsNarrating(false);
        setActionHint('朗读结束');
      },
      onError: (message) => {
        setIsNarrating(false);
        setActionHint(message || '当前浏览器暂不支持朗读');
        showGlobalApiError(message || '当前浏览器暂不支持朗读');
      },
    });
  };

  const runRollback = () => {
    if (agentBusy) {
      setActionHint('正在改行程，稍后再回退');
      return;
    }
    if (!canRollback) {
      setActionHint('还没有上一版。先改一处，才能回退。');
      return;
    }
    rollbackAgent();
    setActionHint('已回退到上一版');
  };

  const openButler = () => {
    setMoreOpen(false);
    setSaveOpen(false);
    if (agentOpen) closeChat();
    else openChat();
  };

  const openEditInButler = () => {
    setMoreOpen(false);
    openChat();
    setActionHint('在管家里写要改的那一句，再发送。');
  };

  const cityAtmosphere = plan
    ? getPlanCityAtmosphere(plan.baseInfo.targetCity, plan)
    : null;

  const openExportPack = (kind: SearchPlanAutoExportKind) => {
    setSaveOpen(false);
    setAutoExport(kind);
    closeChat();
    setPosterOpen(true);
    void persistShareLink();
    speakPlanVoiceNarration(travelVoiceExportAck(kind), { immediate: true });
  };

  useEffect(() => {
    if (!pendingExport || !plan) return;
    const kind = pendingExport;
    onPendingExportConsumed?.();
    openExportPack(kind);
    // 只在外部语音下达导出指令时跑一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingExport, plan]);

  const planVoice = useHomeMapSearchVoice({
    disabled: !plan || agentBusy,
    markAutoNarrate: false,
    onRecognized: async (text) => {
      await sendAgent(text);
      const next = useTravelAgentStore.getState().plan;
      if (next) {
        speakPlanVoiceNarration(buildSearchPlanSpeakText(next), { immediate: true });
      }
    },
    onExportIntent: (kind) => {
      const mapped = toShareAutoExport(kind);
      if (mapped) {
        openExportPack(mapped);
        return;
      }
      setSaveOpen(false);
      closeChat();
      setPosterOpen(true);
      void persistShareLink();
    },
  });

  return (
    <dialog
      ref={dialogRef}
      className="holo-home__clarify-dialog holo-home__plan-sheet"
      aria-labelledby={titleId}
      onClose={onClose}
    >
      {plan ? (
        <div
          className={[
            'holo-home__plan-sheet-inner',
            cityAtmosphere && !posterOpen ? 'holo-home__plan-sheet-inner--split' : '',
            posterOpen ? 'holo-home__plan-sheet-inner--share' : '',
            !posterOpen && agentOpen ? 'holo-home__plan-sheet-inner--with-agent' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {posterOpen ? (
            <HoloSearchPlanShareSheet
              plan={plan}
              savedSessionId={savedSessionId}
              copiedOnOpen
              autoExport={autoExport}
              onExportDone={() => setAutoExport(null)}
              onClose={() => {
                setPosterOpen(false);
                setAutoExport(null);
              }}
            />
          ) : null}
          <div className="holo-home__plan-sheet-main">
          <div className="holo-home__plan-chrome">
          <div className="holo-home__clarify-head">
            <h3 id={titleId} className="holo-home__clarify-title">
              {plan.baseInfo.targetCity}{plan.baseInfo.days}天{plan.baseInfo.peopleType}
            </h3>
            <button type="button" className="holo-home__preview-close" aria-label="关闭" onClick={onClose}>
              ×
            </button>
          </div>

          <p className="holo-home__plan-summary">
            {searchPlanHeaderLine(plan)}
          </p>

          <div className="holo-home__plan-toolbar">
            <button
              type="button"
              className="holo-home__plan-increment holo-home__plan-increment--primary"
              aria-expanded={posterOpen}
              aria-haspopup="dialog"
              disabled={saveBusy}
              onClick={openSharePanel}
            >
              {shareFeedback === 'shared'
                ? '已打开分享'
                : shareFeedback === 'copied'
                  ? '已复制'
                  : shareFeedback === 'failed'
                    ? '分享失败'
                    : '发给朋友'}
            </button>
            <button
              type="button"
              className="holo-home__plan-increment"
              aria-expanded={agentOpen}
              onClick={openButler}
            >
              {agentOpen ? '收起蜗牛管家' : '打开蜗牛管家'}
            </button>
            <div className="holo-home__plan-more">
              <button
                type="button"
                className="holo-home__plan-increment"
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                onClick={() => setMoreOpen((openMore) => !openMore)}
              >
                更多
              </button>
              {moreOpen ? (
                <div
                  className="holo-home__plan-more-menu"
                  role="menu"
                  aria-label="更多行程操作"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="holo-home__plan-increment"
                    onClick={() => {
                      setMoreOpen(false);
                      copyPlan();
                    }}
                  >
                    {copyFeedback === 'copied' ? '已复制' : copyFeedback === 'failed' ? '复制失败' : '复制行程'}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="holo-home__plan-increment"
                    disabled={saveBusy}
                    onClick={toggleSaveForm}
                  >
                    {saveDone ? '已保存' : '保存行程'}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="holo-home__plan-increment"
                    onClick={() => {
                      setMoreOpen(false);
                      toggleNarration();
                    }}
                  >
                    {isNarrating ? '停止朗读' : '朗读'}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="holo-home__plan-increment"
                    onClick={() => {
                      setMoreOpen(false);
                      runRollback();
                    }}
                  >
                    回退上一版
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="holo-home__plan-increment"
                    onClick={openEditInButler}
                  >
                    只改这一处
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <p className="holo-home__plan-share-hint">{actionHint || '打开蜗牛管家，微调你的行程'}</p>
          {planVoice.active ? (
            <>
              <p className="holo-home__hero-search-status" role="status">
                {planVoice.error ||
                  planVoice.preview ||
                  planVoice.status ||
                  '可以说改成亲子、改成三天，或生成小红书图文'}
              </p>
              <button
                type="button"
                className="holo-home__plan-increment"
                disabled={planVoice.processing}
                onClick={() => planVoice.finishUtterance()}
              >
                说完了
              </button>
            </>
          ) : null}
          </div>
          {saveOpen ? (
            <div className="holo-home__plan-modal" role="dialog" aria-label="保存行程">
              <form
                className="holo-home__plan-modal-card"
                onSubmit={(event) => {
                  event.preventDefault();
                  void confirmSave();
                }}
              >
                <div className="holo-home__plan-poster-head">
                  <p className="holo-home__plan-label">保存行程</p>
                  <button
                    type="button"
                    className="holo-home__plan-ghost"
                    onClick={() => setSaveOpen(false)}
                  >
                    取消
                  </button>
                </div>
                <label className="holo-home__plan-save-field">
                  <span>方案名称</span>
                  <input
                    className="holo-home__plan-save-input"
                    value={saveTitle}
                    disabled={saveBusy}
                    onChange={(event) => setSaveTitle(event.target.value)}
                    placeholder="例如：杭州3天好友结伴"
                  />
                </label>
                <label className="holo-home__plan-save-check">
                  <input
                    type="checkbox"
                    checked={savePublic}
                    disabled={saveBusy}
                    onChange={(event) => setSavePublic(event.target.checked)}
                  />
                  <span>公开方案，其他蜗友可在发现页看到</span>
                </label>
                <button type="submit" className="holo-home__plan-increment" disabled={saveBusy}>
                  {saveBusy ? '保存中…' : '确认保存'}
                </button>
              </form>
            </div>
          ) : null}
          <textarea
            ref={copyAreaRef}
            className="holo-home__plan-copy-ghost"
            aria-hidden
            readOnly
            tabIndex={-1}
          />
          {manualCopyText ? (
            <div className="holo-home__plan-copy-fallback">
              <p className="holo-home__plan-muted">已选中全文，Ctrl+A / 长按后复制到微信即可。</p>
              <textarea
                className="holo-home__plan-copy-box"
                readOnly
                value={manualCopyText}
                onFocus={(event) => event.currentTarget.select()}
              />
            </div>
          ) : null}
          <HoloSearchPlanItinerary plan={plan} />
          </div>
          {cityAtmosphere ? <HoloSearchPlanCityAside atmosphere={cityAtmosphere} /> : null}
          {posterOpen ? null : (
            <TravelAgentHost
              layout="embed"
              narrating={isNarrating}
              onNarrate={toggleNarration}
              onRollback={runRollback}
            />
          )}
        </div>
      ) : null}
    </dialog>
  );
}
