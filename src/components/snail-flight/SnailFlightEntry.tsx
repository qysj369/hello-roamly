import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SnailFlightBookingDialog from '@/components/snail-flight/SnailFlightBookingDialog';
import SnailFlightIntroDialog from '@/components/snail-flight/SnailFlightIntroDialog';
import { SNAIL_FLIGHT_ENTRY_BLURB, SNAIL_FLIGHT_ENTRY_LABEL } from '@/lib/snail-flight/copy';
import { paths } from '@/router/paths';
import '@/styles/snail-flight.css';

export default function SnailFlightEntry() {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(false);
  const [intro, setIntro] = useState(false);

  return (
    <div className="snail-flight-entry">
      <button type="button" className="snail-flight-entry__btn" onClick={() => setBooking(true)}>
        {SNAIL_FLIGHT_ENTRY_LABEL}
      </button>
      <p className="snail-flight-entry__blurb">{SNAIL_FLIGHT_ENTRY_BLURB}</p>
      <button type="button" className="snail-flight-entry__more" onClick={() => setIntro(true)}>
        了解蜗牛号
      </button>
      {booking ? (
        <SnailFlightBookingDialog
          onCancel={() => setBooking(false)}
          onConfirm={(fromId, toId) => {
            setBooking(false);
            navigate(
              `${paths.snailFlight}?from=${encodeURIComponent(fromId)}&to=${encodeURIComponent(toId)}`,
            );
          }}
        />
      ) : null}
      {intro ? <SnailFlightIntroDialog onClose={() => setIntro(false)} /> : null}
    </div>
  );
}
