import PlanResultView from '@/components/features/map/PlanResultView';
import { usePlanResultActions } from '@/hooks/map/usePlanResultActions';
import { useGlobalMapPlanningStore } from '@/stores/globalMapPlanning/store';

/** 全局方案结果浮层（由 AppShell 挂载，任意页面可恢复历史） */
export default function GlobalPlanResultHost() {
  const {
    resultOpen,
    planStreaming,
    resultLocation,
    resultContent,
    initialQuery,
    saveLoading,
    saveError,
    saveSuccess,
    followUpLoading,
    followUpError,
  } = useGlobalMapPlanningStore();
  const { savePlan, sendFollowUp, closeResult } = usePlanResultActions();

  return (
    <PlanResultView
      open={resultOpen}
      planStreaming={planStreaming}
      locationName={resultLocation}
      content={resultContent}
      initialQuery={initialQuery}
      saveLoading={saveLoading}
      saveError={saveError}
      saveSuccess={saveSuccess}
      followUpLoading={followUpLoading}
      followUpError={followUpError}
      onFollowUp={(message) => {
        void sendFollowUp(message);
      }}
      onSavePlan={savePlan}
      onClose={closeResult}
    />
  );
}

