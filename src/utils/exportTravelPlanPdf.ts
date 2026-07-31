import type { TravelPlan } from '@/types/domain/travelPlan';
import { buildTravelPlanPrintHtml } from '@/utils/travelPlanPrintDocument';

export type ExportTravelPlanPdfResult = 'opened' | 'blocked' | 'failed';

export function exportTravelPlanPdf(plan: TravelPlan): ExportTravelPlanPdfResult {
  if (typeof window === 'undefined') {
    return 'failed';
  }

  const printWindow = window.open('', '_blank', 'noopener,noreferrer');
  if (!printWindow) {
    return 'blocked';
  }

  try {
    printWindow.document.open();
    printWindow.document.write(buildTravelPlanPrintHtml(plan));
    printWindow.document.close();

    const triggerPrint = () => {
      printWindow.focus();
      printWindow.print();
    };

    if (printWindow.document.readyState === 'complete') {
      triggerPrint();
    } else {
      printWindow.addEventListener('load', triggerPrint, { once: true });
    }

    return 'opened';
  } catch {
    printWindow.close();
    return 'failed';
  }
}
