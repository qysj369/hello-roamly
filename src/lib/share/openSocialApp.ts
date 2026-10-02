export type OpenSocialAppLaunch = {
  text?: string;
  iosComposeUrl?: string;
  skipWebFallback?: boolean;
};

export type OpenSocialAppResult = 'opened' | 'failed' | 'skipped';

/** 与首页移动断点一致：≤768 视为窄屏。 */
export const SHARE_MOBILE_VIEWPORT_MAX = 768;

const APP_HANDOFF_MS = 1400;

export function isMobileShareViewport(width = typeof window !== 'undefined' ? window.innerWidth : 1024): boolean {
  return width <= SHARE_MOBILE_VIEWPORT_MAX;
}

export function isMobileShareUserAgent(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/Android|iPhone|iPad|iPod/i.test(ua)) return true;
  return navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1;
}

function isDesktopShareUserAgent(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return false;
  if (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1) return false;
  return /Windows NT|Macintosh|X11|Linux/i.test(ua);
}

/**
 * 视口 768 + UA 双重校验：
 * - 明确桌面 UA → 始终 PC（缩窄窗口也不唤起 App）
 * - 手机 / 平板 UA → 始终移动端（横屏超过 768 仍可 Web Share / Scheme）
 * - 其余未知 UA → 以视口 ≤768 为准
 */
export function isLikelyMobileShareDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (isDesktopShareUserAgent()) return false;
  if (isMobileShareUserAgent()) return true;
  return isMobileShareViewport();
}

export function isAndroidShareDevice(): boolean {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
}

export function canUseWebShare(): boolean {
  return (
    isLikelyMobileShareDevice() &&
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function'
  );
}

export function stayOnPageFallbackUrl(webUrl: string): string {
  if (typeof window !== 'undefined' && window.location?.href) {
    return window.location.href;
  }
  return webUrl;
}

export function androidIntentUrl(appUrl: string, androidPackage: string, fallbackUrl: string): string {
  const schemeEnd = appUrl.indexOf('://');
  const scheme = schemeEnd >= 0 ? appUrl.slice(0, schemeEnd) : appUrl;
  const path = schemeEnd >= 0 ? appUrl.slice(schemeEnd + 3).replace(/^\/*/, '') : '';
  return `intent://${path}#Intent;scheme=${scheme};package=${androidPackage};S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`;
}

export function resolveSocialLaunchUrl(
  appUrl: string,
  webUrl: string,
  androidPackage?: string,
  launch?: OpenSocialAppLaunch,
): string {
  if (!isAndroidShareDevice() && launch?.iosComposeUrl) {
    return launch.iosComposeUrl;
  }
  const scheme = launch?.iosComposeUrl || appUrl;
  if (isAndroidShareDevice() && androidPackage) {
    return androidIntentUrl(scheme, androidPackage, stayOnPageFallbackUrl(webUrl));
  }
  return scheme;
}

function launchWithoutLeavingPage(target: string): void {
  if (typeof document === 'undefined') return;
  // iOS/Android 都会拦 iframe 自定义协议；用用户手势里的 <a> 点击才能唤起 App。
  const link = document.createElement('a');
  link.href = target;
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-hidden', 'true');
  link.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0';
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
  }, 2000);
}

function handoffWaitMs(): number {
  if (import.meta.env.MODE === 'test') return 0;
  return APP_HANDOFF_MS;
}

function waitForAppHandoff(ms: number): Promise<Exclude<OpenSocialAppResult, 'skipped'>> {
  if (ms <= 0) return Promise.resolve('failed');
  return new Promise((resolve) => {
    let settled = false;
    const done = (result: Exclude<OpenSocialAppResult, 'skipped'>) => {
      if (settled) return;
      settled = true;
      document.removeEventListener('visibilitychange', onLeave);
      window.removeEventListener('pagehide', onLeave);
      window.removeEventListener('blur', onLeave);
      window.clearTimeout(timer);
      resolve(result);
    };
    const onLeave = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        done('opened');
        return;
      }
      done('opened');
    };
    const timer = window.setTimeout(() => done('failed'), ms);
    document.addEventListener('visibilitychange', onLeave);
    window.addEventListener('pagehide', onLeave);
    window.addEventListener('blur', onLeave);
  });
}

/** 仅电脑打开官网新标签。手机禁止跳转，避免卡在第三方站点。 */
export function openSocialWebPage(webUrl: string): void {
  if (typeof window === 'undefined') return;
  if (isLikelyMobileShareDevice()) return;
  window.open(webUrl, '_blank', 'noopener');
}

/** 仅移动端唤起 App。禁止跳到第三方官网，避免打得开却回不来。 */
export async function openSocialApp(
  appUrl: string,
  webUrl: string,
  androidPackage?: string,
  launch?: OpenSocialAppLaunch,
): Promise<OpenSocialAppResult> {
  if (typeof window === 'undefined') return 'skipped';
  if (!isLikelyMobileShareDevice()) return 'skipped';
  const target = resolveSocialLaunchUrl(appUrl, webUrl, androidPackage, launch);
  launchWithoutLeavingPage(target);
  return waitForAppHandoff(handoffWaitMs());
}
