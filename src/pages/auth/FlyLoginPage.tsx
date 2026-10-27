import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFlyHomeCopy } from '@/i18n/flyHomeCopy';
import { useI18n } from '@/i18n/useI18n';
import { paths } from '@/router/paths';
import '@/styles/fly-home.css';

/** 登录路由占位。现有站点没有独立账号接口，这里只做演示，不创建会话。 */
export default function FlyLoginPage() {
  const { locale, setPreferredLocale } = useI18n();
  const copy = getFlyHomeCopy(locale);
  const [toast, setToast] = useState('');
  const timer = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN';
  }, [locale]);

  const showToast = (message: string) => {
    setToast(message);
    if (timer.current) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => setToast(''), 2600);
  };

  return (
    <div className="fly-home">
      <nav className="nav solid">
        <Link to={paths.home} className="logo">
          蜗牛旅行 <span className="en">ROAMLY</span>
        </Link>
        <div className="nav-right">
          <button
            className="lang-btn"
            type="button"
            onClick={() => setPreferredLocale(locale === 'en' ? 'zh' : 'en')}
          >
            {copy.lang}
          </button>
          <Link className="login-btn" to={paths.home}>
            {copy.backHome}
          </Link>
        </div>
      </nav>
      <main className="login-page">
        <form
          className="login-card"
          onSubmit={(event) => {
            event.preventDefault();
            showToast(copy.mToast);
          }}
        >
          <h1 className="serif">{copy.mTitle}</h1>
          <p className="m-sub">{copy.mSub}</p>
          <input type="email" name="email" autoComplete="email" placeholder="邮箱 / Email" />
          <input type="tel" name="phone" autoComplete="tel" placeholder="手机号 / Phone" />
          <button className="btn-primary" type="submit">
            {copy.mSubmit}
          </button>
          <div className="divider">{copy.mOr}</div>
          <div className="sns">
            <button type="button" onClick={() => showToast(copy.mSnsToast)}>
              {copy.mWechat}
            </button>
            <button type="button" onClick={() => showToast(copy.mSnsToast)}>
              {copy.mGoogle}
            </button>
          </div>
          <p className="demo-note">{copy.mDemo}</p>
        </form>
      </main>
      <div className={toast ? 'toast show' : 'toast'} role="status">
        {toast}
      </div>
    </div>
  );
}
