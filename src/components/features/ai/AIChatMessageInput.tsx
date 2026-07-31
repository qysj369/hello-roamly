import { AudioLines, Loader2, Mic, Send, Square } from 'lucide-react';
import { type FormEvent, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import AIChatHotCityPicker from '@/components/features/ai/AIChatHotCityPicker';
import { formatInputLevelPercent } from '@/lib/browser/advisorMicrophoneDevices';
import { advisorSpeechBrowserHint } from '@/lib/browser/advisorSpeechBrowser';
import { useAdvisorReplySpeech } from '@/hooks/ai/useAdvisorReplySpeech';
import { useAdvisorSpeechInput } from '@/hooks/ai/useAdvisorSpeechInput';
import { useAdvisorVoiceDialog } from '@/hooks/ai/useAdvisorVoiceDialog';
import { createDefaultTravelParams } from '@/hooks/ai/useAiTravelParams';
import type { AiChatContext } from '@/types/domain/aiChat';
import type { AiTravelParams } from '@/types/domain/aiTravelParams';
import { cn } from '@/utils/cn';

export type AIChatMessageInputHandle = {
  fillDraft: (text: string) => void;
  focus: () => void;
};

export type AIChatMessageInputProps = {
  composerId: string;
  isLoading: boolean;
  isStreaming?: boolean;
  /** 额外禁用（如正在生成计划卡片） */
  isBusy?: boolean;
  onSend: (text: string) => void;
  onAbortStream?: () => void;
  /** 最新一条顾问回复（供语音对话模式 TTS 朗读） */
  assistantReplyText?: string | null;
  placeholder?: string;
  travelParams?: AiTravelParams;
  context?: AiChatContext;
  showHotCityPicker?: boolean;
  variant?: 'default' | 'capsule';
};

const AIChatMessageInput = forwardRef<AIChatMessageInputHandle, AIChatMessageInputProps>(
function AIChatMessageInput(
{
  composerId,
  isLoading,
  isStreaming = false,
  isBusy = false,
  onSend,
  onAbortStream,
  assistantReplyText = null,
  placeholder = '输入目的地、预算或任何旅行问题…',
  travelParams,
  context,
  showHotCityPicker = true,
  variant = 'default',
}: AIChatMessageInputProps,
ref,
) {
  const resolvedTravelParams = travelParams ?? createDefaultTravelParams(context);
  const [draft, setDraft] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speech = useAdvisorSpeechInput({
    onResult: (text) => {
      setDraft((current) => (current.trim() ? `${current.trim()} ${text}` : text));
      window.requestAnimationFrame(() => textareaRef.current?.focus());
    },
  });
  const isReplying = isLoading || isStreaming;
  const [replySpeakError, setReplySpeakError] = useState<string | null>(null);
  const voiceDialog = useAdvisorVoiceDialog({
    onSend,
    isPaused: isLoading || isStreaming || isBusy,
  });
  const replySpeech = useAdvisorReplySpeech({
    active: voiceDialog.active,
    isReplying,
    assistantReplyText,
    onSpeakingChange: undefined,
    onSpeakError: setReplySpeakError,
  });
  const inputDisabled = isLoading || isBusy || speech.transcribing;
  const hintLine =
    voiceDialog.error ||
    replySpeakError ||
    (voiceDialog.processing ? voiceDialog.status || voiceDialog.preview : null) ||
    voiceDialog.preview ||
    (replySpeech.isSpeaking ? '顾问正在朗读回复…' : voiceDialog.status) ||
    speech.error ||
    speech.status ||
    null;

  useImperativeHandle(ref, () => ({
    fillDraft: (text: string) => {
      setDraft(text.trim());
      window.requestAnimationFrame(() => textareaRef.current?.focus());
    },
    focus: () => {
      textareaRef.current?.focus();
    },
  }));

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || inputDisabled) {
      return;
    }
    onSend(trimmed);
    setDraft('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(draft);
  }

  return (
    <footer
      className={cn(
        'shrink-0 border-t px-3 py-3',
        variant === 'capsule'
          ? 'capsule-ai-composer border-[rgba(0,255,255,0.2)] bg-[#141E30]/82'
          : 'border-slate-200/90 bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md',
      )}
      style={{ minHeight: 'var(--ai-chat-composer-min-h, 7.5rem)' }}
      role="region"
      aria-label="消息输入"
    >
      {showHotCityPicker ? (
        <AIChatHotCityPicker
          travelParams={resolvedTravelParams}
          disabled={inputDisabled}
          variant={variant}
          onSelectCity={submit}
        />
      ) : null}

      {voiceDialog.active && voiceDialog.requiresManualFinish ? (
        <div className="relative z-20 mb-2 flex justify-center">
          <button
            type="button"
            disabled={voiceDialog.processing}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              voiceDialog.finishUtterance();
            }}
            className={cn(
              'pointer-events-auto rounded-full border px-6 py-2.5 text-sm font-semibold shadow-md transition',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              'disabled:cursor-wait disabled:opacity-80',
              voiceDialog.processing
                ? 'border-slate-300 bg-slate-100 text-slate-600'
                : 'border-brand-500 bg-brand-500 text-white hover:bg-brand-600 active:scale-95',
            )}
          >
            {voiceDialog.processing ? '识别中…' : '说完了'}
          </button>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {voiceDialog.supported ? (
          <button
            type="button"
            disabled={inputDisabled && !voiceDialog.active}
            onClick={() => voiceDialog.toggle()}
            className={cn(
              'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm',
              variant === 'capsule'
                ? voiceDialog.active
                  ? 'border-emerald-400/45 bg-emerald-500/12 text-emerald-300 ring-2 ring-emerald-400/35'
                  : 'border-cyan-500/35 bg-cyan-500/8 text-cyan-100/90 hover:border-cyan-400/50'
                : voiceDialog.active
                  ? 'border-emerald-300 bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
            aria-label={voiceDialog.active ? '关闭语音对话' : '开启语音对话'}
            aria-pressed={voiceDialog.active}
          >
            <AudioLines className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
        {speech.supported && !voiceDialog.active ? (
          <button
            type="button"
            disabled={inputDisabled}
            className={cn(
              'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm select-none touch-none',
              variant === 'capsule'
                ? speech.listening
                  ? 'border-rose-400/45 bg-rose-500/12 text-rose-300 ring-2 ring-rose-400/35'
                  : 'border-cyan-500/35 bg-cyan-500/8 text-cyan-100/90 hover:border-cyan-400/50'
                : speech.listening
                  ? 'border-rose-300 bg-rose-100 text-rose-700 ring-2 ring-rose-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
            aria-label={
              speech.transcribing
                ? '正在识别语音'
                : speech.listening
                  ? '松开结束录音'
                  : '按住说话'
            }
            onPointerDown={(event) => {
              event.preventDefault();
              if (inputDisabled || speech.listening || speech.transcribing) {
                return;
              }
              void speech.beginHold();
            }}
            onPointerUp={(event) => {
              event.preventDefault();
              speech.endHold();
            }}
            onPointerCancel={(event) => {
              event.preventDefault();
              speech.endHold();
            }}
          >
            {speech.transcribing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Mic className="h-4 w-4" aria-hidden />
            )}
          </button>
        ) : null}
        <textarea
          ref={textareaRef}
          id={composerId}
          rows={2}
          value={draft}
          disabled={inputDisabled}
          placeholder={placeholder}
          aria-label="消息文本输入"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submit(draft);
            }
          }}
          className={cn(
            'h-16 flex-1 resize-none overflow-y-auto rounded-xl border px-3 py-2.5',
            'text-sm leading-relaxed',
            'scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            variant === 'capsule'
              ? 'border-cyan-500/28 bg-cyan-500/6 text-cyan-50 placeholder:text-cyan-200/35 focus:border-cyan-400/45 focus:outline-none focus:ring-2 focus:ring-cyan-400/20'
              : 'border-slate-200 bg-slate-50/90 text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25',
            'disabled:cursor-not-allowed disabled:opacity-60',
          )}
        />
        {isStreaming && onAbortStream ? (
          <button
            type="button"
            onClick={onAbortStream}
            className={cn(
              'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              'border border-rose-200 bg-rose-50 text-rose-700 shadow-sm',
              'transition hover:bg-rose-100',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2',
            )}
            aria-label="停止生成"
          >
            <Square className="h-4 w-4 fill-current" aria-hidden />
          </button>
        ) : (
          <button
            type="submit"
            disabled={inputDisabled || !draft.trim()}
            className={cn(
              'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm',
              variant === 'capsule'
                ? 'border border-emerald-400/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/22'
                : 'bg-gradient-to-br from-brand-500 to-violet-600 text-white',
              'transition hover:brightness-110 disabled:opacity-50',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
            )}
            aria-label={inputDisabled ? '正在处理' : '发送消息'}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
          </button>
        )}
      </form>

      <div className={cn('mt-1 shrink-0', voiceDialog.active ? 'h-[4.5rem]' : 'h-9')}>
        {voiceDialog.active && voiceDialog.voiceBackend === 'iflytek' ? (
          <p className="mb-1 text-center text-[10px] text-brand-600">
            讯飞识别：大声说话，停顿约 2 秒自动发送
          </p>
        ) : null}
        {voiceDialog.active && voiceDialog.voiceBackend === 'whisper' ? (
          <p className="mb-1 text-center text-[10px] text-brand-600">
            本地识别：大声说完后，点上方「说完了」按钮
          </p>
        ) : null}
        {voiceDialog.active && voiceDialog.voiceBackend === 'edge' ? (
          <p className="mb-1 text-center text-[10px] text-brand-600">
            Edge 识别：大声说话，停顿约 2 秒自动发送
          </p>
        ) : null}
        {voiceDialog.active && replySpeech.isSpeaking ? (
          <p className="mb-1 text-center text-[10px] text-emerald-700">
            语音对话：顾问正在朗读，听完可继续说
          </p>
        ) : null}
        {voiceDialog.active && voiceDialog.microphoneDevices.length > 0 ? (
          <div className="mb-1 flex items-center justify-center gap-2 px-1">
            <select
              value={voiceDialog.microphoneDeviceId ?? ''}
              onChange={(event) => {
                voiceDialog.selectMicrophoneDevice(event.target.value);
              }}
              className="max-w-[50%] truncate rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600"
              aria-label="选择麦克风设备"
            >
              <option value="">系统默认麦克风</option>
              {voiceDialog.microphoneDevices.map((device) => {
                const probe = voiceDialog.microphoneProbes.find(
                  (item) => item.deviceId === device.deviceId,
                );
                const weakUsb = /philips|spa3609|通信/i.test(device.label);
                const suffix = probe
                  ? ` · ${formatInputLevelPercent(probe.peak)}`
                  : weakUsb
                    ? ' · 信号弱'
                    : '';
                return (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                    {suffix}
                  </option>
                );
              })}
            </select>
            <button
              type="button"
              onClick={() => {
                void voiceDialog.probeMicrophones();
              }}
              className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50"
            >
              重新检测
            </button>
            <div
              className="h-2 w-20 overflow-hidden rounded-full bg-slate-200"
              aria-hidden
              title={`输入音量 ${formatInputLevelPercent(voiceDialog.inputLevel)}`}
            >
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-75',
                  voiceDialog.inputLevel >= 0.001 ? 'bg-emerald-500' : 'bg-amber-400',
                )}
                style={{ width: `${Math.min(100, Math.round(voiceDialog.inputLevel * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500">
              {formatInputLevelPercent(voiceDialog.inputLevel)}
            </span>
          </div>
        ) : null}
        <p
          className={cn(
            'text-center text-[10px] leading-4',
            variant === 'capsule' ? 'text-cyan-200/42' : 'text-slate-400',
          )}
        >
          Enter 发送
          {speech.supported
          ? ` · ${advisorSpeechBrowserHint()}`
          : ''}
        </p>
        <p
          className={cn(
            'mt-0.5 line-clamp-1 text-center text-[10px] leading-4',
            variant === 'capsule'
              ? voiceDialog.error || speech.error
                ? 'text-amber-300/88'
                : voiceDialog.active || hintLine
                  ? 'text-cyan-200/72'
                  : 'text-transparent'
              : voiceDialog.error || speech.error
                ? 'text-amber-700'
                : voiceDialog.active || hintLine
                  ? 'text-brand-600'
                  : 'text-transparent',
          )}
          role="status"
          aria-live="polite"
        >
          {hintLine ?? '占位'}
        </p>
      </div>
    </footer>
  );
});

AIChatMessageInput.displayName = 'AIChatMessageInput';

export default AIChatMessageInput;
