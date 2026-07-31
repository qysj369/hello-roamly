import { DeepSeekApiError } from '@/services/ai/deepseek/errors';
import type {
  AiSnailCostBreakdown,
  AiSnailCostItem,
  AiSnailDailyExpense,
  AiSnailDailyJournal,
  AiSnailGuideResult,
  AiSnailInsights,
} from '@/types/domain/aiSnailGuide';

function extractJsonString(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

function parseTipList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());
}

function parseCostItem(value: unknown): AiSnailCostItem {
  if (!value || typeof value !== 'object') {
    return { amount: 0, savingTips: [] };
  }
  const record = value as Record<string, unknown>;
  const amount = typeof record.amount === 'number' && Number.isFinite(record.amount) ? record.amount : 0;
  return {
    amount,
    savingTips: parseTipList(record.savingTips ?? record.tips),
  };
}

function parseCostBreakdown(value: unknown): AiSnailCostBreakdown {
  if (!value || typeof value !== 'object') {
    throw new DeepSeekApiError('花费清单格式无效', { code: 'parse_error' });
  }
  const record = value as Record<string, unknown>;
  const transportation = parseCostItem(record.transportation ?? record.transport);
  const accommodation = parseCostItem(record.accommodation ?? record.stay);
  const food = parseCostItem(record.food ?? record.dining);
  const entertainment = parseCostItem(record.entertainment ?? record.tickets);
  const computedTotal =
    transportation.amount + accommodation.amount + food.amount + entertainment.amount;
  const total =
    typeof record.total === 'number' && Number.isFinite(record.total)
      ? record.total
      : computedTotal;

  return {
    transportation,
    accommodation,
    food,
    entertainment,
    total,
  };
}

function parseDailyExpense(value: unknown): AiSnailDailyExpense | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const item =
    typeof record.item === 'string'
      ? record.item.trim()
      : typeof record.name === 'string'
        ? record.name.trim()
        : '';
  const amount = typeof record.amount === 'number' && Number.isFinite(record.amount) ? record.amount : 0;
  if (!item) {
    return null;
  }
  return { item, amount };
}

function parseDailyJournal(value: unknown): AiSnailDailyJournal[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const entries: AiSnailDailyJournal[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const record = item as Record<string, unknown>;
    const day = typeof record.day === 'number' ? record.day : entries.length + 1;
    const narrative =
      typeof record.narrative === 'string'
        ? record.narrative.trim()
        : typeof record.content === 'string'
          ? record.content.trim()
          : '';
    if (!narrative) {
      continue;
    }
    const expenses = Array.isArray(record.expenses)
      ? record.expenses
          .map(parseDailyExpense)
          .filter((expense): expense is AiSnailDailyExpense => expense != null)
      : [];
    entries.push({
      day,
      narrative,
      expenses,
      tips: parseTipList(record.tips),
    });
  }
  return entries.sort((a, b) => a.day - b.day);
}

function parseSnailInsights(value: unknown): AiSnailInsights {
  if (!value || typeof value !== 'object') {
    return { regrets: '', recommendations: '' };
  }
  const record = value as Record<string, unknown>;
  return {
    regrets:
      typeof record.regrets === 'string'
        ? record.regrets.trim()
        : typeof record.pitfalls === 'string'
          ? record.pitfalls.trim()
          : '',
    recommendations:
      typeof record.recommendations === 'string'
        ? record.recommendations.trim()
        : typeof record.treasures === 'string'
          ? record.treasures.trim()
          : '',
  };
}

export type ParseAiSnailGuideMeta = {
  destination: string;
  days: number;
  budgetLabel: string;
  interests: string[];
  id?: string;
};

export function parseAiSnailGuideFromAiResponse(
  raw: string,
  meta: ParseAiSnailGuideMeta,
): AiSnailGuideResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonString(raw));
  } catch {
    throw new DeepSeekApiError('AI 返回的攻略不是有效 JSON', { code: 'parse_error' });
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new DeepSeekApiError('攻略 JSON 结构无效', { code: 'parse_error' });
  }

  const record = parsed as Record<string, unknown>;
  const title =
    typeof record.title === 'string' && record.title.trim()
      ? record.title.trim()
      : `${meta.destination} ${meta.days} 天穷游攻略`;

  const costBreakdown = parseCostBreakdown(record.costBreakdown ?? record.costs);
  const dailyJournal = parseDailyJournal(record.dailyJournal ?? record.dailyPlans);
  const snailInsights = parseSnailInsights(record.snailInsights ?? record.insights);

  if (dailyJournal.length === 0) {
    throw new DeepSeekApiError('行程流水账为空，请重试', { code: 'parse_error' });
  }

  return {
    id: meta.id ?? `snail-guide-${Date.now()}`,
    title,
    destination: meta.destination,
    days: meta.days,
    budgetLabel: meta.budgetLabel,
    interests: meta.interests,
    costBreakdown,
    dailyJournal,
    snailInsights,
    generatedAt: new Date().toISOString(),
  };
}
