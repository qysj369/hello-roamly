import type { AiChatContext } from '@/types/domain/aiChat';
import type { AiTravelParams } from '@/types/domain/aiTravelParams';
import { TRAVEL_INTEREST_OPTIONS, TRAVEL_PACE_OPTIONS } from '@/types/domain/aiTravelParams';
import { HOME_MAP_TRAIL_SEARCH_EXAMPLES } from '@/lib/config/homeMapTrail';
import { extractPrimaryLocation } from '@/lib/map/parseTrailSearchQuery';

export type AiChatQuickPrompt = {
  id: string;
  label: string;
  text: string;
};

const BASE_QUICK_PROMPTS: AiChatQuickPrompt[] = [
  {
    id: 'budget-split',
    label: '预算怎么拆',
    text: '请按交通、住宿、餐饮、门票帮我拆分预算，并给省钱建议',
  },
  {
    id: 'transport',
    label: '交通怎么省',
    text: '市内交通怎么安排最省钱？地铁、公交和步行怎么组合？',
  },
  {
    id: 'food-route',
    label: '美食路线',
    text: '推荐一条不踩雷的美食路线，适合穷游',
  },
  {
    id: 'pitfalls',
    label: '避坑提醒',
    text: '这个目的地有哪些常见的消费陷阱或避坑点？',
  },
];

function buildMapTrailStarterPrompts(): AiChatQuickPrompt[] {
  return HOME_MAP_TRAIL_SEARCH_EXAMPLES.map((text, index) => ({
    id: `map-trail-${index}`,
    label: extractPrimaryLocation(text) ?? text.split(/\s+/)[0] ?? text.slice(0, 4),
    text: `帮我规划${text}的穷游行程，含交通、住宿和花费清单`,
  }));
}

export function buildAiChatQuickPrompts(
  params: AiTravelParams,
  context?: AiChatContext,
): AiChatQuickPrompt[] {
  const destination = context?.destination?.trim();
  const interestLabels = params.interests
    .map((id) => TRAVEL_INTEREST_OPTIONS.find((o) => o.id === id)?.label)
    .filter(Boolean)
    .join('、');
  const paceLabel = TRAVEL_PACE_OPTIONS.find((o) => o.id === params.pace)?.label ?? '适中';

  const contextual: AiChatQuickPrompt[] = [];

  if (destination) {
    contextual.push({
      id: 'plan-destination',
      label: `${destination} ${params.days}天`,
      text: `帮我规划${destination}${params.days}天的穷游行程，预算${params.budgetMin}–${params.budgetMax}元，节奏${paceLabel}${interestLabels ? `，偏好${interestLabels}` : ''}`,
    });
  } else {
    contextual.push(...buildMapTrailStarterPrompts());
    contextual.push({
      id: 'plan-generic',
      label: `${params.days}天穷游`,
      text: `帮我规划${params.days}天穷游行程，预算${params.budgetMin}–${params.budgetMax}元，节奏${paceLabel}`,
    });
  }

  if (params.interests.includes('food')) {
    contextual.push({
      id: 'food-local',
      label: '本地必吃',
      text: destination
        ? `${destination}有哪些本地人常去、性价比高的美食？`
        : '推荐几个适合穷游的网红美食城市',
    });
  }

  if (context?.dream?.trim()) {
    contextual.push({
      id: 'dream',
      label: '围绕梦想',
      text: `基于我的想法「${context.dream.trim()}」，给一版可执行的行程建议`,
    });
  }

  const merged = [...contextual, ...BASE_QUICK_PROMPTS];
  const seen = new Set<string>();
  return merged.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}
