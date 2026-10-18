import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import type { SearchExtractParams } from '@/lib/home/extractSearchParams';
import {
  SEARCH_ASK_PROMPTS,
  applySearchAskAnswer,
  getMissRequiredField,
  type SearchRequiredKey,
} from '@/lib/home/searchAskRequired';

type HoloSearchAskSheetProps = {
  params: SearchExtractParams | null;
  onAnswer: (next: SearchExtractParams) => void;
  onClose: () => void;
};

const PLACEHOLDERS: Record<SearchRequiredKey, string> = {
  targetCity: '例如：杭州',
  days: '例如：3天',
  peopleType: '例如：好友结伴',
};

/**
 * 首页搜索分层追问：一次只问一个必填项，纯前端补齐，不调大模型。
 */
export default function HoloSearchAskSheet({ params, onAnswer, onClose }: HoloSearchAskSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const field = params ? getMissRequiredField(params)[0] : undefined;
  const open = Boolean(params && field);
  const [draft, setDraft] = useState('');
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    setDraft('');
    setHint(null);
  }, [field, open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
      window.setTimeout(() => inputRef.current?.focus(), 0);
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const commit = () => {
    if (!params || !field) return;
    const next = applySearchAskAnswer(params, field, draft);
    if (!next) {
      setHint('请先填写这一项');
      return;
    }
    setHint(null);
    setDraft('');
    onAnswer(next);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    commit();
  };

  return (
    <dialog
      ref={dialogRef}
      className="holo-home__clarify-dialog holo-home__clarify-dialog--lite holo-home__ask-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {open && field ? (
        <form className="holo-home__clarify-panel" onSubmit={onSubmit}>
          <div className="holo-home__clarify-head">
            <h3 id={titleId} className="holo-home__clarify-title">
              {SEARCH_ASK_PROMPTS[field]}
            </h3>
            <button
              type="button"
              className="holo-home__preview-close"
              aria-label="关闭"
              onClick={onClose}
            >
              ×
            </button>
          </div>
          {params?.targetCity && field !== 'targetCity' ? (
            <p className="holo-home__clarify-dest-row">目的地 · {params.targetCity}</p>
          ) : null}
          {hint ? <p className="holo-home__clarify-hint">{hint}</p> : null}
          <div className="holo-home__clarify-group is-focus">
            <div className="holo-home__clarify-city-row">
              <input
                ref={inputRef}
                type="text"
                className="holo-home__clarify-city-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={PLACEHOLDERS[field]}
                aria-label={SEARCH_ASK_PROMPTS[field]}
                enterKeyHint="done"
              />
              <button type="submit" className="holo-home__ask-confirm">
                确认
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </dialog>
  );
}
