import { APP_NAME } from '@/lib/config/brand';
import type { TravelPlan } from '@/types/domain/travelPlan';
import { formatTravelPlanItineraryText } from '@/utils/formatTravelPlanItineraryText';
import {
  getPlanDestination,
  getPlanDaysLabel,
  getPlanSuitableAudience,
  getPlanTotalCostLabel,
} from '@/utils/travelPlanView';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildDaySections(plan: TravelPlan): string {
  return plan.dailyPlans
    .map((day) => {
      const activities = day.activities
        .map((activity) => {
          const meta = [
            activity.location ? escapeHtml(activity.location) : '',
            activity.cost != null && activity.cost > 0 ? `¥${activity.cost}` : '',
          ]
            .filter(Boolean)
            .join(' · ');

          return `<li>
            <time>${escapeHtml(activity.time)}</time>
            <span>${escapeHtml(activity.description)}</span>
            ${meta ? `<small>${meta}</small>` : ''}
          </li>`;
        })
        .join('');

      return `<section class="day">
        <h3>第 ${day.day} 天 · ${escapeHtml(day.title)}</h3>
        <ul>${activities}</ul>
      </section>`;
    })
    .join('');
}

/** 供打印 / 另存为 PDF 的独立 HTML 文档 */
export function buildTravelPlanPrintHtml(plan: TravelPlan): string {
  const plainFallback = escapeHtml(formatTravelPlanItineraryText(plan));

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(plan.title)} — ${APP_NAME}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
      color: #0f172a;
      line-height: 1.55;
      margin: 0;
      padding: 24px 28px 32px;
      font-size: 13px;
    }
    h1 { font-size: 22px; margin: 0 0 8px; }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 20px;
      color: #475569;
      font-size: 12px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .summary { color: #334155; margin: 0 0 20px; }
    .day { margin-bottom: 18px; page-break-inside: avoid; }
    .day h3 { font-size: 14px; margin: 0 0 8px; color: #1e40af; }
    ul { list-style: none; margin: 0; padding: 0; }
    li {
      display: grid;
      grid-template-columns: 52px 1fr;
      gap: 4px 10px;
      padding: 6px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    time { font-weight: 600; color: #64748b; font-variant-numeric: tabular-nums; }
    small { grid-column: 2; color: #94a3b8; font-size: 11px; }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
    }
    pre.fallback { display: none; white-space: pre-wrap; font-size: 11px; }
    @media print {
      body { padding: 12mm 14mm; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(plan.title)}</h1>
  <div class="meta">
    <span>目的地：${escapeHtml(getPlanDestination(plan))}</span>
    <span>总预算：${escapeHtml(getPlanTotalCostLabel(plan))}</span>
    <span>总天数：${escapeHtml(getPlanDaysLabel(plan))}</span>
    <span>适合：${escapeHtml(getPlanSuitableAudience(plan))}</span>
  </div>
  <p class="summary">${escapeHtml(plan.summary)}</p>
  ${buildDaySections(plan)}
  <p class="footer">${APP_NAME} · 在打印对话框中选择「另存为 PDF」即可保存</p>
  <pre class="fallback">${plainFallback}</pre>
</body>
</html>`;
}
