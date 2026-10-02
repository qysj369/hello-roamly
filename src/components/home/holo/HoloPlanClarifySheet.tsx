import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useHomeMapSearchVoice } from '@/hooks/map/useHomeMapSearchVoice';
import { useI18n } from '@/i18n/useI18n';
import { parseTravelSearchIntent } from '@/lib/map/planQueryBuilder';
import {
  composePlanClarifyQuery,
  hasCompletePlanClarify,
  inferBareCityLabel,
  sanitizeClarifyCityLabel,
  usePlanClarifyStore,
  type PlanClarifyFields,
} from '@/stores/planClarify/store';
import { cn } from '@/utils/cn';

export type HoloPlanClarifyDraft = {
  destination?: string;
  baseQuery: string;
};

export type HoloPlanClarifyMeta = {
  city: string;
  days: number;
  party: string;
  pace: string;
  budgetYuan: number;
  preference: string;
};

type HoloPlanClarifySheetProps = {
  draft: HoloPlanClarifyDraft | null;
  onClose: () => void;
  /** 五项齐备后自动调用，无需二次点提交 */
  onConfirm: (composedQuery: string, meta: HoloPlanClarifyMeta) => void;
};

const DAY_OPTIONS = [1, 2, 3, 5] as const;
const PARTY_OPTIONS_ZH = ['单人', '情侣', '好友结伴', '亲子家庭'] as const;
const PARTY_OPTIONS_EN = ['Solo', 'Couple', 'Friends', 'Family'] as const;
const PACE_OPTIONS_ZH = ['松弛慢逛', '高效打卡'] as const;
const PACE_OPTIONS_EN = ['Slow stroll', 'Quick highlights'] as const;
const PREF_OPTIONS_ZH = ['城市人文', '自然风光', '美食探店'] as const;
const PREF_OPTIONS_EN = ['City culture', 'Nature', 'Food lanes'] as const;
const BUDGET_OPTIONS = [
  { yuan: 800, labelZh: '约 800', labelEn: '~¥800' },
  { yuan: 1500, labelZh: '约 1500', labelEn: '~¥1500' },
  { yuan: 2500, labelZh: '约 2500', labelEn: '~¥2500' },
  { yuan: 4000, labelZh: '约 4000', labelEn: '~¥4000' },
] as const;

type StepKey = 'city' | 'days' | 'party' | 'pace' | 'budget' | 'preference';

function parsePartyFromText(text: string, isEn: boolean): string | null {
  if (/亲子|带娃|小孩|孩子|宝宝/.test(text)) return isEn ? 'Family' : '亲子家庭';
  if (/情侣|两口|夫妻|蜜月/.test(text)) return isEn ? 'Couple' : '情侣';
  if (/好友|朋友|结伴|同学|同事/.test(text)) return isEn ? 'Friends' : '好友结伴';
  if (/单人|一个人|独自|一人行/.test(text)) return isEn ? 'Solo' : '单人';
  return null;
}

function snapBudgetYuan(raw: number | null): number | null {
  if (raw == null || !Number.isFinite(raw) || raw <= 0) return null;
  let best: number = BUDGET_OPTIONS[0]!.yuan;
  let bestDiff = Math.abs(raw - best);
  for (const option of BUDGET_OPTIONS) {
    const diff = Math.abs(raw - option.yuan);
    if (diff < bestDiff) {
      best = option.yuan;
      bestDiff = diff;
    }
  }
  return best;
}

function normalizeClarifyDays(raw: number | null): number | null {
  if (raw == null || !Number.isFinite(raw)) return null;
  const days = Math.round(raw);
  if (days < 1 || days > 14) return null;
  return days;
}

function parseDaysFromSpeech(text: string): number | null {
  const fromIntent = normalizeClarifyDays(parseTravelSearchIntent(text).days);
  if (fromIntent) return fromIntent;
  if (/一天|一日|1\s*天/.test(text)) return 1;
  if (/两天|二天|2\s*天/.test(text)) return 2;
  if (/三天|3\s*天/.test(text)) return 3;
  if (/四天|4\s*天/.test(text)) return 4;
  if (/五天|5\s*天/.test(text)) return 5;
  return null;
}

