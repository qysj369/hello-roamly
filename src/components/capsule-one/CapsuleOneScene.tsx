import type { CapsuleCityPoint } from '@/data/capsuleHotRoutes';
import CapsuleOneCanvas from '@/components/capsule-one/CapsuleOneCanvas';

type CapsuleOneSceneProps = {
  onCitySelect: (city: CapsuleCityPoint) => void;
  backdrop?: string;
  autoRotate?: boolean;
  lowMemory?: boolean;
};

/** 主场景 — Three.js 全息琉璃地球（参考图） */
export default function CapsuleOneScene({
  onCitySelect,
  backdrop,
  autoRotate,
  lowMemory,
}: CapsuleOneSceneProps) {
  return (
    <div className="capsule-scene" aria-hidden>
      <CapsuleOneCanvas
        onCitySelect={onCitySelect}
        backdrop={backdrop}
        autoRotate={autoRotate}
        lowMemory={lowMemory}
      />
    </div>
  );
}
