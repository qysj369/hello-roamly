import { useEffect } from 'react';
import HoloEarthCanvas from '@/components/home/holo/HoloEarthCanvas';
import type { HoloCitySpotKit } from '@/data/holoHotCityKit';
import { resolveHoloCityPoint } from '@/data/holoCityPreviewContent';
import { useCapsuleOneStore } from '@/stores/capsuleOne/store';

type HoloMiniEarthPreviewProps = {
  city: string;
  /** 本地景点坐标标记（展示层；不改地球业务管线） */
  spotMarks?: readonly HoloCitySpotKit[];
  /** 当前高亮点位；变化时锁定旋转至该坐标 */
  activeSpot?: HoloCitySpotKit | null;
};

/**
 * 热门城市弹窗内嵌迷你地球：
 * 打开后定位到城市坐标并高亮；无机械自转；支持拖拽查看。
 */
export default function HoloMiniEarthPreview({
  city,
  spotMarks,
  activeSpot,
}: HoloMiniEarthPreviewProps) {
  const lockCity = useCapsuleOneStore((s) => s.lockCity);
  const clearCity = useCapsuleOneStore((s) => s.clearCity);
  const focusEarthOn = useCapsuleOneStore((s) => s.focusEarthOn);
  const clearEarthFocus = useCapsuleOneStore((s) => s.clearEarthFocus);

  useEffect(() => {
    const point = resolveHoloCityPoint(city);
    lockCity(point);
    const target = activeSpot ?? spotMarks?.[0] ?? null;
    if (target) {
      focusEarthOn(target.lat, target.lng);
    } else {
      focusEarthOn(point.lat, point.lng);
    }
    return () => {
      clearCity();
      clearEarthFocus();
    };
  }, [
    city,
    activeSpot,
    clearCity,
    clearEarthFocus,
    focusEarthOn,
    lockCity,
    spotMarks,
  ]);

  return (
    <div className="holo-home__mini-earth">
      <HoloEarthCanvas displayOnly={false} interactivePreview />
    </div>
  );
}
