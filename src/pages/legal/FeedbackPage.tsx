import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import HoloInnerHeader from '@/components/layout/HoloInnerHeader';
import SiteComplianceBar from '@/components/layout/SiteComplianceBar';
import BrandValueWhisper from '@/components/brand/BrandValueWhisper';
import { usePageSeo } from '@/hooks/browser/usePageSeo';
import { useI18n } from '@/i18n/useI18n';
import { getApiErrorMessage } from '@/lib/api/errors';
import { paths } from '@/router/paths';
import { submitProductFeedback, type FeedbackCategory } from '@/services/feedback/feedbackApi';
import '@/styles/holo-inner.css';
import '@/styles/brand-whisper.css';

const CATEGORIES: { id: FeedbackCategory; label: string }[] = [
  { id: 'city_error', label: '城市信息错误' },
  { id: 'guide_issue', label: '攻略问题' },
  { id: 'ui_bug', label: '交互 / Bug' },
  { id: 'other', label: '其他建议' },
];

/** 产品反馈页：收集城市文案、攻略、交互问题，持续迭代用 */
function readFeedbackCategory(raw: string | null): FeedbackCategory {
  if (raw === 'city_error' || raw === 'guide_issue' || raw === 'ui_bug' || raw === 'other') return raw;
  return 'city_error';
}

export default function FeedbackPage() {
  const { messages: t } = useI18n();
  const title = t.footer.feedback;
  const [searchParams] = useSearchParams();

  usePageSeo({
    title: `${title} | ${t.brand.logo}`,
    description: '反馈城市信息错误、攻略问题或交互 bug，帮助蜗牛旅行持续迭代。',
  });

  const [category, setCategory] = useState<FeedbackCategory>(() =>
    readFeedbackCategory(searchParams.get('category')),
  );
  const [message, setMessage] = useState('');
  const [city, setCity] = useState(() => searchParams.get('city')?.trim() ?? '');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [statusText, setStatusText] = useState('');

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus('loading');
    setStatusText('');
    try {
      const result = await submitProductFeedback({
        category,
        message,
        city: city.trim() || undefined,
        page: typeof window !== 'undefined' ? window.location.pathname : paths.feedback,
        contact: contact.trim() || undefined,
      });
      setStatus('ok');
      setStatusText(result.message);
      setMessage('');
    } catch (error) {
      setStatus('error');
      setStatusText(getApiErrorMessage(error, '提交失败，请稍后重试'));
    }
  }

  return (
    <div className="holo-inner-shell">
      <HoloInnerHeader pageLabel={title} />
      <main
        className="holo-inner-shell__main"
        style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 64px' }}
      >
        <h1 style={{ fontSize: 22, margin: '0 0 8px', color: 'var(--text-title)' }}>{title}</h1>
        <p style={{ color: 'var(--theme-muted)', lineHeight: 1.7, marginBottom: 20 }}>
          欢迎反馈城市信息错误、攻略问题或交互 bug。我们处于内测阶段，你的意见会直接用于打磨免费基座。
        </p>

        <form onSubmit={onSubmit} className="space-y-4" style={{ display: 'grid', gap: 14 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>反馈类型</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--theme-line)',
                background: 'var(--bg-card)',
              }}
            >
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>相关城市（可选）</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="如：杭州"
              maxLength={40}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--theme-line)',
                background: 'var(--bg-card)',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>具体说明</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={8}
              maxLength={2000}
              rows={6}
              placeholder="请描述问题、复现路径或期望改进…"
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--theme-line)',
                background: 'var(--bg-card)',
                resize: 'vertical',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6, fontSize: 14 }}>
            <span>联系方式（可选）</span>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="邮箱或微信，便于回访"
              maxLength={120}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid var(--theme-line)',
                background: 'var(--bg-card)',
              }}
            />
          </label>

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              justifySelf: 'start',
              padding: '10px 18px',
              borderRadius: 999,
              border: 'none',
              background: 'var(--color-main)',
              color: '#fff',
              fontWeight: 600,
              cursor: status === 'loading' ? 'wait' : 'pointer',
            }}
          >
            {status === 'loading' ? '提交中…' : '提交反馈'}
          </button>

          {statusText ? (
            <p
              role="status"
              style={{
                margin: 0,
                fontSize: 13,
                color: status === 'error' ? '#9a4a3a' : 'var(--color-main)',
              }}
            >
              {statusText}
            </p>
          ) : null}
        </form>

        <p style={{ marginTop: 28 }}>
          <Link to={paths.home} style={{ color: 'var(--color-main)' }}>
            {t.tabs.home}
          </Link>
        </p>

        <BrandValueWhisper showValues className="mt-8" />
        <SiteComplianceBar className="mt-8" />
      </main>
    </div>
  );
}
