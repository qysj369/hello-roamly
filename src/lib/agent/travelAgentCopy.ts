import { getCityTravelKnowledge } from '@/lib/agent/cityTravelKnowledge';
import { readTravelPreferenceMemory, type TravelPreferenceMemory } from '@/lib/agent/travelPreferenceMemory';
import type { TravelAgentToolName } from '@/lib/agent/travelAgentTools';
import { searchPlanHeaderLine } from '@/lib/home/searchPlanShareCopy';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

/** 闲聊拦截：算力只留给出行事务 */
export const AGENT_TOPIC_REFUSAL =
  '我只帮你把这一趟办完：规划、改行程、把能发出去的素材备好。股市、作业、闲聊这边接不了。想去哪座城、和谁走，直接说。';

export type AgentNextAction =
  | { id: string; label: string; kind: 'send'; text: string }
  | { id: string; label: string; kind: 'tool'; tool: TravelAgentToolName };

function isFamily(plan: SearchStructuredPlan): boolean {
  return /亲子|带娃|儿童/.test(plan.baseInfo.peopleType);
}

export function describeRememberedPreference(memory: TravelPreferenceMemory = readTravelPreferenceMemory()): string {
  const bits = [
    memory.peopleType ? `常和${memory.peopleType}走` : '',
    memory.lastCity ? `最近看过${memory.lastCity}` : '',
    memory.lastDays ? `${memory.lastDays}天左右` : '',
  ].filter(Boolean);
  if (bits.length === 0) return '';
  return `还记得你${bits.join('，')}。这次不用重填。`;
}

export function buildAgentWelcome(
  memory: TravelPreferenceMemory = readTravelPreferenceMemory(),
  plan: SearchStructuredPlan | null = null,
): string {
  if (plan) {
    return `这份${searchPlanHeaderLine(plan)}还在。要改人群、避雨或发给朋友，直接说，我替你做完。`;
  }
  const remembered = describeRememberedPreference(memory);
  if (remembered) {
    return `${remembered}说一座城，我按你的习惯排；要换人群或发到微信，做完再递给你。`;
  }
  return '说一句出行就行，例如「杭州3天亲子」。我来规划、改、把分享备好，不用填一堆空。';
}

export function buildFreshPlanMessage(plan: SearchStructuredPlan): string {
  const family = isFamily(plan);
  const rain = getCityTravelKnowledge(plan.baseInfo.targetCity)?.rainAlts.length
    ? '下雨可以说「下雨怎么走」，我换成室内。'
    : '';
  const party = family ? '节奏已经按带娃排了。' : '带孩子可以说「改成亲子」，我只改侧重点。';
  return `行程已备好：${searchPlanHeaderLine(plan)}。${party}${rain}要发给微信群，说「发给朋友」。`;
}

export function buildAgentNextActions(plan: SearchStructuredPlan | null): AgentNextAction[] {
  if (!plan) {
    const memory = readTravelPreferenceMemory();
    const actions: AgentNextAction[] = [];
    if (memory.lastCity && memory.lastDays && memory.peopleType) {
      actions.push({
        id: 'resume',
        label: `还去${memory.lastCity}${memory.lastDays}天`,
        kind: 'send',
        text: `${memory.lastCity}${memory.lastDays}天${memory.peopleType}`,
      });
    }
    actions.push({
      id: 'sample',
      label: '杭州3天亲子',
      kind: 'send',
      text: '杭州3天亲子',
    });
    return actions.slice(0, 3);
  }

  const knowledge = getCityTravelKnowledge(plan.baseInfo.targetCity);
  const actions: AgentNextAction[] = [];
  if (!isFamily(plan)) {
    actions.push({ id: 'family', label: '改成亲子', kind: 'send', text: '改成亲子' });
  }
  if (knowledge?.rainAlts.length) {
    actions.push({ id: 'rain', label: '下雨怎么走', kind: 'send', text: '下雨怎么走' });
  }
  if (knowledge?.holidayAlts.length) {
    actions.push({ id: 'holiday', label: '人多怎么走', kind: 'send', text: '人多怎么走' });
  }
  actions.push({ id: 'share', label: '发给朋友', kind: 'tool', tool: 'share' });
  actions.push({ id: 'budget', label: '预算降低', kind: 'send', text: '预算降低' });
  return actions.slice(0, 4);
}
