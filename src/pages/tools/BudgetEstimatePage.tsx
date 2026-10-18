import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import HoloInnerHeader from '@/components/layout/HoloInnerHeader';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { budgetPageSeo } from '@/lib/seo';
import { FREE_FOREVER_POLICY_LINE } from '@/lib/config/productPositioning';
import { paths } from '@/router/paths';
import '@/styles/holo-inner.css';

type Pace = 'loose' | 'balanced' | 'packed';

const PACE_FACTOR: Record<Pace, number> = {
  loose: 0.85,
  balanced: 1,
  packed: 1.2,
};

const PACE_LABEL: Record<Pace, string> = {
  loose: '松弛闲逛',
  balanced: '均衡节奏',
  packed: '行程稍满',
};

/**
 * 精打细算 · 出行预算测算（永久免费）
 * 仅做分项参考，无预订 / 下单跳转。
 */
export default function BudgetEstimatePage() {
  usePageSeo(budgetPageSeo());

  const [city, setCity] = useState('杭州');
  const [days, setDays] = useState(3);
  const [people, setPeople] = useState(2);
  const [pace, setPace] = useState<Pace>('balanced');

  const estimate = useMemo(() => {
    const factor = PACE_FACTOR[pace];
    const perDayTransport = 45;
    const perDayFood = 95;
    const perNightStay = 220;
    const ticketsPerDay = 60;
    const nights = Math.max(days - 1, 0);

    const transport = Math.round(perDayTransport * days * people * factor);
    const food = Math.round(perDayFood * days * people * factor);
    const stay = Math.round(perNightStay * nights * Math.ceil(people / 2) * factor);
    const tickets = Math.round(ticketsPerDay * days * people * (pace === 'loose' ? 0.7 : factor));
    const total = transport + food + stay + tickets;
    const perPerson = Math.round(total / Math.max(people, 1));

    return { transport, food, stay, tickets, total, perPerson };
  }, [days, people, pace]);

  return (
    <div className="holo-inner-shell">
      <HoloInnerHeader pageLabel="精打细算" />
      <main
        className="holo-inner-shell__main"
        style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 64px' }}
      >
        <h1 style={{ fontSize: 22, margin: '0 0 8px', color: 'var(--text-title)' }}>
          精打细算 · 出行预算测算
        </h1>
        <p style={{ color: 'var(--theme-muted)', lineHeight: 1.7, marginBottom: 8 }}>
          按城市、天数、人数与节奏估算分项花费参考区间。仅作路线参考与出行规划，不提供预订跳转。
        </p>
        <p style={{ color: 'var(--theme-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
          {FREE_FOREVER_POLICY_LINE}
        </p>

        <form
          style={{ display: 'grid', gap: 14, marginBottom: 24 }}
          onSubmit={(event) => event.preventDefault()}
        >
          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>目的地（参考）</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="例如：济南 / 杭州"
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--theme-line)',
                background: 'var(--bg-card)',
              }}
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
              <span>天数</span>
              <input
                type="number"
                min={1}
                max={14}
                value={days}
                onChange={(e) => setDays(Math.max(1, Math.min(14, Number(e.target.value) || 1)))}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--theme-line)',
                  background: 'var(--bg-card)',
                }}
              />
            </label>
            <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
              <span>人数</span>
              <input
                type="number"
                min={1}
                max={8}
                value={people}
                onChange={(e) => setPeople(Math.max(1, Math.min(8, Number(e.target.value) || 1)))}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--theme-line)',
                  background: 'var(--bg-card)',
                }}
              />
            </label>
          </div>

          <fieldset style={{ margin: 0, padding: 0, border: 'none' }}>
            <legend style={{ fontSize: 14, marginBottom: 8 }}>出行节奏</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(Object.keys(PACE_LABEL) as Pace[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPace(key)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 999,
                    border:
                      pace === key
                        ? '1.5px solid var(--color-main)'
                        : '1px solid var(--theme-line)',
                    background:
                      pace === key
                        ? 'color-mix(in srgb, var(--color-main) 12%, var(--bg-card))'
                        : 'var(--bg-card)',
                    color: 'var(--color-main)',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {PACE_LABEL[key]}
                </button>
              ))}
            </div>
          </fieldset>
        </form>

        <section
          aria-live="polite"
          style={{
            padding: 16,
            borderRadius: 14,
            border: '1px solid color-mix(in srgb, var(--color-sand) 40%, var(--theme-line))',
            background: 'color-mix(in srgb, var(--theme-bg-soft, #f3f0e8) 70%, var(--bg-card))',
          }}
        >
          <h2 style={{ margin: '0 0 12px', fontSize: 17, color: 'var(--text-title)' }}>
            {city.trim() || '目的地'} · {days} 天 · {people} 人参考
          </h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
            <li>交通约 ¥{estimate.transport}</li>
            <li>餐饮约 ¥{estimate.food}</li>
            <li>住宿约 ¥{estimate.stay}</li>
            <li>门票 / 体验约 ¥{estimate.tickets}</li>
          </ul>
          <p style={{ margin: '14px 0 0', fontSize: 18, fontWeight: 700, color: 'var(--color-main)' }}>
            合计约 ¥{estimate.total}
            <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 500, color: 'var(--text-body)' }}>
              人均约 ¥{estimate.perPerson}
            </span>
          </p>
          <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--theme-muted)', lineHeight: 1.6 }}>
            数值为宽松估算，受季节与个人习惯影响较大；请结合本地人视角再微调路线参考。
          </p>
        </section>

        <p style={{ marginTop: 24, fontSize: 14 }}>
          <Link to={paths.ai} style={{ color: 'var(--color-main)' }}>
            去 AI 漫行攻略做出行规划 →
          </Link>
        </p>
      </main>
    </div>
  );
}
