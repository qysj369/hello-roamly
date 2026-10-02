import { formatSearchPlanCopyText } from '@/lib/home/formatSearchPlanCopyText';
import { parseSearchPlanCopyText } from '@/lib/home/parseSearchPlanCopyText';
import { validateSearchStructuredPlan } from '@/lib/home/searchStructuredPlanParse';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';
import type { UserPlanRecord } from '@/types/api/userPlans';

const START = '<!--HOLO_SEARCH_PLAN:';
const END = ':HOLO_SEARCH_PLAN-->';

export function encodeSearchPlanSessionContent(plan: SearchStructuredPlan): string {
  return `${START}${JSON.stringify(plan)}${END}\n${formatSearchPlanCopyText(plan)}`;
}

export function parseSearchPlanFromSessionContent(content: string): SearchStructuredPlan | null {
  const start = content.indexOf(START);
  const end = content.indexOf(END);
  if (start >= 0 && end > start) {
    try {
      const parsed = JSON.parse(content.slice(start + START.length, end)) as SearchStructuredPlan;
      if (validateSearchStructuredPlan(parsed, parsed.baseInfo.days)) {
        return parsed;
      }
    } catch {
      // fall through to copy-text
    }
  }
  return parseSearchPlanCopyText(stripSearchPlanSessionMarkup(content));
}

export function stripSearchPlanSessionMarkup(content: string): string {
  const start = content.indexOf(START);
  const end = content.indexOf(END);
  if (start < 0 || end < start) {
    return content.trim();
  }
  return `${content.slice(0, start)}${content.slice(end + END.length)}`.trim();
}

export function searchPlanFromUserPlan(record: UserPlanRecord): SearchStructuredPlan | null {
  const assistants = record.content.fullHistory.filter((item) => item.role === 'assistant');
  for (let index = assistants.length - 1; index >= 0; index -= 1) {
    const parsed = parseSearchPlanFromSessionContent(assistants[index]?.content ?? '');
    if (parsed) {
      return parsed;
    }
  }
  return null;
}

export function searchPlanGuideText(record: UserPlanRecord): string {
  const assistants = record.content.fullHistory.filter((item) => item.role === 'assistant');
  for (let index = assistants.length - 1; index >= 0; index -= 1) {
    const text = stripSearchPlanSessionMarkup(assistants[index]?.content ?? '');
    if (text) {
      return text;
    }
  }
  return '';
}
