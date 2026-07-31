import { useEffect, useState } from 'react';

/** 当前标签页是否在前台（用于暂停动画/粒子/定时器） */
export function useDocumentVisible(): boolean {
  const [visible, setVisible] = useState(() =>
    typeof document === 'undefined' ? true : document.visibilityState === 'visible',
  );

  useEffect(() => {
    const sync = () => {
      setVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  return visible;
}
