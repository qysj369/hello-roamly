import { Wallet } from 'lucide-react';
import { copy } from '@/content/copy';
import PaymentMethodPicker from '@/components/features/payment/PaymentMethodPicker';
import MotionSection from '@/components/motion/MotionSection';
import { isChinaPrimaryMarket } from '@/lib/config/marketScope';
import { listPaymentChannels } from '@/lib/payment';

export default function AboutPaymentSection() {
  if (!isChinaPrimaryMarket()) {
    return null;
  }

  const channels = listPaymentChannels();

  return (
    <MotionSection
      className="rounded-2xl border border-sky-200/90 bg-gradient-to-br from-sky-50/80 via-white to-white p-6 shadow-sm"
      delay={0.08}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600/10 text-sky-700">
          <Wallet className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{copy.about.paymentTitle}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{copy.about.paymentBadge}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">{copy.about.paymentLead}</p>

      <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
        {copy.about.paymentBullets.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-sky-500" aria-hidden>
              ·
            </span>
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl border border-sky-100 bg-white/90 p-4">
        <p className="text-xs font-semibold text-slate-800">{copy.about.paymentDemoTitle}</p>
        <p className="mt-1 text-[11px] text-slate-500">{copy.about.paymentDemoHint}</p>
        <PaymentMethodPicker
          className="mt-3"
          amountFen={1}
          title="hello-roamly 支付接口验证"
          description="关于页演示单，不会真实扣款"
          bizType="about_demo"
          allowDemo
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-slate-500 sm:grid-cols-2">
        {channels.map((channel) => (
          <div key={channel.id} className="rounded-lg bg-slate-50 px-2 py-1.5">
            <dt className="font-medium text-slate-700">{channel.label}</dt>
            <dd>{channel.available ? '可创建订单' : channel.unavailableReason}</dd>
          </div>
        ))}
      </dl>
    </MotionSection>
  );
}
