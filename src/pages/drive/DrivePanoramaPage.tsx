import { lazy, Suspense, useEffect, useState } from 'react';
import { useI18n } from '@/i18n/useI18n';
import { isMobileDriveClient } from '@/lib/drive/isMobileDriveClient';
import MobileDrivePreview from '@/pages/drive/MobileDrivePreview';
import '@/styles/holo-theme.css';
import '@/styles/holo-drive.css';

const DesktopDriveCabin = lazy(() => import('@/pages/drive/DesktopDriveCabin'));

/**
 * 驾驶舱入口：
 * - PC：懒加载完整驾驶舱（百度/Mapillary/视频）
 * - 移动：轻量街景预览，避免重型 WebGL 引擎直挂导致「页面暂时无法显示」
 */
export default function DrivePanoramaPage() {
  const { messages: t } = useI18n();
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? isMobileDriveClient() : false,
  );

  useEffect(() => {
    const sync = () => setMobile(isMobileDriveClient());
    sync();
    const mq = window.matchMedia('(max-width: 1023px)');
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  if (mobile) {
    return <MobileDrivePreview />;
  }

  return (
    <Suspense
      fallback={
        <div className="holo-drive holo-drive--loading">
          <main className="holo-drive__main">
            <div className="holo-drive__panel" aria-live="polite">
              <h2>{t.drive.loadingTitle}</h2>
              <p>{t.drive.loadingDesc}</p>
            </div>
          </main>
        </div>
      }
    >
      <DesktopDriveCabin />
    </Suspense>
  );
}

export { DRIVE_CITY_STORAGE_KEY } from '@/lib/drive/driveCityStorage';
