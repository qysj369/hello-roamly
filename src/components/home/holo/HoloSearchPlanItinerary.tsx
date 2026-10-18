import { useState } from 'react';
import { localizePlanBudgetDisplayForPlan } from '@/lib/home/localizePlanBudgetTip';
import {
  PLAN_DAY_PHOTO_FALLBACK,
  resolveItineraryDayPhoto,
} from '@/lib/home/resolveItineraryDayPhoto';
import type { SearchPlanDay, SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';
import { ensureSpotPlayHighlight } from '@/utils/planResultDisplay';

type HoloSearchPlanItineraryProps = {
  plan: SearchStructuredPlan;
};

function numberedTip(tip: string, index: number): string {
  return /^\d+[.、]/.test(tip) ? tip : `${index + 1}. ${tip}`;
}

function compactLine(text: string, max = 16): string {
  const line =
    text
      .replace(/【行程亮点】/g, '')
      .replace(/^(必体验|时间充裕可选)[:：]\s*/u, '')
      .split(/[。；;]/u)[0]
      ?.trim() || text.trim();
  return line.length > max ? `${line.slice(0, max)}…` : line;
}

function spotCoreLine(name: string, intro: string): string {
  return compactLine(ensureSpotPlayHighlight(name, intro), 16);
}

function foodCoreLine(shop: string, dish: string): string {
  const shopBit = shop.replace(/（[^）]*）$/u, '').trim();
  const dishBit = dish.trim();
  if (shopBit && dishBit && dishBit !== shopBit) {
    return compactLine(`${shopBit} · ${dishBit}`, 20);
  }
  return compactLine(shopBit || dishBit, 20);
}

function withoutStayEcho(text: string, stay: string): string {
  let next = text
    .replace(/住宿片区[·:：]\s*[^\n。；]*/g, '')
    .replace(/今晚住宿片区[：:][^\n。；]*/g, '')
    .replace(/从昨晚住宿片区[「"][^」"]+[」"]出发[，,]?/g, '')
    .trim();
  if (stay) {
    next = next.split(stay).join('').replace(/（三天不换住[^）]*）/g, '');
  }
  return next.replace(/\s{2,}/g, ' ').trim();
}

function DayPhoto({
  day,
  plan,
  used,
}: {
  day: SearchPlanDay;
  plan: SearchStructuredPlan;
  used: Set<string>;
}) {
  const image = resolveItineraryDayPhoto(plan, day, used);
  const [src, setSrc] = useState(image.src);
  return (
    <div className="holo-home__plan-day-photo">
      <img
        src={src}
        alt={image.alt}
        onError={() => {
          if (src === PLAN_DAY_PHOTO_FALLBACK) return;
          setSrc(PLAN_DAY_PHOTO_FALLBACK);
        }}
      />
    </div>
  );
}

export default function HoloSearchPlanItinerary({ plan }: HoloSearchPlanItineraryProps) {
  const total = localizePlanBudgetDisplayForPlan(plan, '合计');
  const fallbackTotal = plan.budgetList.find((item) => item.item === '合计');
  const totalLabel = total?.amount ?? (fallbackTotal ? `人均${fallbackTotal.perPerson}元` : null);
  const stayArea = plan.dayList.map((day) => day.hotelArea.trim()).find(Boolean) ?? '';
  const photoUsed = new Set<string>();

  return (
    <div className="holo-home__plan-sheet-body">
      <section className="holo-home__plan-block" aria-label="预算明细">
        <details className="holo-home__plan-budget-fold">
          <summary className="holo-home__plan-budget-summary">
            <span>预算明细</span>
            {totalLabel ? <span className="holo-home__plan-budget-sum">{totalLabel}</span> : null}
          </summary>
          <div className="holo-home__plan-budget-grid">
            {plan.budgetList.map((item) => {
              const local = localizePlanBudgetDisplayForPlan(plan, item.item);
              const amount = local?.amount ?? `人均 ${item.perPerson}元`;
              const tip = local?.detail ?? item.tip;
              return (
                <article key={item.item} className="holo-home__plan-budget-card">
                  <p className="holo-home__plan-budget-name">{item.item}</p>
                  <p className="holo-home__plan-budget-num">{amount}</p>
                  {tip ? <p className="holo-home__plan-muted">{tip}</p> : null}
                </article>
              );
            })}
          </div>
        </details>
      </section>

      <section className="holo-home__plan-block" aria-label="每日行程">
        <h4 className="holo-home__plan-block-title">每日行程</h4>
        {stayArea ? <p className="holo-home__plan-stay">住宿片区 · {stayArea}</p> : null}
        <div className="holo-home__plan-days">
          {plan.dayList.map((day) => {
            const foldBits = [
              ...day.traffic.map((item) => withoutStayEcho(item.desc.trim(), stayArea)).filter(Boolean),
              withoutStayEcho(day.tips.replace(/【行程亮点】/g, '').trim(), stayArea),
            ].filter(Boolean);
            return (
              <article key={day.day} className="holo-home__plan-day-card">
                <DayPhoto day={day} plan={plan} used={photoUsed} />
                <h5 className="holo-home__plan-day-title">
                  D{day.day} {day.title || `第${day.day}天`}
                </h5>
                {day.traffic[0] && withoutStayEcho(day.traffic[0].desc.trim(), stayArea) ? (
                  <p className="holo-home__plan-day-core">
                    <span className="holo-home__plan-label">交通</span>
                    {compactLine(withoutStayEcho(day.traffic[0].desc.trim(), stayArea), 22)}
                  </p>
                ) : null}
                {day.spots.length > 0 ? (
                  <div className="holo-home__plan-day-section">
                    <p className="holo-home__plan-label">景点</p>
                    <ul className="holo-home__plan-spot-list">
                      {day.spots.map((spot) => (
                        <li key={`${day.day}-${spot.name}`} className="holo-home__plan-spot">
                          <strong>{spot.name}</strong>
                          <span className="holo-home__plan-spot-highlight">
                            {spotCoreLine(spot.name, spot.intro)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {day.foods.length > 0 ? (
                  <div className="holo-home__plan-day-section">
                    <p className="holo-home__plan-label">美食</p>
                    <ul className="holo-home__plan-food-list">
                      {day.foods.map((food) => (
                        <li key={`${day.day}-${food.shop}`}>{foodCoreLine(food.shop, food.dish)}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {foldBits.length > 0 ? (
                  <details className="holo-home__plan-day-fold">
                    <summary>展开交通与贴士</summary>
                    {day.traffic.length > 0 ? (
                      <div className="holo-home__plan-day-section">
                        <p className="holo-home__plan-label">交通</p>
                        <ul>
                          {day.traffic
                            .map((item) => withoutStayEcho(item.desc.trim(), stayArea))
                            .filter(Boolean)
                            .map((desc, index) => (
                              <li key={`${day.day}-t-${index}`}>{desc}</li>
                            ))}
                        </ul>
                      </div>
                    ) : null}
                    {withoutStayEcho(day.tips.replace(/【行程亮点】/g, '').trim(), stayArea) ? (
                      <p className="holo-home__plan-muted">
                        {withoutStayEcho(day.tips.replace(/【行程亮点】/g, '').trim(), stayArea)}
                      </p>
                    ) : null}
                  </details>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      {plan.globalTips.length > 0 ? (
        <section className="holo-home__plan-block" aria-label="本次行程专属贴士">
          <details className="holo-home__plan-tips-fold">
            <summary className="holo-home__plan-block-title">本次行程专属贴士</summary>
            <ul className="holo-home__plan-tips">
              {plan.globalTips.map((tip, index) => (
                <li key={tip}>{numberedTip(tip, index)}</li>
              ))}
            </ul>
          </details>
        </section>
      ) : null}
    </div>
  );
}
