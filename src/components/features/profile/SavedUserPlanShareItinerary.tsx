import { getSharePlanOutline, sharePlanDayTitle } from '@/lib/home/sharePlanOutline';
import type { SearchPlanDay, SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

type SavedUserPlanShareItineraryProps = {
  plan: SearchStructuredPlan;
};

function DayBody({ day }: { day: SearchPlanDay }) {
  return (
    <div>
      <p className="holo-plan-share__day-title">{sharePlanDayTitle(day)}</p>
      {day.hotelArea.trim() ? (
        <p className="holo-plan-share__day-meta">住宿片区 · {day.hotelArea.trim()}</p>
      ) : null}
      {day.traffic.length > 0 ? (
        <ul className="holo-plan-share__list">
          {day.traffic.map((item, index) =>
            item.desc.trim() ? <li key={`${day.day}-t-${index}`}>{item.desc.trim()}</li> : null,
          )}
        </ul>
      ) : null}
      {day.spots.length > 0 ? (
        <ul className="holo-plan-share__list">
          {day.spots.map((spot) => (
            <li key={`${day.day}-${spot.name}`}>
              <strong>{spot.name}</strong>
              {spot.intro.trim() ? ` · ${spot.intro.trim()}` : ''}
            </li>
          ))}
        </ul>
      ) : null}
      {day.foods.length > 0 ? (
        <ul className="holo-plan-share__list">
          {day.foods.map((food) => (
            <li key={`${day.day}-${food.shop}`}>
              {food.shop} · {food.dish}
              {food.perCost > 0 ? ` · 人均${food.perCost}元` : ''}
            </li>
          ))}
        </ul>
      ) : null}
      {day.tips.trim() ? <p className="holo-plan-share__day-meta">【行程亮点】{day.tips.trim()}</p> : null}
    </div>
  );
}

export default function SavedUserPlanShareItinerary({ plan }: SavedUserPlanShareItineraryProps) {
  const outline = getSharePlanOutline(plan);

  return (
    <article className="holo-plan-share" aria-label="行程攻略">
      <section className="holo-plan-share__block" aria-label="预算">
        <h2 className="holo-plan-share__title">预算</h2>
        <p className="holo-plan-share__budget">{outline.budgetLine}</p>
      </section>

      <section className="holo-plan-share__block" aria-label="每日行程">
        <h2 className="holo-plan-share__title">每日行程</h2>
        <ol className="holo-plan-share__days">
          {plan.dayList.map((day) => (
            <li key={day.day} className="holo-plan-share__day">
              <span className="holo-plan-share__day-index">D{day.day}</span>
              <DayBody day={day} />
            </li>
          ))}
        </ol>
      </section>

      {outline.tips.length > 0 ? (
        <section className="holo-plan-share__block" aria-label="本次行程专属贴士">
          <h2 className="holo-plan-share__title">本次行程专属贴士</h2>
          <ul className="holo-plan-share__tips">
            {outline.tips.map((tip, index) => (
              <li key={tip}>{/^\d+[.、]/.test(tip) ? tip : `${index + 1}. ${tip}`}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
