import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserMapOrigin } from '@/hooks/map/useUserMapOrigin';
import { useI18n } from '@/i18n/useI18n';
import { navigateHoloPlanSearch } from '@/lib/home/launchHoloPlanSearch';
import { showGlobalApiError } from '@/stores/apiErrorStore';
import { useUiStore } from '@/stores';

type HoloSearchDialogProps = {
  open: boolean;
  onClose: () => void;
  /** 打开时预填（如导航栏已输入的关键词） */
  initialQuery?: string;
  /** 提交后交给首页追问条；不传则直接进 AI */
  onRequestPlan?: (query: string) => void;
};

/** 首页搜索弹窗：出发地 + 目的地 → AI 顾问生成穷游攻略 */
export default function HoloSearchDialog({
  open,
  onClose,
  initialQuery = '',
  onRequestPlan,
}: HoloSearchDialogProps) {
  const { messages: t } = useI18n();
  const navigate = useNavigate();
  const setSearchQuery = useUiStore((state) => state.setSearchQuery);
  const { origin: userOrigin } = useUserMapOrigin();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      setQuery(initialQuery);
      setHint(null);
      if (!dialog.open) dialog.showModal();
      window.setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 40);
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, initialQuery]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  /** 软键盘弹出时上移弹窗，保证「生成穷游攻略」按钮可见 */
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const baselineHeight = Math.max(
      window.innerHeight,
      window.visualViewport?.height ?? 0,
      document.documentElement.clientHeight,
    );

    const syncKeyboardOffset = () => {
      const vv = window.visualViewport;
      const visualHeight = vv?.height ?? window.innerHeight;
      const visualBottom = vv ? vv.height + vv.offsetTop : window.innerHeight;
      const vvOverlap = vv
        ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
        : 0;
      const shrinkOverlap = Math.max(0, baselineHeight - visualBottom);
      const overlap = Math.max(vvOverlap, shrinkOverlap);
      dialog.style.setProperty('--holo-kb-inset', `${Math.round(overlap)}px`);
      dialog.style.setProperty('--holo-vv-height', `${Math.round(visualHeight)}px`);
      if (overlap > 40) {
        submitRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    };

    const vv = window.visualViewport;
    vv?.addEventListener('resize', syncKeyboardOffset);
    vv?.addEventListener('scroll', syncKeyboardOffset);
    window.addEventListener('resize', syncKeyboardOffset);
    window.addEventListener('focusin', syncKeyboardOffset);
    syncKeyboardOffset();

    return () => {
      vv?.removeEventListener('resize', syncKeyboardOffset);
      vv?.removeEventListener('scroll', syncKeyboardOffset);
      window.removeEventListener('resize', syncKeyboardOffset);
      window.removeEventListener('focusin', syncKeyboardOffset);
      dialog.style.removeProperty('--holo-kb-inset');
    };
  }, [open]);

  const submit = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setHint(t.search.emptyHint);
      showGlobalApiError(t.search.emptyHint);
      inputRef.current?.focus();
      return;
    }
    setHint(null);
    setSearchQuery(trimmed);
    onClose();
    if (onRequestPlan) {
      onRequestPlan(trimmed);
      return;
    }
    navigateHoloPlanSearch(navigate, {
      query: trimmed,
      originLabel: userOrigin?.label,
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className="holo-home__search-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <form
        ref={panelRef}
        className="holo-home__search-dialog-panel"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="holo-home__search-dialog-head">
          <h2 id={titleId} className="holo-home__search-dialog-title">
            {t.search.title}
          </h2>
          <button
            type="button"
            className="holo-home__search-dialog-close"
            aria-label={t.search.close}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {userOrigin?.label ? (
          <p className="holo-home__search-dialog-origin">
            {t.search.fromLabel}：{userOrigin.label}
          </p>
        ) : (
          <p className="holo-home__search-dialog-origin holo-home__search-dialog-origin--muted">
            {t.search.originHint}
          </p>
        )}
        <label className="holo-home__search-dialog-label" htmlFor="holo-home-search-input">
          {t.search.title}
        </label>
        <input
          ref={inputRef}
          id="holo-home-search-input"
          type="search"
          className="holo-home__search-dialog-input"
          value={query}
          placeholder={t.search.placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            if (hint) setHint(null);
          }}
          autoComplete="off"
          enterKeyHint="go"
        />
        {hint ? (
          <p className="holo-home__search-dialog-hint" role="alert">
            {hint}
          </p>
        ) : null}
        <button ref={submitRef} type="submit" className="holo-home__search-dialog-submit">
          {t.search.submitPlan}
        </button>
      </form>
    </dialog>
  );
}
