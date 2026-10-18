import { SNAIL_PLAN_ASSEMBLER_CONTRACT } from '@/lib/config/snailOfficialPlanPrompt';
import { AI_SLOW_TRAVEL_PROMPT_CONSTRAINTS } from '@/lib/config/productPositioning';
import {
  buildStrictDestinationConstraint,
  buildStrictOriginConstraint,
} from '@/lib/plan/doorToDoorTransit';
import {
  buildSameCityAccuracyConstraint,
  buildStrictDayCountConstraint,
  resolveEffectivePlanDays,
} from '@/lib/plan/planDayConstraint';

/** 地图点击 AI 规划 — 正式系统 / 用户提示词 */

export function buildMapPlanSystemPrompt(): string {
  return `${AI_SLOW_TRAVEL_PROMPT_CONSTRAINTS}

${SNAIL_PLAN_ASSEMBLER_CONTRACT}`;
}

function parseLockedBudgetYuan(query: string): number | null {
  const n = Number.parseInt(query.match(/人均预算约(\d+)\s*元/)?.[1] ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** 连住与出门接驳：只写一种最省事方式，不套三选一模板 */
function buildSnailStayPutLock(query: string): string {
  const lines = [
    '【住宿连住】多日单城一基址连住，不换酒店（用户明确要求换宿除外）。',
    '每天正文末写一行：今晚住宿片区：XXX（具体商圈/地铁站周边）。返程日写「今晚住宿片区：返程回家，无需住宿」。',
    '第2天及以后开头写：从昨晚住宿片区「XXX」出发；先写一种最省事的市内接驳（路线、耗时、费用），再去今日首站，禁止瞬移。',
    '禁止地铁/公交/打车三选一清单，禁止写「落地最佳」。济南地铁只写3号线、2号线，禁止写成R3/R2。',
    '同一重景区只主攻一天；最后一天市区轻逛+返程，预留约2.5小时到站，禁止再往返远程景区。',
  ];
  if (/自然山水/.test(query)) {
    lines.push(
      '青岛三日自然山水：崂山仰口只写第2天；第3天走太平角/八大关外缘等市区海滨，14:00前动身返程，禁止第3天再去仰口、太清、石老人。',
    );
  } else if (/美食|情侣/.test(query)) {
    lines.push(
      '青岛三日情侣美食须连住中山路/栈桥两晚，禁止改住五四广场、浮山所。全篇只在简介后放一张管道预算表，禁止日间分项表、禁止|------|分隔碎片、禁止分栏对比。',
      '每段接驳只写地铁或公交一条主线（路线、耗时、费用）；打车只许一句备选，禁止地铁方案+公交方案并列。禁止🐌。',
      '第1天：济南高铁抵达→中山路安顿→春和楼（中山路146号）→教堂→龙江路/大学路→栈桥（红嘴鸥仅冬春季节大量出没，其余时段仅可观赏海岸礁石，涨潮栈道湿滑注意安全）→团岛市场→营口路啤酒屋。',
      '第2天：海岸线+傍晚奥帆游船（海上游船仅可在奥帆中心官方售票窗口购票，切勿轻信路边拉客黄牛低价揽客）+台东夜市。雨天备选写完整一句：信号山和海边步道改去台东室内小吃或中山路骑楼避雨，奥帆不开航就回住处，不另列表。',
      '第3天：团岛/海乐或八大关外缘后，必须写登州路56号青岛啤酒博物馆（须提前在官方公众号实名预约，每日16点停止检票入场）。下午14:00前动身取回行李前往青岛站，全程预留2.5小时充足缓冲，用于行李寄存、安检、候车。',
      'D1/D2结尾固定写「今晚住宿片区：中山路/栈桥周边」；D3写「今晚住宿片区：返程回家，无需住宿」。每天末写贴合当天的双人消费分项，禁止重复同一句套话。不另起【蜗牛提示】【避坑指南】。',
    );
  }
  return lines.join('');
}

function buildSnailDay1TransitHint(
  originName: string,
  destinationName: string,
  query: string,
): string {
  const origin = originName.trim();
  const dest = destinationName.trim();
  if (!origin || !dest) {
    return '';
  }
  const budgetYuan = parseLockedBudgetYuan(query);
  const haul =
    budgetYuan != null && budgetYuan >= 2500
      ? '大交通可按高铁二等核算，普快作为省钱备选写明差额；禁止编造具体车次号。'
      : '大交通按普快/硬卧核算，高铁仅作备选不计入总计。';
  return [
    `第1天从「${origin}」只写一种最省事出门方式到车站（路线、耗时、费用）。`,
    `${haul}抵达「${dest}」后只写一种接驳到住宿。`,
    '车次以出发当天 12306 为准。',
  ].join('');
}

function buildDestinationSpotHints(locationName: string): string {
  if (!/天津/.test(locationName)) {
    return '';
  }
  return [
    '\n【目的地景点要求·天津】流水账须自然覆盖（勿单列推销）：',
    '古文化街、鼓楼；天津之眼写清傍晚闲逛时段（约 17:30-19:00 灯光/落日更舒服）；',
    '瓷房子补充外观最佳观景点（正门斜 45° 看彩色瓷片墙，避开正午顶光）。',
  ].join('');
}

export function buildMapPlanUserPrompt(
  locationName: string,
  query: string,
  coords?: { lng: number; lat: number },
  originName?: string | null,
): string {
  const trimmed = query.trim();
  const coordinateLine = coords
    ? `\n【内部定位参考，勿写入正文】锚点约 (${coords.lng.toFixed(4)}, ${coords.lat.toFixed(4)})，请围绕「${locationName}」规划。`
    : '';
  const originLine = originName?.trim()
    ? `\n出发地（用户已校正，必须遵守）：${originName.trim()}。\n${buildStrictOriginConstraint(originName)}\n${buildSnailDay1TransitHint(originName, locationName, trimmed)}`
    : '';
  const spotHints = buildDestinationSpotHints(locationName);
  const destLock = buildStrictDestinationConstraint(locationName);
  const requestedDays = resolveEffectivePlanDays(trimmed, locationName);
  const dayLock = requestedDays ? `\n${buildStrictDayCountConstraint(requestedDays)}` : '';
  const lodgingLock = `\n${buildSnailStayPutLock(trimmed)}`;
  const accuracyLock = `\n${buildSameCityAccuracyConstraint()}`;
  const budgetYuan = parseLockedBudgetYuan(trimmed);
  const budgetLock =
    budgetYuan != null
      ? budgetYuan >= 2500
        ? `\n人均总花费须落在约${budgetYuan}元以内（禁止超支）。大交通可用高铁二等为基准，普快写省钱差额；市内地铁+公交，打车一句备选。门票须覆盖简介点名的付费项（如游船、博物馆），表内有的正文必须有。预算表可写交通五类，或拆成大交通/市内交通，须含餐饮、门票、住宿、机动与总计/合计。`
        : `\n人均总花费须落在约${budgetYuan}元以内（禁止超支）。大交通以平价普快/硬卧为核算基准，高铁只作贵价备选不计入总计；住宿按双人分摊的平价民宿；门票只写行程里真正会去的1–2个点，表内付费景点必须有对应游玩段落；预算表须含交通/餐饮/门票/住宿/机动。`
      : '';

  return `地点：${locationName}
需求：${trimmed}${originLine}${coordinateLine}
${destLock}${dayLock}${lodgingLock}${accuracyLock}${budgetLock}${spotHints}

按正式系统提示输出。读者可见只有简介一段+Markdown预算表+分天流水账；贴士避坑写进各天。装配层可各写一行【蜗牛提示】【避坑指南】占位句，勿再列条目。天数、目的地、住宿、预算约束必须与用户需求一致。预算表必须用 | 管道，禁止圆点模拟。青岛情侣/美食连住中山路/栈桥。每日行程每个地点后必须跟一句简短游玩亮点，禁止只罗列地名。`;
}

/** 连续追问 — 仍输出四区块 Markdown */
export function buildMapPlanContinueSystemPrompt(): string {
  return `${buildMapPlanSystemPrompt()}

补充（连续对话 / 增量修改模式）：
- 上方对话中已有初版方案；用户会提出修改意见（预算、天数、节奏、交通等）。
- 请输出更新后的完整方案。贴士避坑写入各天；【蜗牛提示】【避坑指南】只写装配占位句。
- 禁止更换目的地城市；若用户只说「节奏更松弛/降低预算」或旧称「轻松点/压预算」，只改节奏与花费。
- 简介摘要与花费表「总计」须同步更新。
- 若用户要求与之前冲突，以最新一条用户消息为准。`;
}

/** 质检失败后整篇重写，把失败项写给模型 */
export function buildSnailAuditRepairPrompt(issues: Array<{ message: string }>): string {
  const lines = issues.map((issue) => `- ${issue.message}`).join('\n');
  return [
    '上一稿未通过校验，必须整篇重写，不要在旧稿上打补丁。',
    lines,
    '重写硬规则：游记段落；每段交通只写一种最省事接驳；禁止地铁/公交/打车并列、「地铁方案+公交方案」分栏、「三方案」「落地最佳」。行程内禁止再画消费表或|------|。低预算档大交通用普快；人均约2500元及以上可用高铁二等，普快只留一句差额。同一重景区只主攻一天。青岛自然山水才写仰口且只一天；青岛美食/情侣连住中山路或栈桥，禁止五四广场换宿，简介后只留一张管道预算表。栈桥写海鸥季节与涨潮湿滑；奥帆只官方窗口拒黄牛；啤酒博物馆写登州路56号、公众号实名预约、16点停检；第3天写下午14:00前动身取回行李前往青岛站，预留2.5小时缓冲。禁止🐌。住宿连住；人均不超锁定。',
  ].join('\n');
}

export function buildMapPlanFollowUpUserPrompt(
  message: string,
  locationName: string,
  intentHint?: string,
): string {
  const hintLine = intentHint?.trim() ? `\n修改约束：${intentHint.trim()}` : '';
  return `目的地：${locationName}（不可更改）${hintLine}
调整需求：${message.trim()}

请根据我们之前的方案和这条新需求，输出更新后的完整四区块漫行方案。`;
}
