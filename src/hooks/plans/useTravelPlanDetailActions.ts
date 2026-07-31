import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { copyTravelPlanItinerary } from '@/utils/copyTravelPlanItinerary';
import { exportTravelPlanPdf } from '@/utils/exportTravelPlanPdf';
import {
  buildTravelPlanCompanionState,
  getTravelPlanCompanionPath,
} from '@/utils/travelPlanCompanionNavigation';

export type PlanActionFeedback = 'idle' | 'success' | 'error';

const COPY_LABEL: Record<PlanActionFeedback, string> = {
  idle: '复制此行程',
  success: '已复制',
  error: '复制失败',
};

const PDF_LABEL: Record<PlanActionFeedback, string> = {
  idle: '导出 PDF',
  success: '已打开打印',
  error: '导出失败',
};

const COPY_SHORT: Record<PlanActionFeedback, string> = {
  idle: '复制',
  success: '已复制',
  error: '失败',
};

const PDF_SHORT: Record<PlanActionFeedback, string> = {
  idle: 'PDF',
  success: '已打开',
  error: '失败',
};

function useFeedbackReset(feedback: PlanActionFeedback, onReset: () => void): void {
  useEffect(() => {
    if (feedback === 'idle') {
      return undefined;
    }
    const timer = window.setTimeout(onReset, 2500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [feedback, onReset]);
}

export function useTravelPlanDetailActions(plan: TravelPlan) {
  const navigate = useNavigate();
  const [copyFeedback, setCopyFeedback] = useState<PlanActionFeedback>('idle');
  const [pdfFeedback, setPdfFeedback] = useState<PlanActionFeedback>('idle');

  const resetCopyFeedback = useCallback(() => setCopyFeedback('idle'), []);
  const resetPdfFeedback = useCallback(() => setPdfFeedback('idle'), []);

  useFeedbackReset(copyFeedback, resetCopyFeedback);
  useFeedbackReset(pdfFeedback, resetPdfFeedback);

  const handleCopy = useCallback(async () => {
    const result = await copyTravelPlanItinerary(plan);
    setCopyFeedback(result === 'copied' ? 'success' : 'error');
  }, [plan]);

  const handleCopyClick = useCallback(() => {
    handleCopy().catch(() => {
      setCopyFeedback('error');
    });
  }, [handleCopy]);

  const handlePdf = useCallback(() => {
    const result = exportTravelPlanPdf(plan);
    if (result === 'opened') {
      setPdfFeedback('success');
      return;
    }
    setPdfFeedback('error');
  }, [plan]);

  const handleCompanion = useCallback(() => {
    navigate(getTravelPlanCompanionPath(), {
      state: buildTravelPlanCompanionState(plan),
    });
  }, [navigate, plan]);

  return {
    copyFeedback,
    pdfFeedback,
    copyLabel: COPY_LABEL[copyFeedback],
    pdfLabel: PDF_LABEL[pdfFeedback],
    copyShortLabel: COPY_SHORT[copyFeedback],
    pdfShortLabel: PDF_SHORT[pdfFeedback],
    handleCopyClick,
    handlePdf,
    handleCompanion,
  };
}
