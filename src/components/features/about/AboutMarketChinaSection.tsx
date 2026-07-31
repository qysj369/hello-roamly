import { MapPinned } from 'lucide-react';
import { copy } from '@/content/copy';
import MotionSection from '@/components/motion/MotionSection';
import { isChinaPrimaryMarket, PRIMARY_MARKET_CODE } from '@/lib/config/marketScope';

export default function AboutMarketChinaSection() {
  const chinaFirst = isChinaPrimaryMarket();

  return (
    <MotionSection
      className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-white to-white p-6 shadow-sm"
      delay={0.05}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
            <MapPinned className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="text-base font-semibold text-slate-900">{copy.about.marketChinaTitle}</h3>
        </div>
        {chinaFirst ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
            {copy.about.marketChinaBadge} · {PRIMARY_MARKET_CODE}
          </span>
        ) : (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
            GLOBAL
          </span>
        )}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">{copy.about.marketChinaLead}</p>

      {chinaFirst ? (
        <ul className="mt-4 space-y-2 border-t border-emerald-100/80 pt-4">
          {copy.about.marketChinaBullets.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-relaxed text-slate-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{copy.about.marketChinaGlobalNote}</p>
      )}

      {chinaFirst && (
        <div className="mt-5 rounded-xl border border-emerald-100 bg-white/80 p-4">
          <p className="text-xs font-semibold text-slate-800">{copy.about.marketChinaExpandTitle}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{copy.about.marketChinaExpandBody}</p>
        </div>
      )}
    </MotionSection>
  );
}
