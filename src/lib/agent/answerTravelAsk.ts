import { getCityTravelKnowledge } from '@/lib/agent/cityTravelKnowledge';
import { searchPlanHeaderLine, searchPlanLocalBudgetLabel } from '@/lib/home/searchPlanShareCopy';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

function tipByPrefix(plan: SearchStructuredPlan, prefix: string): string {
  return plan.globalTips.find((tip) => tip.startsWith(prefix)) ?? '';
}

/** 站内兜底答疑：先用当前行程 + 城市知识库，不跳搜索引擎 */
export function answerTravelAsk(question: string, plan: SearchStructuredPlan | null): string {
  const text = question.trim();
  const knowledge = plan ? getCityTravelKnowledge(plan.baseInfo.targetCity) : getCityTravelKnowledge(text);
  const city = plan?.baseInfo.targetCity || knowledge?.city || '';

  if (/适合亲子|带娃|小孩行不行/.test(text) && plan) {
    const familyLike = /亲子|带娃|儿童/.test(plan.baseInfo.peopleType);
    if (familyLike) {
      return `这条已经按亲子排了：${plan.dayList.map((day) => day.title).join('；')}。亮点是少走路、馆内有休息座。若还想再松一点，可以说「少走路」让我只改景点节奏。`;
    }
    return `当前是${plan.baseInfo.peopleType}路线，步行和探店偏多，带娃会累一点。可以直接说「改成亲子」，我只换人群侧重点，不必重填。`;
  }

  if (/雨天|下雨/.test(text)) {
    const fromPlan = plan ? tipByPrefix(plan, '雨天替代：') : '';
    const fromKb = knowledge?.rainAlts.join('、') ?? '';
    return fromPlan || fromKb
      ? `${fromPlan || `雨天替代：${fromKb}`}。室内馆记得先看官方当日预约。`
      : '下雨优先改室内馆或骑楼街巷，避免江边长走。说一下城市，我按路线给替代点。';
  }

  if (/节假日|人多|拥挤/.test(text)) {
    const fromPlan = plan ? tipByPrefix(plan, '节假日分流：') : '';
    const fromKb = knowledge?.holidayAlts.join('、') ?? '';
    return fromPlan || fromKb
      ? `${fromPlan || `节假日分流：${fromKb}`}`
      : '节假日避开网红主台阶和主街，改滨江支线或清晨街巷。';
  }

  if (/交通|地铁|怎么去|怎么坐|接驳/.test(text)) {
    const fromPlan = plan ? tipByPrefix(plan, '本地交通：') : '';
    const transit = knowledge?.transit ?? '';
    return [fromPlan, transit].filter(Boolean).join(' ') || '市内优先地铁+步行，跨江少打车。';
  }

  if (/预约|门票|要订/.test(text)) {
    const pitfall = knowledge?.pitfalls.find((item) => /预约/.test(item));
    return pitfall
      || `${city || '热门馆'}部分场馆需要官方预约，我这边只给出行参考，不代订。说「补充景点详情」我可以把停留时长写清楚。`;
  }

  if (/预算|多少钱|人均/.test(text) && plan) {
    return `当前基础信息：${searchPlanHeaderLine(plan)}。市内合计参考 ${searchPlanLocalBudgetLabel(plan)}，往返大交通按出发地另核。要降档可以说「预算降低」，要按本地表重算可以说「重新核算预算」。`;
  }

  if (/避坑|别踩|不推荐/.test(text)) {
    const fromKb = knowledge?.pitfalls.slice(0, 3).join('；') ?? '';
    const highlight = plan?.dayList[0]?.tips ?? '';
    return [fromKb, highlight].filter(Boolean).join(' ') || '先避开网红扎堆点，给闲逛留空档。';
  }

  if (plan) {
    return `这份${plan.baseInfo.targetCity}${plan.baseInfo.days}天${plan.baseInfo.peopleType}还在。说「改成亲子」「下雨怎么走」「人多怎么走」或「发给朋友」，我替你做完。`;
  }

  return '说一座城和几天就行，例如「杭州3天亲子」。不用先填表。';
}
