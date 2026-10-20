import { Headphones } from 'lucide-react';
import TravelAgentHost from '@/components/agent/TravelAgentHost';
import { SPIRAL_HOME_CTA } from '@/components/capsule-one/spiral-home/SpiralHomeChrome';

type SpiralHomeButlerPanelProps = {
  onLaunch: () => void;
};

export default function SpiralHomeButlerPanel({ onLaunch }: SpiralHomeButlerPanelProps) {
  return (
    <TravelAgentHost
      layout="fab"
      variant="spiral"
      extraHeader={
        <div className="spiral-home__audio" aria-hidden>
          <span className="spiral-home__audio-bar" />
          <Headphones size={14} strokeWidth={2.2} />
        </div>
      }
      extraFooter={
        <div className="spiral-home__dock-actions">
          <button type="button" className="spiral-home__place" onClick={onLaunch}>
            选择地点
          </button>
          <button
            type="button"
            className="spiral-home__cta spiral-home__cta--panel"
            onClick={onLaunch}
          >
            {SPIRAL_HOME_CTA.replace(' >', '')}
          </button>
        </div>
      }
    />
  );
}
