import type { CapsuleCityPoint } from '@/data/capsuleHotRoutes';
import CapsuleOneCanvas from '@/components/capsule-one/CapsuleOneCanvas';

type CapsuleOneSceneProps = {
  onCitySelect: (city: CapsuleCityPoint) => void;
};

/** 主场景 — Three.js 全息琉璃地球（参考图） */
export default function CapsuleOneScene({ onCitySelect }: CapsuleOneSceneProps) {
  return (
    <div className="capsule-scene" aria-hidden>
      <CapsuleOneCanvas onCitySelect={onCitySelect} />
    </div>
  );
}