function parseBudgetFromSpeech(text: string): number | null {
  const snapped = snapBudgetYuan(parseTravelSearchIntent(text).budgetYuan);
  if (snapped) return snapped;
  if (/四千|4000|宽松/.test(text)) return 4000;
  if (/两千五|二千五|2500/.test(text)) return 2500;
  if (/一千五|一千五百|1500/.test(text)) return 1500;
  if (/八百|800|省钱|穷游/.test(text)) return 800;
  return null;
}

function parsePreferenceFromText(text: string, isEn: boolean): string | null {
  if (/亲子时光|带娃出行|带小孩|家庭出游|family time/i.test(text)) {
    return isEn ? 'Family time' : '亲子时光';
  }
  if (/美食探店|探店|觅食|海鲜|美食/i.test(text)) return isEn ? 'Food lanes' : '美食探店';
  if (/城市人文|人文慢逛|古巷|老街慢|博物馆|culture stroll|heritage/i.test(text)) {
    return isEn ? 'City culture' : '城市人文';
  }
  if (/自然风光|自然山水|风景|海景|徒步|茶山|环湖|nature hike/i.test(text)) return isEn ? 'Nature' : '自然风光';
  if (/近郊轻游|周末轻游|nearby soft/i.test(text)) return isEn ? 'Nearby soft trip' : '近郊轻游';
  return null;
}

function applySpeechToClarifyStep(
  step: StepKey,
  text: string,
  isEn: boolean,
): Partial<PlanClarifyFields> | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (step === 'city') {
    const city = parseCityFromText(trimmed) || sanitizeClarifyCityLabel(trimmed);
    return city ? { city } : null;
  }
  if (step === 'days') {
    const days = parseDaysFromSpeech(trimmed);
    return days != null ? { days } : null;
  }
  if (step === 'party') {
    const party = parsePartyFromText(trimmed, isEn);
    return party ? { party } : null;
  }
  if (step === 'pace') {
    if (/高效|打卡|赶场/.test(trimmed)) return { pace: isEn ? 'Quick highlights' : '高效打卡' };
    if (/松弛|慢逛|慢慢/.test(trimmed)) return { pace: isEn ? 'Slow stroll' : '松弛慢逛' };
    return null;
  }
  if (step === 'budget') {
    const budgetYuan = parseBudgetFromSpeech(trimmed);
    return budgetYuan != null ? { budgetYuan } : null;
  }
  if (step === 'preference') {
    const preference = parsePreferenceFromText(trimmed, isEn);
    return preference ? { preference } : null;
  }
  return null;
}

function parseCityFromText(text: string, fallback?: string): string | null {
  const intent = parseTravelSearchIntent(text);
  const fromIntent = sanitizeClarifyCityLabel(intent.destinationHint);
  if (fromIntent) return fromIntent;
  const fromFallback = sanitizeClarifyCityLabel(fallback);
  if (fromFallback) return fromFallback;
  const bare = inferBareCityLabel(text);
  if (bare) return bare;
  const m = text.match(/去([\u4e00-\u9fff]{2,8})/);
  return sanitizeClarifyCityLabel(m?.[1] ?? null);
}

