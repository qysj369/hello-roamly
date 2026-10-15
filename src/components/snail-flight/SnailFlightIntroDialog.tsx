import { SNAIL_FLIGHT_INTRO_BODY, SNAIL_FLIGHT_INTRO_TITLE } from '@/lib/snail-flight/copy';

type SnailFlightIntroDialogProps = {
  onClose: () => void;
};

export default function SnailFlightIntroDialog({ onClose }: SnailFlightIntroDialogProps) {
  return (
    <div
      className="snail-flight-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="snail-flight-intro-title"
    >
      <div className="snail-flight-modal__card">
        <h2 id="snail-flight-intro-title">{SNAIL_FLIGHT_INTRO_TITLE}</h2>
        <pre>{SNAIL_FLIGHT_INTRO_BODY}</pre>
        <div className="snail-flight-form__actions">
          <button type="button" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
