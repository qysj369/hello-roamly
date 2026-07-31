import {
  speakBrowserText,
  stopBrowserSpeechSynthesis,
} from '@/lib/browser/browserSpeechSynthesis';
import { CAPSULE_SYSTEM_VOICE } from '@/components/capsule-one/capsulePrompts';

let audioContext: AudioContext | null = null;

function resolveAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const Ctor = window.AudioContext ?? window.webkitAudioContext;
  if (!Ctor) {
    return null;
  }
  if (!audioContext) {
    audioContext = new Ctor();
  }
  return audioContext;
}

/** 交互心跳 — 短促低频脉冲 */
export function playCapsulePulseChime(muted: boolean, intensity = 1): void {
  if (muted) {
    return;
  }

  const ctx = resolveAudioContext();
  if (!ctx) {
    return;
  }

  void ctx.resume().then(() => {
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(180 + intensity * 40, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035 * Math.min(intensity, 1.4), now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.16);
  });
}

/** 城市锁定 — 三音递进确认 */
export function playCapsuleCityLockChime(muted: boolean): void {
  if (muted) {
    return;
  }

  const ctx = resolveAudioContext();
  if (!ctx) {
    return;
  }

  void ctx.resume().then(() => {
    const now = ctx.currentTime;
    const tones = [
      { freq: 320, start: now + 0.02, duration: 0.1 },
      { freq: 480, start: now + 0.1, duration: 0.12 },
      { freq: 640, start: now + 0.2, duration: 0.14 },
    ];

    for (const tone of tones) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(tone.freq, tone.start);
      gain.gain.setValueAtTime(0.0001, tone.start);
      gain.gain.exponentialRampToValueAtTime(0.04, tone.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, tone.start + tone.duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(tone.start);
      oscillator.stop(tone.start + tone.duration + 0.02);
    }
  });
}

/** 轻量启动音效 — 双音上扬 */
export function playCapsuleStartupChime(muted: boolean): void {
  if (muted) {
    return;
  }

  const ctx = resolveAudioContext();
  if (!ctx) {
    return;
  }

  void ctx.resume().then(() => {
    const now = ctx.currentTime;
    const tones = [
      { freq: 520, start: now + 0.02, duration: 0.12 },
      { freq: 780, start: now + 0.14, duration: 0.16 },
    ];

    for (const tone of tones) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(tone.freq, tone.start);
      gain.gain.setValueAtTime(0.0001, tone.start);
      gain.gain.exponentialRampToValueAtTime(0.045, tone.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, tone.start + tone.duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(tone.start);
      oscillator.stop(tone.start + tone.duration + 0.02);
    }
  });
}

export async function speakCapsuleSystemLine(
  line: keyof typeof CAPSULE_SYSTEM_VOICE,
  muted: boolean,
): Promise<void> {
  if (muted) {
    return;
  }
  await speakBrowserText({
    text: CAPSULE_SYSTEM_VOICE[line],
    rate: 0.9,
  });
}

export function stopCapsuleSystemVoice(): void {
  stopBrowserSpeechSynthesis();
}

export async function announceCapsuleReady(muted: boolean): Promise<void> {
  playCapsuleStartupChime(muted);
  await speakCapsuleSystemLine('ready', muted);
}
