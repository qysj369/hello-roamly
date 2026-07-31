const STORAGE_KEY = 'advisor-mic-device-id';
const WEAK_MIC_STORAGE_KEY = 'advisor-mic-weak-agc';

export type AdvisorMicrophoneDevice = {
  deviceId: string;
  label: string;
};

export type AdvisorMicrophoneProbeResult = AdvisorMicrophoneDevice & {
  peak: number;
  frames: number;
  trackMuted: boolean;
  useAutoGain: boolean;
};

export type VoiceDialogMicOptions = {
  deviceId?: string | null;
  useAutoGain?: boolean;
};

export function getSavedWeakMicrophoneMode(): boolean {
  try {
    return localStorage.getItem(WEAK_MIC_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveWeakMicrophoneMode(enabled: boolean): void {
  try {
    localStorage.setItem(WEAK_MIC_STORAGE_KEY, enabled ? '1' : '0');
  } catch {
    // ignore
  }
}

export function formatInputLevelPercent(peak: number): string {
  if (peak <= 0.00005) {
    return '0%';
  }
  const percent = peak * 100;
  if (percent < 1) {
    return `${percent.toFixed(1)}%`;
  }
  return `${Math.round(percent)}%`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function measurePeak(samples: Float32Array): number {
  let peak = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const value = Math.abs(samples[index] ?? 0);
    if (value > peak) {
      peak = value;
    }
  }
  return peak;
}

function isCaptureInputDevice(label: string): boolean {
  return !/立体声混音|stereo mix|what u hear|loopback|wave out/i.test(label);
}

function isPreferredBuiltinMic(label: string): boolean {
  return /realtek|麦克风阵列|mic array|high definition audio/i.test(label) &&
    !/philips|spa3609|立体声混音|stereo mix/i.test(label);
}

function isLikelyUsbHeadsetMic(label: string): boolean {
  return /philips|spa3609|usb|headset|耳机|蓝牙|bluetooth|communications|通信/i.test(label);
}

function normalizeDeviceLabel(label: string): string {
  return label
    .replace(/^default\s*-\s*/i, '')
    .replace(/^communications\s*-\s*/i, '')
    .trim()
    .toLowerCase();
}

function sortProbeTargets(
  targets: Array<{ deviceId: string | null; label: string }>,
): Array<{ deviceId: string | null; label: string }> {
  const score = (target: { deviceId: string | null; label: string }): number => {
    if (isPreferredBuiltinMic(target.label)) {
      return 0;
    }
    if (!target.deviceId) {
      return 1;
    }
    if (isLikelyUsbHeadsetMic(target.label)) {
      return 3;
    }
    return 2;
  };

  return [...targets].sort((left, right) => score(left) - score(right));
}

async function measureDeviceInputPeak(
  deviceId: string | null,
  sampleMs = 1_200,
  useAutoGain = false,
  onPeak?: (peak: number) => void,
): Promise<{ peak: number; frames: number; trackMuted: boolean }> {
  let stream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let analyser: AnalyserNode | null = null;
  let muteGain: GainNode | null = null;

  try {
    stream = await requestVoiceDialogMicrophoneStream({
      deviceId,
      useAutoGain,
    });
    const track = stream.getAudioTracks()[0];
    const trackMuted = track?.muted ?? false;

    const win = window as Window & { webkitAudioContext?: typeof AudioContext };
    const Ctor = win.AudioContext ?? win.webkitAudioContext;
    if (!Ctor) {
      return { peak: 0, frames: 0, trackMuted };
    }

    audioContext = new Ctor();
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    muteGain = audioContext.createGain();
    muteGain.gain.value = 0;

    source.connect(analyser);
    analyser.connect(muteGain);
    muteGain.connect(audioContext.destination);

    await delay(220);

    let sessionPeak = 0;
    let frames = 0;
    const endAt = Date.now() + sampleMs;

    while (Date.now() < endAt) {
      await delay(100);
      frames += 1;
      const timeData = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(timeData);
      for (let index = 0; index < timeData.length; index += 1) {
        const value = Math.abs(((timeData[index] ?? 128) - 128) / 128);
        if (value > sessionPeak) {
          sessionPeak = value;
        }
      }
      onPeak?.(sessionPeak);
    }

    return { peak: sessionPeak, frames, trackMuted };
  } catch {
    return { peak: 0, frames: 0, trackMuted: false };
  } finally {
    source?.disconnect();
    analyser?.disconnect();
    muteGain?.disconnect();
    for (const track of stream?.getTracks() ?? []) {
      track.stop();
    }
    if (audioContext) {
      await audioContext.close();
    }
  }
}

/** 逐个打开麦克风采样，找出浏览器能收到声音的设备 */
export async function probeMicrophoneDevices(
  onProgress?: (message: string, peak?: number) => void,
): Promise<AdvisorMicrophoneProbeResult[]> {
  const devices = await listMicrophoneDevices();
  const seenIds = new Set<string>();
  const seenLabels = new Set<string>();
  const targets: Array<{ deviceId: string | null; label: string }> = sortProbeTargets([
    { deviceId: null, label: '系统默认麦克风' },
    ...devices
      .filter((device) => {
        const normalized = normalizeDeviceLabel(device.label);
        if (seenIds.has(device.deviceId) || seenLabels.has(normalized)) {
          return false;
        }
        seenIds.add(device.deviceId);
        seenLabels.add(normalized);
        return true;
      })
      .map((device) => ({ deviceId: device.deviceId, label: device.label })),
  ]);

  const results: AdvisorMicrophoneProbeResult[] = [];

  for (const [index, target] of targets.entries()) {
    onProgress?.(
      `检测 ${index + 1}/${targets.length}：${target.label}（请连续大声说「你好」）`,
      0,
    );
    const raw = await measureDeviceInputPeak(target.deviceId, 900, false, (peak) => {
      onProgress?.(
        `检测 ${index + 1}/${targets.length}：${target.label}（请连续大声说「你好」）`,
        peak,
      );
    });
    await delay(120);
    const agc = await measureDeviceInputPeak(target.deviceId, 700, true, (peak) => {
      onProgress?.(
        `检测 ${index + 1}/${targets.length}：${target.label}（请连续大声说「你好」）`,
        peak,
      );
    });
    const useAutoGain = agc.peak > raw.peak * 1.15;
    const peak = Math.max(raw.peak, agc.peak);
    const frames = Math.max(raw.frames, agc.frames);
    const trackMuted = raw.trackMuted && agc.trackMuted;
    results.push({
      deviceId: target.deviceId ?? '',
      label: target.label,
      peak,
      frames,
      trackMuted,
      useAutoGain,
    });
    if (index < targets.length - 1) {
      await delay(280);
    }
  }

  return results.sort((left, right) => right.peak - left.peak);
}

export function getSavedMicrophoneDeviceId(): string | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)?.trim();
    return value || null;
  } catch {
    return null;
  }
}

