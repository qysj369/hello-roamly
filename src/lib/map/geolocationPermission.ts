export type GeolocationPermissionState = PermissionState | 'unknown';

export type GeoFailureKind =
  | 'denied'
  | 'timeout'
  | 'no_popup'
  | 'system_off'
  | 'insecure'
  | 'unsupported'
  | 'unavailable';

/** 查询定位权限（不触发弹窗） */
export async function queryGeolocationPermission(): Promise<GeolocationPermissionState> {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return 'unknown';
  }
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch {
    return 'unknown';
  }
}

export function isSecureContextForGeolocation(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext;
}

/** 内嵌预览 / iframe 中通常无法弹定位授权 */
export function isEmbeddedBrowsingContext(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    if (window.self !== window.top) {
      return true;
    }
  } catch {
    return true;
  }
  return false;
}

export function mapRawGeolocationError(err: unknown): GeoFailureKind {
  if (err instanceof GeolocationPositionError) {
    if (err.code === err.PERMISSION_DENIED) {
      return 'denied';
    }
    if (err.code === err.TIMEOUT) {
      return 'timeout';
    }
    return 'unavailable';
  }
  if (err instanceof Error) {
    if (err.message === 'timeout') {
      return 'timeout';
    }
    if (err.message === 'unsupported') {
      return 'unsupported';
    }
  }
  return 'unavailable';
}

/** 超时且无弹窗时，区分：已拒绝 / 系统关定位 / 需手动开权限 */
export async function classifyGeolocationFailure(err: unknown): Promise<GeoFailureKind> {
  const raw = mapRawGeolocationError(err);

  if (!isSecureContextForGeolocation()) {
    return 'insecure';
  }

  if (isEmbeddedBrowsingContext() && raw === 'timeout') {
    return 'no_popup';
  }

  if (raw === 'denied') {
    return 'denied';
  }

  if (raw !== 'timeout') {
    return raw;
  }

  const permission = await queryGeolocationPermission();
  if (permission === 'denied') {
    return 'denied';
  }
  if (permission === 'prompt') {
    return 'no_popup';
  }

  return 'system_off';
}
