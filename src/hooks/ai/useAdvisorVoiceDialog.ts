import { useCallback, useEffect, useRef, useState } from 'react';

import {

  advisorSpeechSetupHint,

  clearAdvisorSpeechConfigCache,

  fetchAdvisorSpeechConfig,

  type AdvisorSpeechConfig,

} from '@/lib/browser/advisorSpeechConfig';

import {
  embeddedMicBlockedHint,
  formatMicrophoneStartError,
  isEdgeBrowser,
  isEmbeddedMicBlockedContext,
  isVoiceDialogBrowserSupported,
} from '@/lib/browser/advisorSpeechBrowser';

import { AdvisorContinuousSpeechSession } from '@/lib/browser/advisorContinuousSpeech';
import { AdvisorPcmVoiceDialogSession } from '@/lib/browser/advisorPcmVoiceDialog';
import { AdvisorStreamVoiceDialogSession } from '@/lib/browser/advisorStreamVoiceDialog';
import {
  formatProbeFailureHint,
  formatInputLevelPercent,
  getSavedMicrophoneDeviceId,
  getSavedWeakMicrophoneMode,
  listMicrophoneDevices,
  pickPreferredMicrophoneDevice,
  pickPreferredMicrophoneProbe,
  probeMicrophoneDevices,
  saveMicrophoneDeviceId,
  saveWeakMicrophoneMode,
  type AdvisorMicrophoneDevice,
  type AdvisorMicrophoneProbeResult,
} from '@/lib/browser/advisorMicrophoneDevices';
import { warmupAdvisorSpeechModel } from '@/lib/browser/advisorLocalSpeech';
import { primeAdvisorReplySpeech } from '@/lib/browser/advisorVoiceNarration';

import {
  correctAdvisorSpeechIntent,
  isBlockedStreamVoiceHallucination,
} from '@/lib/browser/advisorSpeechQuality';



export type UseAdvisorVoiceDialogOptions = {

  onSend: (text: string) => void;

  isPaused: boolean;

  /** 首页等场景：跳过逐设备探针，直接开识别 */
  skipInitialProbe?: boolean;

};



/** 第六周：顾问页语音对话（讯飞流式 ASR，说完自动发送） */

