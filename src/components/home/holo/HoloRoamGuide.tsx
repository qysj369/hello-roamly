import { useEffect } from 'react';
import { useI18n } from '@/i18n/useI18n';
import { ROAM_GUIDE_SEEN_KEY } from '@/lib/drive/driveCityStorage';

type HoloRoamGuideProps = {
  open: boolean;
  onClose: () => void;
};

function markRoamGuideSeen() {
  try {
    localStorage.setItem(ROAM_GUIDE_SEEN_KEY, '1');
  } catch {
    /* ignore */
  }
}

/** 首次访问轻引导气泡（不遮挡整页、不改驾驶舱底层） */
export default function HoloRoamGuide({ open, onClose }: HoloRoamGuideProps) {
  const { messages: t } = useI18n();

  useEffect(() => {
    if (!open) return undefined;
    const timer = window.setTimeout(() => {
      markRoamGuideSeen();
      onClose();
    }, 5200);
    return () => window.clearTimeout(timer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="holo-roam-bubble" role="status" aria-live="polite">
      <p className="holo-roam-bubble__text">{t.roamGuide.text}</p>
      <button
        type="button"
        className="holo-roam-bubble__close"
        onClick={() => {
          markRoamGuideSeen();
          onClose();
        }}
        aria-label={t.roamGuide.close}
      >
        ×
      </button>
      <span className="holo-roam-bubble__arrow" aria-hidden />
    </div>
  );
}

export function hasSeenRoamGuide(): boolean {
  try {
    return localStorage.getItem(ROAM_GUIDE_SEEN_KEY) === '1';
  } catch {
    return true;
  }
}
