import { useEffect, useId, useRef } from 'react';
import { getHoloInspireSceneDetail } from '@/data/holoInspireScenes';
import { useI18n } from '@/i18n/useI18n';

type HoloInspireSceneDialogProps = {
  sceneKey: string | null;
  onClose: () => void;
  /** 交给首页追问条：补齐天数/人群/预算/偏好后再进 AI */
  onPlanScene?: (query: string, destination?: string) => void;
};

/** 漫游灵感种草弹窗：CTA → 首页澄清追问，再生成穷游攻略 */
export default function HoloInspireSceneDialog({
  sceneKey,
  onClose,
  onPlanScene,
}: HoloInspireSceneDialogProps) {
  const { messages: t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const open = Boolean(sceneKey);
  const detail = sceneKey ? getHoloInspireSceneDetail(sceneKey) : null;
  const copy = sceneKey ? t.tripCards[sceneKey as keyof typeof t.tripCards] : null;

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

  const goPlan = () => {
    if (!detail || !copy || !onPlanScene) return;
    const nearby = detail.nearbyPlaces[0] ?? copy.title;
    const query = `${copy.title}：${copy.subtitle}。参考近郊：${detail.nearbyPlaces.join('、')}`;
    onClose();
    onPlanScene(query, nearby);
  };

  return (
    <dialog
      ref={dialogRef}
      className="holo-home__preview-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {detail && copy ? (
        <div className="holo-home__preview-panel holo-home__preview-panel--scene">
          <div className="holo-home__preview-head">
            <h3 id={titleId} className="holo-home__preview-title">
              {copy.title}
              <span className="holo-home__preview-eyebrow">{t.inspire.sectionTitle}</span>
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

          <div className="holo-home__preview-body">
            <p className="holo-home__preview-intro">{detail.intro}</p>
            <p className="holo-home__preview-subline">{copy.subtitle}</p>
            <div className="holo-home__preview-block">
              <h4>{t.inspire.nearbyTitle}</h4>
              <ul>
                {detail.nearbyPlaces.map((place) => (
                  <li key={place}>{place}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="holo-home__preview-foot">
            <button type="button" className="holo-home__preview-cta" onClick={goPlan}>
              {t.inspire.goPlan}
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
