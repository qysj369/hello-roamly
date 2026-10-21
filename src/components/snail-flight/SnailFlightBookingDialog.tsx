import { useMemo, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  SNAIL_FLIGHT_CITIES,
  SNAIL_FLIGHT_DEFAULT_DEST_ID,
  SNAIL_FLIGHT_DEFAULT_ORIGIN_ID,
} from '@/lib/snail-flight/cities';

type SnailFlightBookingDialogProps = {
  onCancel: () => void;
  onConfirm: (fromId: string, toId: string) => void;
};

export default function SnailFlightBookingDialog({
  onCancel,
  onConfirm,
}: SnailFlightBookingDialogProps) {
  const [fromId, setFromId] = useState(SNAIL_FLIGHT_DEFAULT_ORIGIN_ID);
  const [toId, setToId] = useState(SNAIL_FLIGHT_DEFAULT_DEST_ID);
  const invalid = fromId === toId;
  const cities = useMemo(() => SNAIL_FLIGHT_CITIES, []);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (invalid) return;
    onConfirm(fromId, toId);
  };

  return createPortal(
    <div
      className="snail-flight-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="snail-flight-book-title"
    >
      <form className="snail-flight-modal__card snail-flight-form" onSubmit={onSubmit}>
        <h2 id="snail-flight-book-title">选择航线</h2>
        <p>本阶段仅国内城市低空观光。演示示例：趵突泉 → 九如山。</p>
        <label htmlFor="snail-flight-origin">
          起飞地点
          <select
            id="snail-flight-origin"
            value={fromId}
            onChange={(event) => setFromId(event.currentTarget.value)}
          >
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="snail-flight-dest">
          目的地
          <select
            id="snail-flight-dest"
            value={toId}
            onChange={(event) => setToId(event.currentTarget.value)}
          >
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.label}
              </option>
            ))}
          </select>
        </label>
        {invalid ? <p>起飞地和目的地不能相同。</p> : null}
        <div className="snail-flight-form__actions">
          <button type="button" onClick={onCancel}>
            取消
          </button>
          <button type="submit" disabled={invalid}>
            确认航线，登机
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
