const LOW_ACCURACY: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 8_000,
  maximumAge: 300_000,
};

const HIGH_ACCURACY: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 12_000,
  maximumAge: 0,
};

function getCurrentPositionOnce(options: PositionOptions, raceMs: number): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('unsupported'));
      return;
    }

    const timer = window.setTimeout(() => {
      reject(new Error('timeout'));
    }, raceMs);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.clearTimeout(timer);
        resolve(position);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
      options,
    );
  });
}

/** 静默定位：仅在已授权时使用，不弹窗、短超时 */
export async function requestSilentBrowserGeolocation(): Promise<GeolocationPosition | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return null;
  }

  try {
    return await getCurrentPositionOnce(
      {
        enableHighAccuracy: false,
        timeout: 5_000,
        maximumAge: 600_000,
      },
      5_500,
    );
  } catch {
    return null;
  }
}

/** 先快后准：降低超时概率；仍须用户手势触发才可能弹授权窗 */
export async function requestBrowserGeolocation(): Promise<GeolocationPosition> {
  try {
    return await getCurrentPositionOnce(LOW_ACCURACY, 9_000);
  } catch (firstError) {
    if (
      firstError instanceof GeolocationPositionError &&
      firstError.code === firstError.PERMISSION_DENIED
    ) {
      throw firstError;
    }
    return getCurrentPositionOnce(HIGH_ACCURACY, 14_000);
  }
}
