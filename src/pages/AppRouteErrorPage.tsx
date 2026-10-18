import { isRouteErrorResponse, Link, useNavigate, useRouteError } from 'react-router-dom';
import { paths } from '@/router/paths';
import '@/styles/holo-inner.css';

/**
 * React Router 根错误页（中文）：避免默认英文 Unexpected Application Error。
 */
export default function AppRouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let detail = '页面加载或渲染时出了点问题，请返回首页重试。';
  if (isRouteErrorResponse(error)) {
    detail = `${error.status} ${error.statusText || ''}`.trim() || detail;
  } else if (error instanceof Error) {
    detail = error.message || detail;
  } else if (typeof error === 'string') {
    detail = error;
  }

  return (
    <div className="holo-inner-shell" style={{ minHeight: '100dvh' }}>
      <main
        className="holo-inner-shell__main"
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '48px 20px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ color: '#2c6b58', fontSize: 20, fontWeight: 700 }}>页面暂时无法显示</h1>
        <p style={{ marginTop: 12, color: '#54786c', fontSize: 14, lineHeight: 1.6 }}>{detail}</p>
        <div
          style={{
            marginTop: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            alignItems: 'stretch',
          }}
        >
          <button
            type="button"
            onClick={() => navigate(0)}
            style={{
              minHeight: 44,
              borderRadius: 12,
              border: 'none',
              background: '#2c6b58',
              color: '#f9f7eb',
              fontWeight: 650,
              cursor: 'pointer',
            }}
          >
            刷新重试
          </button>
          <Link
            to={paths.home}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 44,
              borderRadius: 12,
              border: '1.5px solid #b7cdc4',
              background: '#fffef6',
              color: '#2c6b58',
              fontWeight: 650,
              textDecoration: 'none',
            }}
          >
            返回首页
          </Link>
        </div>
      </main>
    </div>
  );
}