export function saveMicrophoneDeviceId(deviceId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, deviceId);
  } catch {
    // ignore
  }
}

export async function listMicrophoneDevices(): Promise<AdvisorMicrophoneDevice[]> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return [];
  }

  try {
    const prime = await navigator.mediaDevices.getUserMedia({ audio: true });
    for (const track of prime.getTracks()) {
      track.stop();
    }
  } catch {
    // ignore — still try enumerate
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const seenIds = new Set<string>();

  return devices
    .filter((device) => device.kind === 'audioinput' && device.deviceId)
    .map((device, index) => ({
      deviceId: device.deviceId,
      label: device.label?.trim() || `麦克风 ${index + 1}`,
    }))
    .filter((device) => isCaptureInputDevice(device.label))
    .filter((device) => {
      if (seenIds.has(device.deviceId)) {
        return false;
      }
      seenIds.add(device.deviceId);
      return true;
    })
    .sort((left, right) => {
      const leftScore = isPreferredBuiltinMic(left.label)
        ? 0
        : isLikelyUsbHeadsetMic(left.label)
          ? 2
          : 1;
      const rightScore = isPreferredBuiltinMic(right.label)
        ? 0
        : isLikelyUsbHeadsetMic(right.label)
          ? 2
          : 1;
      return leftScore - rightScore;
    });
}

