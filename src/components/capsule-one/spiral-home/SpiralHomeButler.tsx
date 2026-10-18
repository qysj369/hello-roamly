import { lazy, Suspense, useEffect, useState } from 'react';
import { useTravelAgentStore } from '@/stores/travelAgent/store';

export const SPIRAL_BUTLER_TITLE = '蜗牛管家已就位';
export const SPIRAL_BUTLER_LEAD = '告诉我你想听什么，我陪你一路漫游';
export const SPIRAL_BUTLER_GUIDE =
  '可以直接说「青岛3天情侣」或「杭州周末闲逛」，我帮你排一版松弛慢游；行程出来后点确认，即可生成图文卡片。';

const DEMO_MESSAGES = [
  { id: 'spiral-u1', role: 'user' as const, text: '济南历下' },
  { id: 'spiral-u2', role: 'user' as const, text: '潍坊' },
];

const SpiralHomeButlerPanel = lazy(() => import('./SpiralHomeButlerPanel'));

type SpiralHomeButlerProps = {
  onLaunch: () => void;
};

function SpiralButlerFab({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="travel-agent-host travel-agent-host--spiral">
      <button type="button" className="travel-agent-fab" aria-label="打开蜗牛管家" onClick={onOpen}>
        蜗
      </button>
    </div>
  );
}

export default function SpiralHomeButler({ onLaunch }: SpiralHomeButlerProps) {
  const open = useTravelAgentStore((state) => state.open);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const store = useTravelAgentStore.getState();
    store.closeChat();
    const hasUser = store.messages.some((item) => item.role === 'user');
    if (!hasUser) {
      useTravelAgentStore.setState({
        messages: [
          {
            id: 'spiral-welcome',
            role: 'assistant',
            text: `${SPIRAL_BUTLER_LEAD}。${SPIRAL_BUTLER_GUIDE}`,
          },
          ...DEMO_MESSAGES,
        ],
      });
    }
    return () => {
      useTravelAgentStore.getState().closeChat();
    };
  }, []);

  useEffect(() => {
    if (open) setArmed(true);
  }, [open]);

  const openNow = () => {
    setArmed(true);
    useTravelAgentStore.getState().openChat();
  };

  if (!armed) {
    return <SpiralButlerFab onOpen={openNow} />;
  }

  return (
    <Suspense fallback={<SpiralButlerFab onOpen={openNow} />}>
      <SpiralHomeButlerPanel onLaunch={onLaunch} />
    </Suspense>
  );
}
