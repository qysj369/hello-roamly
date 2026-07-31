import SiteComplianceBar from '@/components/layout/SiteComplianceBar';
import MotionSection from '@/components/motion/MotionSection';

/** 关于页 — 联系我们 / 投诉举报 */
export default function AboutContactSection() {
  return (
    <MotionSection
      id="contact"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-base font-semibold text-slate-900">联系我们</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        如发现违法违规或不良信息，请通过下方邮箱举报。我们将在 24 小时内受理，48 小时内核查处理并反馈。
      </p>
      <SiteComplianceBar variant="about" className="mt-4" />
    </MotionSection>
  );
}