function resolveNextStep(fields: PlanClarifyFields): StepKey | null {
  if (!fields.city?.trim()) return 'city';
  if (fields.days == null) return 'days';
  if (!fields.party?.trim()) return 'party';
  if (!fields.pace?.trim()) return 'pace';
  if (fields.budgetYuan == null) return 'budget';
  if (!fields.preference?.trim()) return 'preference';
  return null;
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="holo-home__voice-icon">
      <rect
        x="9"
        y="3.5"
        width="6"
        height="11"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.5 11.5a5.5 5.5 0 0 0 11 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M12 17v3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** 轻量分步追问：一次只问一项（城/天/人/预算/偏好）；齐后自动合并生成 */
export default function HoloPlanClarifySheet({
  draft,
  onClose,
  onConfirm,
}: HoloPlanClarifySheetProps) {
  const { locale, messages: t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const open = Boolean(draft);
  const isEn = locale === 'en';
  const [fields, setFields] = useState<PlanClarifyFields>({
    city: null,
    days: null,
    party: null,
    pace: null,
    budgetYuan: null,
    preference: null,
  });
  const [cityInput, setCityInput] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const confirmedRef = useRef(false);

  const step = resolveNextStep(fields);
  const stepRef = useRef(step);
  stepRef.current = step;

  const mergeFields = useCallback((partial: Partial<PlanClarifyFields>) => {
    setFields((prev) => {
      const next = { ...prev, ...partial };
      usePlanClarifyStore.getState().patch(partial);
      return next;
    });
  }, []);

  const onClarifySpeech = useCallback(
    (text: string) => {
      const current = stepRef.current;
      if (!current) return;
      const partial = applySpeechToClarifyStep(current, text, isEn);
      if (!partial) {
        setHint(
          isEn
            ? 'Didn’t catch that — tap a choice above, or try again'
            : '没听清这一步：请点选上方选项，或再说一次',
        );
        return;
      }
      setHint(null);
      if (partial.city) setCityInput(partial.city);
      mergeFields(partial);
    },
    [isEn, mergeFields],
  );

  const clarifyVoice = useHomeMapSearchVoice({
    onRecognized: onClarifySpeech,
    disabled: !open || !step,
    markAutoNarrate: false,
  });

  useEffect(() => {
    if (!open) {
      clarifyVoice.stop();
    }
    // 仅随弹窗开关停麦，避免依赖整个 voice 对象
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !draft) return;
    confirmedRef.current = false;
    const intent = parseTravelSearchIntent(draft.baseQuery);
    const city =
      sanitizeClarifyCityLabel(draft.destination) ||
      sanitizeClarifyCityLabel(intent.destinationHint) ||
      parseCityFromText(draft.baseQuery) ||
      null;
    // 从首句语音/文字预填已识别项，只追问缺的；避免「说了两天却又问天数」
    const seeded: PlanClarifyFields = {
      city,
      days: normalizeClarifyDays(intent.days),
      party: parsePartyFromText(draft.baseQuery, isEn),
      pace: /高效|打卡|赶场/.test(draft.baseQuery)
        ? isEn
          ? 'Quick highlights'
          : '高效打卡'
        : /松弛|慢逛/.test(draft.baseQuery)
          ? isEn
            ? 'Slow stroll'
            : '松弛慢逛'
          : null,
      budgetYuan: snapBudgetYuan(intent.budgetYuan),
      preference: parsePreferenceFromText(draft.baseQuery, isEn),
    };
    setFields(seeded);
    setCityInput(city ?? '');
    setHint(null);
    usePlanClarifyStore.getState().patch(seeded);
  }, [open, draft, isEn]);

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
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const onConfirmRef = useRef(onConfirm);
  onConfirmRef.current = onConfirm;

  /** 分层追问齐备 → 立刻进入生成（用 ref，避免 onConfirm 抖动清定时器后卡死） */
  useEffect(() => {
    if (!open || !draft || !hasCompletePlanClarify(fields) || confirmedRef.current) return;
    if (
      fields.city == null ||
      fields.days == null ||
      fields.party == null ||
      fields.pace == null ||
      fields.budgetYuan == null ||
      fields.preference == null
    ) {
      return;
    }
    const cleanCity = sanitizeClarifyCityLabel(fields.city) || fields.city;
    const composed = composePlanClarifyQuery({ ...fields, city: cleanCity }, draft.baseQuery);
    const payload = {
      city: cleanCity,
      days: fields.days,
      party: fields.party,
      pace: fields.pace,
      budgetYuan: fields.budgetYuan,
      preference: fields.preference,
    };
    confirmedRef.current = true;
    // 同步跳转，不再依赖 280ms 定时器（移动端易被打断）
    onConfirmRef.current(composed, payload);
  }, [open, draft, fields]);

  const partyOptions = isEn ? PARTY_OPTIONS_EN : PARTY_OPTIONS_ZH;
  const paceOptions = isEn ? PACE_OPTIONS_EN : PACE_OPTIONS_ZH;
  const prefOptions = isEn ? PREF_OPTIONS_EN : PREF_OPTIONS_ZH;

  const coastalCity = /青岛|大连|厦门|烟台|威海/.test(fields.city ?? '');
  const stepHint =
    step === 'city'
      ? t.clarify.stepCity
      : step === 'days'
        ? t.clarify.stepDays
        : step === 'party'
          ? coastalCity && !isEn
            ? '这次是情侣、单人，还是和朋友一起？'
            : t.clarify.stepParty
          : step === 'pace'
            ? isEn
              ? 'Slow stroll, or a quicker highlight day?'
              : '这次想松弛慢逛，还是高效打卡？'
          : step === 'budget'
            ? t.clarify.stepBudget
            : step === 'preference'
              ? coastalCity && !isEn
                ? '更想吃海鲜、看风景，还是老城闲逛？点选一个偏好。'
                : t.clarify.stepPreference
              : t.clarify.hintReady;

  const commitCity = () => {
    const value = sanitizeClarifyCityLabel(cityInput) || cityInput.trim();
    if (!value) {
      setHint(isEn ? 'Which city are we wandering?' : '想去哪一座城慢慢逛？');
      return;
    }
    setHint(null);
    mergeFields({ city: value });
  };

  const resetCity = () => {
    confirmedRef.current = false;
    setHint(null);
    setCityInput(fields.city ?? '');
    mergeFields({ city: null, days: null, party: null, pace: null, budgetYuan: null, preference: null });
  };

  return (
    <dialog
      ref={dialogRef}
      className="holo-home__clarify-dialog holo-home__clarify-dialog--lite"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {draft && step ? (
        <div className="holo-home__clarify-panel">
          <div className="holo-home__clarify-head">
            <h3 id={titleId} className="holo-home__clarify-title">
              {t.clarify.title}
            </h3>
            <button
              type="button"
              className="holo-home__preview-close"
              aria-label={t.search.close}
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <p className="holo-home__clarify-hint">{hint || stepHint}</p>

          {fields.city && step && step !== 'city' ? (
            <p className="holo-home__clarify-dest-row" aria-live="polite">
              <span>{isEn ? `To · ${fields.city}` : `目的地 · ${fields.city}`}</span>
              <button type="button" className="holo-home__clarify-change-city" onClick={resetCity}>
                {isEn ? 'Change' : '更换'}
              </button>
            </p>
          ) : null}

          {step === 'city' ? (
            <div className="holo-home__clarify-group is-focus">
              <p className="holo-home__clarify-label">{t.clarify.city}</p>
              <div className="holo-home__clarify-city-row">
                <input
                  type="text"
                  className="holo-home__clarify-city-input"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder={isEn ? 'e.g. Hangzhou' : '例如：杭州'}
                  aria-label={t.clarify.city}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitCity();
                    }
                  }}
                />
                <button type="button" className="holo-home__clarify-chip is-active" onClick={commitCity}>
                  {isEn ? 'OK' : '好的'}
                </button>
              </div>
            </div>
          ) : null}

          {step === 'days' ? (
            <div className="holo-home__clarify-group is-focus">
              <p className="holo-home__clarify-label">{t.clarify.days}</p>
              <div className="holo-home__clarify-chips" role="group" aria-label={t.clarify.days}>
                {DAY_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className="holo-home__clarify-chip"
                    onClick={() => {
                      setHint(null);
                      mergeFields({ days: d });
                    }}
                  >
                    {isEn ? `${d}d` : `${d}天`}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 'party' ? (
            <div className="holo-home__clarify-group is-focus">
              <p className="holo-home__clarify-label">{t.clarify.party}</p>
              <div className="holo-home__clarify-chips" role="group" aria-label={t.clarify.party}>
                {partyOptions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="holo-home__clarify-chip"
                    onClick={() => {
                      setHint(null);
                      mergeFields({ party: p });
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 'pace' ? (
            <div className="holo-home__clarify-group is-focus">
              <p className="holo-home__clarify-label">{isEn ? 'Pace' : '出行节奏'}</p>
              <div className="holo-home__clarify-chips" role="group" aria-label={isEn ? 'Pace' : '出行节奏'}>
                {paceOptions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="holo-home__clarify-chip"
                    onClick={() => {
                      setHint(null);
                      mergeFields({ pace: p });
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 'budget' ? (
            <div className="holo-home__clarify-group is-focus">
              <p className="holo-home__clarify-label">{t.clarify.budget}</p>
              <div className="holo-home__clarify-chips" role="group" aria-label={t.clarify.budget}>
                {BUDGET_OPTIONS.map((b) => (
                  <button
                    key={b.yuan}
                    type="button"
                    className="holo-home__clarify-chip"
                    onClick={() => {
                      setHint(null);
                      mergeFields({ budgetYuan: b.yuan });
                    }}
                  >
                    {isEn ? b.labelEn : b.labelZh}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 'preference' ? (
            <div className="holo-home__clarify-group is-focus">
              <p className="holo-home__clarify-label">{t.clarify.preference}</p>
              <div className="holo-home__clarify-chips" role="group" aria-label={t.clarify.preference}>
                {prefOptions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="holo-home__clarify-chip"
                    onClick={() => {
                      setHint(null);
                      mergeFields({ preference: p });
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="holo-home__clarify-voice">
            <button
              type="button"
              className={cn(
                'holo-home__voice-btn',
                clarifyVoice.active && 'is-active',
              )}
              disabled={clarifyVoice.processing && !clarifyVoice.active}
              aria-label={clarifyVoice.active ? t.voice.closeVoice : t.voice.openVoice}
              aria-pressed={clarifyVoice.active}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                clarifyVoice.toggle();
              }}
            >
              {clarifyVoice.active ? <span className="holo-home__voice-ripple" aria-hidden /> : null}
              <MicIcon />
            </button>
            <p className="holo-home__clarify-voice-hint" role="status">
              {clarifyVoice.error ||
                clarifyVoice.status ||
                (clarifyVoice.active
                  ? isEn
                    ? 'Listening… say this step’s answer, then pause'
                    : '正在听…请说本步答案，说完稍停'
                  : isEn
                    ? 'Tap a choice above, or tap mic to speak this step'
                    : '请点选上方选项，或点麦克风再说本步（如「亲子」）')}
            </p>
            {clarifyVoice.active && clarifyVoice.requiresManualFinish ? (
              <button
                type="button"
                className="holo-home__voice-finish"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  clarifyVoice.finishUtterance();
                }}
              >
                {t.voice.finish}
              </button>
            ) : null}
          </div>

          <div className="holo-home__clarify-foot">
            <button type="button" className="holo-home__clarify-skip" onClick={onClose}>
              {t.clarify.skip}
            </button>
          </div>
        </div>
      ) : draft &&
        !step &&
        fields.city &&
        fields.days != null &&
        fields.party &&
        fields.pace &&
        fields.budgetYuan != null &&
        fields.preference ? (
        <div className="holo-home__clarify-panel">
          <p className="holo-home__clarify-hint">{t.clarify.hintReady}</p>
          <div className="holo-home__clarify-foot">
            <button
              type="button"
              className="holo-home__clarify-chip is-active"
              onClick={() => {
                if (confirmedRef.current) return;
                confirmedRef.current = true;
                const cleanCity = sanitizeClarifyCityLabel(fields.city) || fields.city!;
                onConfirm(composePlanClarifyQuery({ ...fields, city: cleanCity }, draft.baseQuery), {
                  city: cleanCity,
                  days: fields.days!,
                  party: fields.party!,
                  pace: fields.pace!,
                  budgetYuan: fields.budgetYuan!,
                  preference: fields.preference!,
                });
              }}
            >
              {isEn ? 'Generate plan' : '开始生成攻略'}
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
