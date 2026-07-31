import { parsePlanSections } from '@/lib/plan/parsePlanSections';

export type PlanBudgetValidation = {
  introTotal: number | null;
  itinerarySum: number | null;
  delta: number | null;
  withinTolerance: boolean;
  issues: string[];
  footnote: string | null;
};

const TOLERANCE_YUAN = 10;

function parseYuanAmount(raw: string): number | null {
  const normalized = raw.replace(/,/g, '').trim();
  const match = normalized.match(/¥\s*(\d+)/) ?? normalized.match(/(\d+)\s*元/);
  if (!match?.[1]) {
    return null;
  }
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

/** 从简介 GFM 表提取「总计」行金额 */
export function extractIntroBudgetTotal(intro: string): number | null {
  const lines = intro.split('\n');
  for (const line of lines) {
    if (!/\|/.test(line) || /项目|金额|---/.test(line)) {
      continue;
    }
    if (/总计|合计|总花费/.test(line)) {
      const cells = line.split('|').map((cell) => cell.trim()).filter(Boolean);
      for (const cell of cells.slice().reverse()) {
        const amount = parseYuanAmount(cell);
        if (amount != null) {
          return amount;
        }
      }
    }
  }

  const prose = intro.match(/(?:预算|总计|合计)[^¥\d]{0,12}(?:约\s*)?¥\s*(\d+)/);
  if (prose?.[1]) {
    return Number.parseInt(prose[1], 10);
  }

  return null;
}

/** 汇总流水账里显式写的 ¥ 金额（粗算） */
export function sumItineraryExplicitCosts(itinerary: string): number | null {
  const matches = [...itinerary.matchAll(/¥\s*(\d+)/g)];
  if (matches.length === 0) {
    return null;
  }
  let sum = 0;
  for (const match of matches) {
    const value = Number.parseInt(match[1] ?? '', 10);
    if (Number.isFinite(value)) {
      sum += value;
    }
  }
  return sum;
}

/** 校验简介表总计 vs 流水账分项（第四周工具层） */
export function validatePlanBudget(content: string): PlanBudgetValidation {
  const sections = parsePlanSections(content);
  const introTotal = extractIntroBudgetTotal(sections.intro);
  const itinerarySum = sumItineraryExplicitCosts(sections.itinerary);

  const issues: string[] = [];

  if (introTotal == null) {
    issues.push('简介花费表缺少可识别的「总计」金额');
  }
  if (itinerarySum == null) {
    issues.push('流水账中未找到可汇总的 ¥ 分项（建议每段标明花费）');
  }

  let delta: number | null = null;
  let withinTolerance = true;

  if (introTotal != null && itinerarySum != null) {
    delta = itinerarySum - introTotal;
    withinTolerance = Math.abs(delta) <= TOLERANCE_YUAN;
    if (!withinTolerance) {
      issues.push(
        `简介总计 ¥${introTotal} 与流水账分项合计约 ¥${itinerarySum} 相差 ¥${Math.abs(delta)}（允许 ±${TOLERANCE_YUAN}）`,
      );
    }
  }

  let footnote: string | null = null;
  if (issues.length > 0) {
    footnote = `> 🐌 **预算校验提示**：${issues.join('；')}。可在下方追问「请把花费表与流水账对齐」。`;
  } else if (introTotal != null && itinerarySum != null) {
    footnote = `> 🐌 **预算校验**：简介总计 ¥${introTotal}，流水账分项约 ¥${itinerarySum}，账目基本一致。`;
  }

  return {
    introTotal,
    itinerarySum,
    delta,
    withinTolerance,
    issues,
    footnote,
  };
}

/** 一键对齐预算追问文案（第四周） */
export function buildBudgetAlignFollowUpMessage(validation: PlanBudgetValidation): string {
  if (validation.introTotal != null) {
    return `请把简介花费表总计与流水账分项对齐，目标总计约 ¥${validation.introTotal}，误差不超过 ±10 元，目的地和其他段落尽量保持`;
  }
  return '请把简介花费表与流水账分项对齐，总计误差不超过 ±10 元，其他内容尽量保持';
}
