import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const BOOT_LINES = [
  { delay: 0, text: '宣纸为幕 · 山水为引' },
  { delay: 0.55, text: '转动地球 · 寻一处远方' },
  { delay: 1.15, text: '盲盒随机 · 慢行致远' },
  { delay: 1.75, text: '系统就绪' },
] as const;

/** 首页入场 — 水墨轻启动 */
export default function CapsuleBootSequence() {
  const [visible, setVisible] = useState(true);
  const [shownCount, setShownCount] = useState(0);

  useEffect(() => {
    const timers = BOOT_LINES.map((line, index) =>
      window.setTimeout(() => setShownCount(index + 1), line.delay * 1000),
    );
    const hideTimer = window.setTimeout(() => setVisible(false), 4200);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="capsule-boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          aria-hidden
        >
          <div className="capsule-boot__content">
            <p className="capsule-boot__brand">蜗牛旅行</p>
            {BOOT_LINES.slice(0, shownCount).map((line) => (
              <motion.p
                key={line.text}
                className="capsule-boot__line"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
              >
                <span className="capsule-boot__cursor" aria-hidden>
                  ▸
                </span>
                {line.text}
              </motion.p>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
