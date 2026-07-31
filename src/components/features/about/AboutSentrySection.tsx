import { Bug, Radio } from 'lucide-react';
import { copy } from '@/content/copy';
import MotionSection from '@/components/motion/MotionSection';
import { Button } from '@/components/ui';
import {
  getSentryDsn,
  getSentryEnvironment,
  isSentryEnabled,
  reportError,
} from '@/lib/errors';

export default function AboutSentrySection() {
  const enabled = isSentryEnabled();
  const dsnConfigured = Boolean(getSentryDsn());

  const sendTestEvent = () => {
    reportError(new Error('Sentry 连通性测试'), {
      tags: { source: 'about-test' },
      extra: { page: 'about' },
    });
    window.alert('已发送测试事件，请在 Sentry Issues 中查看（可能有 1–2 分钟延迟）');
  };

  return (
    <MotionSection
      className="rounded-2xl border border-violet-200/90 bg-gradient-to-br from-violet-50/70 via-white to-white p-6 shadow-sm"
      delay={0.18}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/10 text-violet-700">
            <Bug className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{copy.about.sentryTitle}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{copy.about.sentryBadge}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            enabled
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          <Radio className="h-3 w-3" aria-hidden />
          {enabled ? '已启用' : dsnConfigured ? '已配置未启用' : '未配置'}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-600">{copy.about.sentryLead}</p>

      <ul className="mt-4 list-inside list-disc space-y-1 text-xs text-slate-600">
        {copy.about.sentryBullets.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <dl className="mt-4 grid gap-2 rounded-xl border border-slate-200/80 bg-white/80 p-3 text-xs">
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500">环境</dt>
          <dd className="font-mono text-slate-800">{getSentryEnvironment()}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-slate-500">DSN</dt>
          <dd className="truncate font-mono text-slate-800">
            {dsnConfigured ? '已配置' : '未配置'}
          </dd>
        </div>
      </dl>

      {enabled && (
        <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={sendTestEvent}>
          发送测试事件
        </Button>
      )}
    </MotionSection>
  );
}
