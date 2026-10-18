import type { NavigateFunction } from 'react-router-dom';
import { buildAdvisorHandoffState } from '@/lib/ai/buildAdvisorHandoff';
import { resetHomeMapPlanLaunchCooldown } from '@/lib/home/launchHomeMapQiongYouPlan';
import { parseTravelSearchIntent } from '@/lib/map/planQueryBuilder';
import { paths } from '@/router/paths';
import { useGlobalMapPlanningStore } from '@/stores/globalMapPlanning/store';
import type { AiChatPageState } from '@/types/router-state';

export type HoloPlanClarifyHandoff = {
  city: string;
  days: number;
  party: string;
  budgetYuan: number;
  preference: string;
};

export type HoloPlanSearchOptions = {
  /** 用户输入或场景文案 */
  query: string;
  /** 已定位 / 手动出发地（有则拼进跨城提示） */
  originLabel?: string | null;
  /** 明确目的地（城市卡 / 场景卡） */
  destination?: string | null;
  /** 首页追问五项已齐：直接生成，禁止模型再问 */
  clarify?: HoloPlanClarifyHandoff | null;
};

const AI_CLARIFY_READY =
  '【慢行生成前置】用户已在前端确认目的地、出行天数、同行人群、预算与旅行偏好；请直接生成完整漫行攻略，勿再追问。' +
  '开篇须明确目的地城市等于用户锁定城市，不得漂移。慢游、亲子、近郊仅为玩法标签，不是地名，禁止写成「近郊慢行目的地」或高铁站名，勿写入第N天标题当站名。' +
  '主住宿必须在锁定目的地城市境内，禁止把出发地小区当成目的地住宿。' +
  '文风松弛自然：景点、本地美食、通勤交通融入叙事，拒绝模板化清单腔；简介后附一张清晰的预算分项小表。' +
  '多日须一基址连住；次日从昨晚住宿出发；同城禁止伪大交通；跨区必须写接驳，禁止瞬移。';

const AI_CLARIFY_ASK =
  '【慢行生成前置】若出行天数、同行人群、预算范围或旅行偏好仍缺失，请先用口语友好追问补齐（一次问一项），信息齐备后再生成完整漫行攻略；勿在信息不全时硬写行程。' +
  '目的地城市不得漂移；慢游/亲子/近郊仅为玩法标签，不是地名。';

function hasPreferenceSignal(text: string): boolean {
  return /偏好：|近郊轻游|人文慢逛|美食探店|亲子时光|自然山水|nearby soft|culture stroll|food lanes|family time/i.test(
    text,
  );
}

/**
 * 首页搜索 / 种草卡 → /ai handoff。
 * 第二层 AI 兜底约束挂在 handoff 文案，不改 mapPlanStreamPipeline。
 */
export function buildHoloPlanSearchState(options: HoloPlanSearchOptions): AiChatPageState {
  const trimmed = options.query.trim();
  const intent = parseTravelSearchIntent(trimmed || options.destination || '');
  const clarify = options.clarify;
  const destination = (
    clarify?.city ||
    options.destination?.trim() ||
    intent.destinationHint ||
    trimmed
  ).trim();
  const originLabel = options.originLabel?.trim() || '';
  const basePrompt = trimmed || (destination ? `去${destination}玩` : '');
  const hasParty = /亲子|单人|结伴|独自|情侣|朋友|家庭|solo|couple|friends|family|together/i.test(
    trimmed,
  );
  const hasCity = Boolean(clarify?.city || options.destination?.trim() || intent.destinationHint);
  const hasPreference = hasPreferenceSignal(trimmed) || Boolean(intent.preferences?.length);
  const days = clarify?.days ?? intent.days ?? null;
  const budgetYuan = clarify?.budgetYuan ?? intent.budgetYuan ?? null;
  const complete = Boolean(
    clarify ||
      (hasCity && days != null && budgetYuan != null && hasParty && hasPreference),
  );

  const originHint = originLabel
    ? `\n【出发地】${originLabel}（仅作出发锚点；目的地城市仍是「${destination || '锁定城市'}」，勿把出发区县当成目的地）`
    : '';

  const confirmedLine = complete
    ? `【用户已确认】城市${destination || '（见上文）'}，${days}天，同行：${clarify?.party || '见上文'}，预算约${budgetYuan}元，偏好：${clarify?.preference || '见上文'}。请直接生成漫行攻略；开篇一段融合气质、核心点位、本地美食与市内交通，简介后只附一张预算表（项目/金额/平价省钱方案，含机动），勿再追问、勿再套生硬表格。`
    : '';

  const userFacingPrompt = complete
    ? `${basePrompt}${originHint}\n\n${confirmedLine}\n\n${AI_CLARIFY_READY}`
    : `${basePrompt}${originHint}\n\n${AI_CLARIFY_ASK}`;

  return buildAdvisorHandoffState({
    initialPrompt: userFacingPrompt,
    source: 'home_map',
    destination: destination || undefined,
    days: days ?? undefined,
    budget: budgetYuan != null ? String(budgetYuan) : undefined,
    // 目的地城市，不是出发地；出发地只拼进 prompt，勿当作 locationName
    locationName: destination || undefined,
    searchNonce: Date.now(),
  });
}

/** 丢掉上一轮地图方案与顾问会话，再进 /ai */
export function beginFreshHoloPlanSearch(): void {
  resetHomeMapPlanLaunchCooldown();
  useGlobalMapPlanningStore.getState().resetLivePlanSession();
}

export function navigateHoloPlanSearch(
  navigate: NavigateFunction,
  options: HoloPlanSearchOptions,
): void {
  beginFreshHoloPlanSearch();
  const state = buildHoloPlanSearchState(options);
  navigate(
    { pathname: paths.ai, search: `?fresh=${state.searchNonce ?? Date.now()}` },
    { state },
  );
}
