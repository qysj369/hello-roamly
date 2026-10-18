type HoloShareLandingHintProps = {
  text: string;
  ctaLabel: string;
  closeLabel: string;
  onCta: () => void;
  onClose: () => void;
};

export default function HoloShareLandingHint({
  text,
  ctaLabel,
  closeLabel,
  onCta,
  onClose,
}: HoloShareLandingHintProps) {
  return (
    <div className="holo-home__share-landing" role="status">
      <p className="holo-home__share-landing-text">{text}</p>
      <div className="holo-home__share-landing-actions">
        <button type="button" className="holo-home__plan-increment" onClick={onCta}>
          {ctaLabel}
        </button>
        <button type="button" className="holo-home__plan-ghost" onClick={onClose} aria-label={closeLabel}>
          {closeLabel}
        </button>
      </div>
    </div>
  );
}