export function useAdvisorVoiceDialog({
  onSend,
  isPaused,
  skipInitialProbe = false,
}: UseAdvisorVoiceDialogOptions) {

  const [config, setConfig] = useState<AdvisorSpeechConfig | null>(null);

  const [supported, setSupported] = useState(false);

  const [active, setActive] = useState(false);

  const [recording, setRecording] = useState(false);

  const [processing, setProcessing] = useState(false);

  const [status, setStatus] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [preview, setPreview] = useState<string | null>(null);

  const [inputLevel, setInputLevel] = useState(0);

  const [microphoneDevices, setMicrophoneDevices] = useState<AdvisorMicrophoneDevice[]>([]);

  const [microphoneProbes, setMicrophoneProbes] = useState<AdvisorMicrophoneProbeResult[]>([]);

  const [microphoneDeviceId, setMicrophoneDeviceId] = useState<string | null>(() =>
    getSavedMicrophoneDeviceId(),
  );

  const microphoneDeviceIdRef = useRef(microphoneDeviceId);

  microphoneDeviceIdRef.current = microphoneDeviceId;

  const skipProbeRef = useRef(false);

  const useAutoGainRef = useRef(getSavedWeakMicrophoneMode());

  const microphoneProbesRef = useRef<AdvisorMicrophoneProbeResult[]>([]);

  microphoneProbesRef.current = microphoneProbes;



  const sessionRef = useRef<
    | AdvisorPcmVoiceDialogSession
    | AdvisorContinuousSpeechSession
    | AdvisorStreamVoiceDialogSession
    | null
  >(null);

  const [voiceBackend, setVoiceBackend] = useState<'iflytek' | 'edge' | 'whisper' | null>(null);

  const forceWhisperRef = useRef(false);

  const activeRef = useRef(false);

  const wasPausedRef = useRef(false);

  const isPausedRef = useRef(isPaused);

  isPausedRef.current = isPaused;



  useEffect(() => {

    let cancelled = false;

    clearAdvisorSpeechConfigCache();
    void fetchAdvisorSpeechConfig()

      .then((next) => {

        if (cancelled) {

          return;

        }

        setConfig(next);

        if (isEmbeddedMicBlockedContext()) {
          setSupported(false);
          setError(embeddedMicBlockedHint());
          return;
        }

        setSupported(
          !isEmbeddedMicBlockedContext() &&
            (isVoiceDialogBrowserSupported() ||
              (isEdgeBrowser() && AdvisorContinuousSpeechSession.isSupported())),
        );

        if (!next.voiceDialogReady && !isEdgeBrowser()) {

          setStatus(advisorSpeechSetupHint(next));

        }

      })

      .catch(() => {

        if (!cancelled) {

          setSupported(false);

          setError('无法加载语音配置，请刷新页面');

        }

      });

    return () => {

      cancelled = true;

    };

  }, []);



  const refreshMicrophoneDevices = useCallback(async () => {

    const devices = await listMicrophoneDevices();

    setMicrophoneDevices(devices);

    return devices;

  }, []);



  useEffect(() => {

    void refreshMicrophoneDevices();

    const onDeviceChange = () => {
      void refreshMicrophoneDevices();
      if (activeRef.current) {
        setStatus('检测到音频设备变化，请点「重新检测」');
      }
    };

    navigator.mediaDevices?.addEventListener('devicechange', onDeviceChange);

    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', onDeviceChange);
    };

  }, [refreshMicrophoneDevices]);



  const stopSession = useCallback(() => {

    sessionRef.current?.stop();
    sessionRef.current = null;

    activeRef.current = false;

    setActive(false);
    setVoiceBackend(null);

    setRecording(false);

    setProcessing(false);

    setPreview(null);

    setInputLevel(0);

    setMicrophoneProbes([]);

    wasPausedRef.current = false;

    if (config && !config.voiceDialogReady) {

      setStatus(advisorSpeechSetupHint(config));

    } else {

      setStatus(null);

    }

  }, [config]);



  const handleUtterance = useCallback(

    (text: string) => {

      const trimmed = correctAdvisorSpeechIntent(text.trim());

      setProcessing(false);

      if (!trimmed) {

        return;

      }

      if (isBlockedStreamVoiceHallucination(trimmed)) {

        setError(null);

        setPreview(null);

        setStatus('没听清，请再说一次（说完停顿约 2 秒）');

        return;

      }

      setError(null);

      setPreview(null);

      setStatus(`已识别：${trimmed}`);

      onSend(trimmed);

      window.setTimeout(() => {

        if (activeRef.current) {

          setStatus('请继续说，停顿约 2 秒自动发送');

        }

      }, 500);

    },

    [onSend],

  );

  const startSession = useCallback(async () => {

    if (!supported || activeRef.current) {

      return;

    }

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setError('语音需 HTTPS：当前 HTTP 下浏览器无法稳定采集麦克风，请先打字搜索');
      setStatus('备案通过后可配置免费 SSL');
      return;
    }



    setError(null);

    setPreview(null);

    setProcessing(false);

    primeAdvisorReplySpeech();
    warmupAdvisorSpeechModel();

    skipProbeRef.current = false;

    const devices = await refreshMicrophoneDevices();

    let preferredDevice = pickPreferredMicrophoneDevice(devices);
    let nextDeviceId = preferredDevice?.deviceId ?? null;

    if (!skipProbeRef.current && !skipInitialProbe) {
      setStatus('请大声说「你好」…正在自动检测麦克风');
      const probes = await probeMicrophoneDevices((message) => {
        setStatus(message);
      });
      setMicrophoneProbes(probes);
      microphoneProbesRef.current = probes;
      const preferredProbe = pickPreferredMicrophoneProbe(probes);
      if (preferredProbe && preferredProbe.peak >= 0.001) {
        nextDeviceId = preferredProbe.deviceId || null;
        preferredDevice = devices.find((item) => item.deviceId === preferredProbe.deviceId) ?? {
          deviceId: preferredProbe.deviceId,
          label: preferredProbe.label,
        };
        useAutoGainRef.current = preferredProbe.peak < 0.02 || preferredProbe.useAutoGain;
        saveWeakMicrophoneMode(useAutoGainRef.current);
        if (preferredProbe.deviceId) {
          saveMicrophoneDeviceId(preferredProbe.deviceId);
        }
        setStatus(`已选用 ${preferredProbe.label}（${formatInputLevelPercent(preferredProbe.peak)}）`);
      } else if (probes.length > 0) {
        const hint = formatProbeFailureHint(probes);
        if (typeof window !== 'undefined' && !window.isSecureContext) {
          setError(hint);
          setStatus('语音需要 HTTPS 或 localhost');
          return;
        }
        setError(null);
        setStatus('麦克风检测较弱，正在直接尝试识别…');
      }
    }

    microphoneDeviceIdRef.current = nextDeviceId;
    setMicrophoneDeviceId(nextDeviceId);
    if (!microphoneProbesRef.current.length) {
      useAutoGainRef.current = true;
      saveWeakMicrophoneMode(true);
    }

    const preferIflytek =
      !forceWhisperRef.current &&
      config?.provider === 'iflytek' &&
      config?.voiceDialogMode === 'iflytek-stream' &&
      config?.voiceDialogReady;

    if (preferIflytek) {
      if (preferredDevice) {
        saveMicrophoneDeviceId(preferredDevice.deviceId);
        setStatus(`讯飞识别：正在打开 ${preferredDevice.label}…`);
      } else {
        setStatus('讯飞识别：正在连接麦克风…');
      }

      const iflytekSession = new AdvisorStreamVoiceDialogSession({
        microphoneDeviceId: microphoneDeviceIdRef.current,
        useAutoGain: useAutoGainRef.current,
        onUtterance: handleUtterance,
        onPreview: (message) => {
          setPreview(message);
          setProcessing(false);
          setError(null);
        },
        onRecordingChange: setRecording,
        onInputLevel: (peak) => {
          setInputLevel(peak);
          if (peak >= 0.001) {
            setError(null);
          }
        },
        onStatus: (message) => {
          setStatus(message);
          if (message.startsWith('听到：')) {
            setProcessing(false);
          }
        },
        onError: (message) => {
          setProcessing(false);
          setError(message);
        },
        onFatalError: (message) => {
          setError(message);
          setPreview(null);
          setRecording(false);
          setProcessing(false);
          sessionRef.current = null;
          activeRef.current = false;
          setActive(false);
          setVoiceBackend(null);
          iflytekSession.stop();
        },
      });

      sessionRef.current = iflytekSession;
      wasPausedRef.current = false;

      try {
        await iflytekSession.start();
        if (!iflytekSession.isRunning()) {
          iflytekSession.stop();
          sessionRef.current = null;
          // 无讯飞/连接失败：勿卡在空听；优先落到下方 Whisper「说完了」
          setError(null);
          setStatus('流式识别不可用，切换本地录音…');
        } else {
          activeRef.current = true;
          setActive(true);
          setVoiceBackend('iflytek');
          await refreshMicrophoneDevices();
          if (isPausedRef.current) {
            wasPausedRef.current = true;
            iflytekSession.pause();
            setRecording(false);
          }
          return;
        }
      } catch (err) {
        stopSession();
        setError(formatMicrophoneStartError(err));
        return;
      }
    }

    // local-whisper 场景下 Edge Web Speech 常只显示「麦克风已连接」却无结果，直接走录音+Whisper
    const preferEdge =
      !forceWhisperRef.current &&
      config?.provider !== 'local-whisper' &&
      isEdgeBrowser() &&
      AdvisorContinuousSpeechSession.isSupported();

    if (preferEdge) {
      setStatus(preferredDevice ? `Edge 识别：${preferredDevice.label}` : 'Edge 识别：正在听…');

      const edgeSession = new AdvisorContinuousSpeechSession({
        onUtterance: handleUtterance,
        microphoneDeviceId: microphoneDeviceIdRef.current,
        onInterim: (text) => {
          setPreview(text);
          setRecording(true);
          setProcessing(false);
          setError(null);
        },
        onStatus: (message) => {
          setStatus(message);
          if (message.startsWith('听到：')) {
            setProcessing(false);
            setRecording(true);
          }
        },
        onError: (message) => {
          setProcessing(false);
          setError(message);
        },
        onFatalError: (message) => {
          if (!forceWhisperRef.current) {
            forceWhisperRef.current = true;
            sessionRef.current?.stop();
            sessionRef.current = null;
            activeRef.current = false;
            setActive(false);
            setVoiceBackend(null);
            setStatus('Edge 识别不可用，切换本地录音…');
            window.setTimeout(() => {
              void startSession();
            }, 240);
            return;
          }
          setError(message);
          setPreview(null);
          setRecording(false);
          setProcessing(false);
          sessionRef.current = null;
          activeRef.current = false;
          setActive(false);
          setVoiceBackend(null);
        },
      });

      sessionRef.current = edgeSession;
      wasPausedRef.current = false;

      try {
        await edgeSession.start();
        activeRef.current = true;
        setActive(true);
        setVoiceBackend('edge');
        setRecording(true);
        if (isPausedRef.current) {
          wasPausedRef.current = true;
          edgeSession.pause();
          setRecording(false);
        }
      } catch (err) {
        forceWhisperRef.current = true;
        stopSession();
        window.setTimeout(() => {
          void startSession();
        }, 240);
      }
      return;
    }

    if (preferredDevice) {
      saveMicrophoneDeviceId(preferredDevice.deviceId);
      setStatus(`正在打开 ${preferredDevice.label}…`);
    } else {
      setStatus('正在选择麦克风…');
    }

    const session = new AdvisorPcmVoiceDialogSession({

      microphoneDeviceId: microphoneDeviceIdRef.current,

      useAutoGain: useAutoGainRef.current,

      onUtterance: handleUtterance,

      onPreview: (message) => {

        setPreview(message);

        setProcessing(false);

        setError(null);

      },

      onRecordingChange: setRecording,

      onInputLevel: (peak) => {

        setInputLevel(peak);

        if (peak >= 0.001) {

          setError(null);

        }

      },

      onTranscribingChange: setProcessing,

      onStatus: (message) => {

        setStatus(message);

        if (message.startsWith('听到：')) {

          setProcessing(false);

        }

      },

      onError: (message) => {

        setProcessing(false);

        setError(message);

      },

      onFatalError: (message) => {
        setError(formatMicrophoneStartError(message));
        setStatus(config ? advisorSpeechSetupHint(config) : null);
        setPreview(null);
        setRecording(false);
        setProcessing(false);
        sessionRef.current = null;
        activeRef.current = false;
        setActive(false);
        setVoiceBackend(null);
      },

    });

    sessionRef.current = session;

    wasPausedRef.current = false;

    try {

      await session.start();

      if (!session.isRunning()) {
        throw new Error('麦克风未就绪');
      }

      activeRef.current = true;

      setActive(true);
      setVoiceBackend('whisper');

      await refreshMicrophoneDevices();

      if (isPausedRef.current) {

        wasPausedRef.current = true;

        session.pause();

      }

    } catch (err) {

      stopSession();

      setError(formatMicrophoneStartError(err));

    }

  }, [config, handleUtterance, refreshMicrophoneDevices, stopSession, supported]);



  const selectMicrophoneDevice = useCallback(

    (deviceId: string) => {

      const normalized = deviceId.trim();

      const nextId = normalized || null;

      microphoneDeviceIdRef.current = nextId;

      setMicrophoneDeviceId(nextId);

      if (nextId) {

        saveMicrophoneDeviceId(nextId);

      }

      const matched = microphoneProbesRef.current.find((item) => item.deviceId === normalized);

      useAutoGainRef.current = matched

        ? matched.peak < 0.02 || matched.useAutoGain

        : getSavedWeakMicrophoneMode();

      saveWeakMicrophoneMode(useAutoGainRef.current);

      setError(null);

      if (activeRef.current) {

        skipProbeRef.current = true;

        stopSession();

        window.setTimeout(() => {

          void startSession();

        }, 120);

      }

    },

    [startSession, stopSession],

  );



  const probeMicrophones = useCallback(async () => {

    if (!activeRef.current) {

      return;

    }

    setError(null);

    setStatus('请对着麦克风说「你好」…正在重新检测');

    microphoneDeviceIdRef.current = null;

    setMicrophoneDeviceId(null);

    try {
      localStorage.removeItem('advisor-mic-device-id');
    } catch {
      // ignore
    }

    await refreshMicrophoneDevices();

    const probes = await probeMicrophoneDevices((message, peak) => {

      setStatus(message);
      if (typeof peak === 'number') {
        setInputLevel(peak);
      }

    });

    setMicrophoneProbes(probes);

    microphoneProbesRef.current = probes;

    const preferred = pickPreferredMicrophoneProbe(probes);

    if (!preferred || preferred.peak < 0.001) {
      setError(formatProbeFailureHint(probes));
      return;
    }

    useAutoGainRef.current = preferred.peak < 0.02 || preferred.useAutoGain;

    saveWeakMicrophoneMode(useAutoGainRef.current);

    microphoneDeviceIdRef.current = preferred.deviceId || null;

    setMicrophoneDeviceId(preferred.deviceId || null);

    if (preferred.deviceId) {

      saveMicrophoneDeviceId(preferred.deviceId);

    }

    setStatus(`已选用 ${preferred.label}（${formatInputLevelPercent(preferred.peak)}）`);

    if (!activeRef.current) {

      return;

    }

    skipProbeRef.current = true;

    stopSession();

    window.setTimeout(() => {

      void startSession();

    }, 200);

  }, [startSession, stopSession]);



  const toggle = useCallback(() => {

    if (activeRef.current) {

      stopSession();

      return;

    }

    forceWhisperRef.current = false;
    void startSession();

  }, [startSession, stopSession]);



  useEffect(() => {

    if (!activeRef.current) {

      return;

    }

    const session = sessionRef.current;

    if (!session) {

      return;

    }

    if (isPaused) {

      wasPausedRef.current = true;

      session.pause();

      setPreview(null);

      setProcessing(false);
      setRecording(false);

      return;

    }

    if (!wasPausedRef.current) {

      return;

    }

    const timer = window.setTimeout(() => {

      if (!activeRef.current || isPausedRef.current) {

        return;

      }

      wasPausedRef.current = false;

      void session.resume();
      setRecording(true);

    }, 280);

    return () => {

      window.clearTimeout(timer);

    };

  }, [isPaused, active]);



  useEffect(

    () => () => {

      stopSession();

    },

    [stopSession],

  );



  return {

    supported,

    active,

    recording,

    processing,

    status,

    error,

    preview,

    inputLevel,

    microphoneDevices,

    microphoneDeviceId,

    microphoneProbes,

    voiceBackend,

    selectMicrophoneDevice,

    probeMicrophones,

    requiresManualFinish: voiceBackend === 'whisper' || voiceBackend === 'iflytek',

    toggle,

    finishUtterance: () => {
      const session = sessionRef.current;
      if (!session) {
        setError('语音未就绪，请关闭后重新开启');
        return;
      }
      if ('forceFinishUtterance' in session && typeof session.forceFinishUtterance === 'function') {
        setError(null);
        setStatus('收到，正在识别…');
        setProcessing(true);
        session.forceFinishUtterance();
        return;
      }
      setError('大声说话，停顿约 2 秒即可自动发送');
    },

    stop: stopSession,

  };

}


