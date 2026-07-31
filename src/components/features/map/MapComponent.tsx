import AIPlanningModal from '@/components/features/map/AIPlanningModal';
import TravelMap from '@/components/features/map/TravelMap';
import { useMapPlanningAssistant } from '@/hooks/map/useMapPlanningAssistant';
import { bindAmapMapClick } from '@/lib/map/bindAmapMapClick';
import type { MapClickEvent, MapViewState } from '@/lib/map/types';
import { cn } from '@/utils/cn';

export type MapComponentProps = {
  className?: string;
  initialView?: MapViewState;
  /** 地图点击：返回 GCJ-02 坐标与容器内像素位置 */
  onMapClick?: (event: MapClickEvent) => void;
  /** 启用内置 AI 地图规划（逆地理 + /api/ai/generate-plan + 结果页） */
  aiPlanning?: boolean;
  /** 深色底图场景使用 dark，提升对比度 */
  aiPlanningVariant?: 'light' | 'dark';
};

export { bindAmapMapClick };

/**
 * 可交互地图
 * - aiPlanning：点击空白处 → AMap.Geocoder 逆地理 → AIPlanningModal → fetchAIPlan
 */
export default function MapComponent({
  className,
  initialView,
  onMapClick,
  aiPlanning = false,
  aiPlanningVariant = 'light',
}: MapComponentProps) {
  const planning = useMapPlanningAssistant();

  const handleMapClick = (event: MapClickEvent) => {
    onMapClick?.(event);
    if (aiPlanning) {
      void planning.handleMapClick(event);
    }
  };

  if (!aiPlanning) {
    return (
      <TravelMap
        className={cn(onMapClick && 'cursor-crosshair', className)}
        initialView={initialView}
        onMapClick={onMapClick}
      />
    );
  }

  return (
    <div className={cn('relative h-full min-h-[12rem]', className)} data-map-planning-root>
      <TravelMap
        className="h-full w-full cursor-crosshair"
        initialView={initialView}
        onMapClick={handleMapClick}
      />
      <AIPlanningModal
        open={planning.modalOpen}
        anchor={planning.anchor}
        locationLabel={planning.locationLabel}
        query={planning.query}
        loading={planning.loading}
        error={planning.error}
        variant={aiPlanningVariant}
        onQueryChange={planning.setQuery}
        onGenerate={() => void planning.generatePlan()}
        onCancel={planning.closeModal}
      />
    </div>
  );
}
