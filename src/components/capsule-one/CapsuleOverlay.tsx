import { AnimatePresence, motion } from 'framer-motion';
import { Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';
import { useEffect } from 'react';
import CapsuleBlindBox from '@/components/capsule-one/CapsuleBlindBox';
import CapsuleHudInput from '@/components/capsule-one/CapsuleHudInput';
import CapsuleNavMenu from '@/components/capsule-one/CapsuleNavMenu';
import { capsuleLaunchStatusText } from '@/components/capsule-one/capsulePrompts';
import { BRAND_DOMAIN, BRAND_NAME, BRAND_SPIRIT_SLOGAN } from '@/lib/config/brand';
import {
  SITE_ICP_NUMBER,
  SITE_ICP_URL,
  SITE_MPS_BEIAN_NUMBER,
  SITE_MPS_BEIAN_URL,
} from '@/lib/config/siteCompliance';
import { useCapsuleLaunchToAi } from '@/hooks/capsule/useCapsuleLaunchToAi';
import { useCapsuleVoiceInput } from '@/hooks/capsule/useCapsuleVoiceInput';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';

const SLOGAN_LINES = BRAND_SPIRIT_SLOGAN.split(/[，,]/).map((line) => line.trim());

/** Paper Roam 输入层 — 搜索条 + 盲盒/语音/提交 */
export default function CapsuleOverlay() {
  const phase = useCapsuleOneStore((state) => state.phase);
  const draftText = useCapsuleOneStore((state) => state.draftText);
  const lockedCity = useCapsuleOneStore((state) => state.lockedCity);
  const blindBoxActive = useCapsuleOneStore((state) => state.blindBoxActive);
  const muted = useCapsuleOneStore((state) => state.muted);
  const pulseKey = useCapsuleOneStore((state) => state.pulseKey);
  const setPhase = useCapsuleOneStore((state) => state.setPhase);
  const triggerPulse = useCapsuleOneStore((state) => state.triggerPulse);
  const toggleMuted = useCapsuleOneStore((state) => state.toggleMuted);
  const launchToAi = useCapsuleLaunchToAi();

  const { voice, toggleMic, statusText, micBlockedHint, isListening } = useCapsuleVoiceInput();

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase('active'), 900);
    return () => window.clearTimeout(timer);
  }, [setPhase]);

  const handleSubmitText = () => {
    launchToAi(draftText);
  };

  const canSubmit = draftText.trim().length > 0 && phase !== 'launching' && phase !== 'processing';
  const year = new Date().getFullYear();
  const micTitle = micBlockedHint ?? (isListening ? '停止聆听' : '语音输入');

  return (
    <div className="capsule-overlay">
      <div className="capsule-overlay__topbar">
        <p className="capsule-overlay__topbar-slogan" aria-hidden>
          {SLOGAN_LINES.map((line) => (
            <span key={line} className="capsule-overlay__topbar-slogan-line">
              {line}
            </span>
          ))}
        </p>
        <div className="capsule-overlay__hud">
          <button
            type="button"
            className="capsule-hud-btn"
            onClick={toggleMuted}
            aria-label={muted ? '开启音效' : '静音'}
            title={muted ? '开启音效' : '静音'}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <CapsuleNavMenu />
        </div>
      </div>

      <AnimatePresence>
        {pulseKey > 0 ? (
          <motion.div
            key={pulseKey}
            className="capsule-ripple"
            initial={{ opacity: 0.35, scale: 0.25 }}
            animate={{ opacity: 0, scale: 2.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {lockedCity ? (
          <motion.div
            key={`lock-${lockedCity.id}-${pulseKey}`}
            className="capsule-lock-flash"
            initial={{ opacity: 0.14 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        ) : null}
      </AnimatePresence>

      <div className={`capsule-overlay__dock ${blindBoxActive ? 'capsule-overlay__dock--dimmed' : ''}`}>
        {!blindBoxActive && !lockedCity && phase === 'active' && !statusText ? (
          <p className="capsule-overlay__earth-hint">点击地球选择目的地 · 或直接描述你想去的旅程</p>
        ) : null}

        <div className="capsule-search-card">
          <CapsuleHudInput layout="dock" />

          <div className="capsule-search-card__actions">
            <CapsuleBlindBox />

            <div className="capsule-overlay__mic-wrap">
              {isListening ? (
                <div className="capsule-voice-wave" aria-hidden>
                  {[0, 1, 2, 3, 4].map((bar) => (
                    <span key={bar} className="capsule-voice-wave__bar" style={{ animationDelay: `${bar * 0.08}s` }} />
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                className={`capsule-mic ${isListening ? 'capsule-mic--on' : ''}`}
                aria-label={micTitle}
                title={micTitle}
                disabled={!voice.supported || phase === 'launching'}
                onClick={() => {
                  triggerPulse(0.5);
                  void toggleMic();
                }}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>

            {canSubmit ? (
              <button
                type="button"
                className="capsule-action-btn capsule-action-btn--submit"
                aria-label="提交旅程构想"
                title="提交旅程构想"
                onClick={handleSubmitText}
              >
                <Send className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        {(statusText || phase === 'launching') && !blindBoxActive ? (
          <p
            className={`capsule-overlay__status ${isListening && voice.preview ? 'capsule-overlay__status--preview' : ''}`}
            role="status"
          >
            {phase === 'launching' ? capsuleLaunchStatusText() : statusText}
          </p>
        ) : null}

        <p className="capsule-overlay__beian">
          <a href={SITE_ICP_URL} rel="noreferrer" target="_blank" className="capsule-overlay__beian-link">
            {SITE_ICP_NUMBER}
          </a>
          <span className="capsule-overlay__beian-sep" aria-hidden>
            ·
          </span>
          <a href={SITE_MPS_BEIAN_URL} rel="noreferrer" target="_blank" className="capsule-overlay__beian-link">
            {SITE_MPS_BEIAN_NUMBER}
          </a>
        </p>

      </div>

      <p className="capsule-overlay__copyright">
        © {year} {BRAND_NAME} · {BRAND_DOMAIN}
      </p>
    </div>
  );
}