export async function requestVoiceDialogMicrophoneStream(
  options: VoiceDialogMicOptions = {},
): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('当前浏览器无法访问麦克风');
  }

  const { deviceId = null } = options;

  const attempts: MediaStreamConstraints[] = [
    { audio: true },
    {
      audio: {
        autoGainControl: true,
        echoCancellation: false,
        noiseSuppression: false,
      },
    },
  ];

  if (deviceId) {
    attempts.unshift(
      {
        audio: {
          deviceId: { ideal: deviceId },
          autoGainControl: true,
          echoCancellation: false,
          noiseSuppression: false,
        },
      },
      {
        audio: {
          deviceId: { exact: deviceId },
          autoGainControl: true,
          echoCancellation: false,
          noiseSuppression: false,
        },
      },
    );
  }

  let lastError: unknown;
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('无法访问麦克风');
}

export function describeMicrophoneTrack(stream: MediaStream): string {
  const track = stream.getAudioTracks()[0];
  if (!track) {
    return '未找到麦克风轨道';
  }
  const parts = [track.label || '默认麦克风'];
  if (track.muted) {
    parts.push('系统静音');
  }
  if (!track.enabled) {
    parts.push('已禁用');
  }
  return parts.join(' · ');
}

export function pickPreferredMicrophoneDevice(
  devices: AdvisorMicrophoneDevice[],
): AdvisorMicrophoneDevice | null {
  const savedId = getSavedMicrophoneDeviceId();
  if (savedId) {
    const saved = devices.find((item) => item.deviceId === savedId);
    if (saved && !isLikelyUsbHeadsetMic(saved.label)) {
      return saved;
    }
  }

  const realtek = devices.find((item) => isPreferredBuiltinMic(item.label));
  if (realtek) {
    return realtek;
  }

  const nonUsb = devices.filter((item) => !isLikelyUsbHeadsetMic(item.label));
  if (nonUsb[0]) {
    return nonUsb[0];
  }

  return null;
}

export function pickPreferredMicrophoneProbe(
  probes: AdvisorMicrophoneProbeResult[],
): AdvisorMicrophoneProbeResult | null {
  const usable = probes.filter(
    (item) =>
      item.peak >= 0.001 &&
      !(isLikelyUsbHeadsetMic(item.label) && item.peak < 0.05),
  );
  if (usable.length === 0) {
    const realtekCandidate = probes.find((item) => isPreferredBuiltinMic(item.label));
    if (realtekCandidate) {
      return realtekCandidate;
    }
    return probes.find((item) => !isLikelyUsbHeadsetMic(item.label)) ?? probes[0] ?? null;
  }

  const realtek = usable.find((item) => isPreferredBuiltinMic(item.label));
  const philips = usable.find((item) => isLikelyUsbHeadsetMic(item.label));

  if (realtek && philips && philips.peak < 0.02) {
    return realtek;
  }

  const systemDefault = probes.find((item) => !item.deviceId);
  if (systemDefault && systemDefault.peak < 0.02 && realtek) {
    return realtek;
  }

  if (realtek) {
    return realtek;
  }

  return usable[0] ?? null;
}

export function formatProbeFailureHint(
  probes: AdvisorMicrophoneProbeResult[],
): string {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return '当前为 HTTP 访问，浏览器无法稳定采集麦克风。请改用 HTTPS，或先打字搜索';
  }

  if (probes.length === 0) {
    return '未找到麦克风设备';
  }

  const best = probes[0];
  if (probes.every((item) => item.trackMuted)) {
    return '所有麦克风被系统静音：请在 Windows 声音设置中取消静音';
  }

  if (probes.every((item) => item.frames === 0)) {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      return '当前为 HTTP 访问，浏览器无法采集麦克风。请改用 HTTPS，或先打字搜索';
    }
    return '浏览器未收到音频数据：请关闭绿色波形后重新打开，或重启 Edge';
  }

  if (probes.every((item) => item.peak < 0.01)) {
    return '所有麦克风几乎无信号：Win+I → 系统 → 声音 → 输入，选「麦克风阵列 Realtek」并调高音量，不要用 Philips';
  }

  return `所有麦克风几乎无信号（${best.label} 约 ${Math.round(best.peak * 100)}%）：请先让 Windows 录音机录到声音`;
}

export { measurePeak };
