import { useCallback, useEffect, useRef, useState } from 'react';
import { AdvisorEdgeSpeechSession } from '@/lib/browser/advisorEdgeSpeech';
import {
  AdvisorPcmRecorder,
  measurePeakAmplitude,
} from '@/lib/browser/advisorPcmRecorder';
import {
  advisorSpeechFailureHint,
  embeddedMicBlockedHint,
  formatMicrophoneStartError,
  isChromeBrowser,
  isEdgeBrowser,
  isEmbeddedMicBlockedContext,
} from '@/lib/browser/advisorSpeechBrowser';
import { isBlockedHallucination } from '@/lib/browser/advisorSpeechQuality';
import {
  transcribePcmSamples,
  warmupAdvisorSpeechModel,
} from '@/lib/browser/advisorLocalSpeech';

const MAX_RECORD_MS = 12_000;
const MIN_RECORD_MS = 2_000;
const MIN_PEAK = 0.002;

export type UseAdvisorSpeechInputOptions = {
  onResult: (text: string) => void;
};

/** 顾问页语音：按住说话，松开识别（Edge 优先浏览器原生识别） */
export function useAdvisorSpeechInput({ onResult }: UseAdvisorSpeechInputOptions) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<AdvisorPcmRecorder | null>(null);
  const browserOnlyRef = useRef(false);
  const edgeSpeechRef = useRef<AdvisorEdgeSpeechSession | null>(null);
  const recordStartedAtRef = useRef(0);
  const autoStopTimerRef = useRef<number | null>(null);
  const holdActiveRef = useRef(false);
  const sessionIdRef = useRef(0);

  useEffect(() => {
    if (isEmbeddedMicBlockedContext()) {
      setSupported(false);
      setError(embeddedMicBlockedHint());
      return;
    }
    setSupported(Boolean(navigator.mediaDevices?.getUserMedia));
    warmupAdvisorSpeechModel();
  }, []);

  const clearAutoStop = useCallback(() => {
    if (autoStopTimerRef.current != null) {
      window.clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
  }, []);

  const resetIdle = useCallback(() => {
    setListening(false);
    setTranscribing(false);
    setStatus(null);
  }, []);

  const acceptSpeechText = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return false;
      }
      if (isBlockedHallucination(trimmed)) {
        setError(advisorSpeechFailureHint());
        return false;
      }
      setError(null);
      onResult(trimmed);
      return true;
    },
    [onResult],
  );

  const finishTranscribe = useCallback(
    async (samples: Float32Array, edgeText: string) => {
      try {
        if (edgeText && acceptSpeechText(edgeText)) {
          return;
        }

        const peak = measurePeakAmplitude(samples);
        if (peak < MIN_PEAK) {
          setError('没录到声音：请检查系统麦克风是否静音，或靠近麦克风重试');
          return;
        }

        setTranscribing(true);
        setStatus('正在识别语音…');
        const text = await transcribePcmSamples(samples, (message) => setStatus(message));
        if (!acceptSpeechText(text)) {
          setError((current) => current ?? advisorSpeechFailureHint());
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : advisorSpeechFailureHint();
        const peak = measurePeakAmplitude(samples);
        if (/没听清/i.test(message) && peak < 0.01) {
          setError('没录到声音：请检查系统麦克风是否静音，或靠近麦克风重试');
          return;
        }
        setError(isChromeBrowser() ? advisorSpeechFailureHint() : message);
      } finally {
        setTranscribing(false);
        setStatus(null);
      }
    },
    [acceptSpeechText],
  );

  const endHold = useCallback(() => {
    sessionIdRef.current += 1;
    holdActiveRef.current = false;

    const recorder = recorderRef.current;
    const edgeSession = edgeSpeechRef.current;
    edgeSpeechRef.current = null;
    clearAutoStop();

    const browserOnly = browserOnlyRef.current;
    browserOnlyRef.current = false;

    if (!recorder && !listening) {
      void edgeSession?.stop();
      resetIdle();
      return;
    }

    const elapsed = Date.now() - recordStartedAtRef.current;
    recorderRef.current = null;
    setListening(false);

    if (elapsed < MIN_RECORD_MS) {
      setError('按住时间太短，请按住说满 2 秒再松开');
      setStatus(null);
      void edgeSession?.stop();
      if (recorder) {
        void recorder.stop().catch(() => {
          /* ignore */
        });
      }
      return;
    }

    setStatus('正在处理录音…');

    void (async () => {
      try {
        if (browserOnly) {
          const edgeText = (await edgeSession?.stop()) ?? '';
          if (!edgeText.trim()) {
            setError(
              '浏览器未识别到语音：请 Win+I → 系统 → 声音 → 输入，选「麦克风阵列 Realtek」，对着麦克风大声说满 2 秒',
            );
            return;
          }
          if (!acceptSpeechText(edgeText)) {
            setError(advisorSpeechFailureHint());
          }
          return;
        }

        if (!recorder) {
          setError(advisorSpeechFailureHint());
          return;
        }

        const samples = await recorder.stop();
        await finishTranscribe(samples, '');
      } catch (err) {
        const message = err instanceof Error ? err.message : '录音处理失败';
        setError(message);
      } finally {
        setTranscribing(false);
        setStatus(null);
      }
    })();
  }, [acceptSpeechText, clearAutoStop, finishTranscribe, listening, resetIdle]);

  const beginHold = useCallback(async () => {
    if (holdActiveRef.current || listening || transcribing) {
      return;
    }

    const sessionId = sessionIdRef.current + 1;
    sessionIdRef.current = sessionId;
    holdActiveRef.current = true;
    setError(null);
    setStatus('正在启动麦克风…');

    const startBrowserOnly = () => {
      if (!AdvisorEdgeSpeechSession.isSupported()) {
        return false;
      }
      const edge = new AdvisorEdgeSpeechSession();
      edge.start();
      edgeSpeechRef.current = edge;
      browserOnlyRef.current = true;
      recordStartedAtRef.current = Date.now();
      setListening(true);
      setStatus('按住说话中…（浏览器原生识别）');
      autoStopTimerRef.current = window.setTimeout(() => {
        endHold();
      }, MAX_RECORD_MS);
      return true;
    };

    try {
      const recorder = new AdvisorPcmRecorder();
      await recorder.start();

      if (!holdActiveRef.current || sessionId !== sessionIdRef.current) {
        await recorder.stop();
        resetIdle();
        return;
      }

      recorderRef.current = recorder;
      browserOnlyRef.current = false;
      setStatus('按住说话中…松开结束');

      recordStartedAtRef.current = Date.now();
      setListening(true);

      autoStopTimerRef.current = window.setTimeout(() => {
        endHold();
      }, MAX_RECORD_MS);
    } catch (err) {
      if (startBrowserOnly()) {
        return;
      }
      holdActiveRef.current = false;
      recorderRef.current = null;
      browserOnlyRef.current = false;
      void edgeSpeechRef.current?.stop();
      edgeSpeechRef.current = null;
      resetIdle();
      setError(formatMicrophoneStartError(err));
    }
  }, [endHold, listening, resetIdle, transcribing]);

  const stopAll = useCallback(() => {
    sessionIdRef.current += 1;
    holdActiveRef.current = false;
    browserOnlyRef.current = false;
    clearAutoStop();
    void edgeSpeechRef.current?.stop();
    edgeSpeechRef.current = null;
    if (listening || recorderRef.current) {
      endHold();
      return;
    }
    resetIdle();
  }, [clearAutoStop, endHold, listening, resetIdle]);

  useEffect(() => {
    if (!listening) {
      return;
    }

    const releaseOnGlobalPointerEnd = () => {
      if (holdActiveRef.current || listening) {
        endHold();
      }
    };

    window.addEventListener('pointerup', releaseOnGlobalPointerEnd);
    window.addEventListener('pointercancel', releaseOnGlobalPointerEnd);
    return () => {
      window.removeEventListener('pointerup', releaseOnGlobalPointerEnd);
      window.removeEventListener('pointercancel', releaseOnGlobalPointerEnd);
    };
  }, [endHold, listening]);

  useEffect(
    () => () => {
      sessionIdRef.current += 1;
      holdActiveRef.current = false;
      clearAutoStop();
      void edgeSpeechRef.current?.stop();
      edgeSpeechRef.current = null;
      const recorder = recorderRef.current;
      recorderRef.current = null;
      if (recorder) {
        void recorder.stop().catch(() => {
          /* ignore */
        });
      }
    },
    [clearAutoStop],
  );

  return {
    supported,
    listening,
    transcribing,
    status,
    error,
    beginHold,
    endHold,
    stop: stopAll,
  };
}
