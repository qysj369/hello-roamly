import { extractMaxPlanDayNumber } from '@/lib/home/planDestinationDriftGuard';
import { parseTravelSearchIntent } from '@/lib/map/planQueryBuilder';
import { extractIntroBudgetTotal } from '@/lib/plan/planBudgetValidator';

export type SnailPlanAuditCode =
  | 'fictional_place'
  | 'constraint_violation'
  | 'mechanical_template';

export type SnailPlanAuditIssue = {
  code: SnailPlanAuditCode;
  message: string;
};

export type SnailPlanAuditLock = {
  city: string;
  days: number | null;
  originName?: string | null;
  preference?: string | null;
  party?: string | null;
  lodgingStayPut: boolean;
  budgetYuan?: number | null;
};

export type SnailPlanAuditResult = {
  ok: boolean;
  issues: SnailPlanAuditIssue[];
};

/** 模型把城市/偏好拆字造出的假地名 */
const FICTIONAL_PLACE_PATTERN =
  /去北(?!京)|京玩|自然山(?!水)|约偏|探店站|偏好站|近郊轻游站|近郊轻游市|美食探店市|亲子时光站/;

/** 单城锁定下不应作为转场目的地的外市 */
const TRANSFER_CITIES = [
  '绍兴',
  '上虞',
  '乌镇',
  '西塘',
  '南浔',
  '嘉兴',
  '苏州',
  '上海',
  '南京',
  '宁波',
  '无锡',
  '北京',
  '天津',
  '杭州',
  '成都',
  '西安',
  '重庆',
  '武汉',
  '长沙',
  '广州',
  '深圳',
  '青岛',
  '厦门',
  '大理',
  '丽江',
  '济南',
] as const;

const TRIPLE_TRANSIT_BLOCK =
  /(?:\*\*)?地铁(?:\*\*)?[：:、\s][\s\S]{0,480}?(?:\*\*)?公交(?:\*\*)?[：:、\s][\s\S]{0,480}?(?:\*\*)?(?:出租车|网约车|打车)/g;

/** 只应主攻一天的重景区 */
const HEAVY_DAY_POIS = ['仰口', '太清宫', '太清游览区', '西溪湿地', '北九水', '信号山', '八大关'] as const;

/** 3天及以上时，末日前不宜再往返的远程点 */
const LAST_DAY_REMOTE_POIS = ['仰口', '太清宫', '太清游览区', '北九水', '流清河'] as const;

const CN_DAY_VALUE: Record<string, number> = {
  一: 1,
  二: 2,
  两: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};

function parseAuditDayToken(token: string): number | null {
  if (/^\d+$/.test(token)) {
    return Number.parseInt(token, 10);
  }
  return CN_DAY_VALUE[token] ?? null;
}

function extractAuditDayBodies(content: string): Map<number, string> {
  const itinerary =
    content.split('【行程流水账】')[1]?.split(/【蜗牛提示】|【避坑指南】/)[0] ?? content;
  const matches = [...itinerary.matchAll(/第\s*([0-9]+|[一二三四五六七八九十两]+)\s*天/g)];
  const bodies = new Map<number, string>();
  for (let i = 0; i < matches.length; i += 1) {
    const day = parseAuditDayToken(matches[i][1] ?? '');
    if (day == null) {
      continue;
    }
    const start = matches[i].index ?? 0;
    const end = matches[i + 1]?.index ?? itinerary.length;
    bodies.set(day, itinerary.slice(start, end));
  }
  return bodies;
}

function dayTargetsHeavyPoi(body: string, poi: string): boolean {
  if (!body.includes(poi)) {
    return false;
  }
  if (new RegExp(`(?:不回|不去|不再去|昨天的|昨日)${escapeRegExp(poi)}`).test(body)) {
    return false;
  }
  return new RegExp(
    `(?:去|到|前往|抵达|主攻|主打|首站[：:\\s]*|游览区|景区)${escapeRegExp(poi)}|${escapeRegExp(poi)}(?:游览区|景区|公园|沙滩|索道)`,
  ).test(body);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeCity(raw: string | null | undefined): string {
  return raw?.trim().replace(/市$/, '') ?? '';
}

function mentionsTransferCity(body: string, city: string): boolean {
  const token = escapeRegExp(city);
  return new RegExp(
    `(?:去|到|转场|前往|抵达|再去|路过|直达)${token}|${token}(?:市|站|东站|西站|南站|北站)`,
  ).test(body);
}

/** 从事实型需求句解析校验锁（「去杭州玩3天，同行单人…」） */
export function resolveSnailPlanAuditLock(
  locationName: string,
  query: string,
  originName?: string | null,
): SnailPlanAuditLock {
  const intent = parseTravelSearchIntent(query);
  const fromGoPlay = query.match(/去([\u4e00-\u9fff]{2,8})玩\s*(\d+)\s*天/);
  const city = normalizeCity(locationName) || normalizeCity(fromGoPlay?.[1]) || normalizeCity(intent.destinationHint);
  const days =
    (fromGoPlay?.[2] ? Number.parseInt(fromGoPlay[2], 10) : null) ??
    intent.days ??
    null;
  const preference =
    query.match(/元，\s*([^\n，,]{2,12})\s*$/)?.[1]?.trim() ||
    intent.preferences[0] ||
    null;
  const lodgingStayPut = !/换区域|换宿|换片区|可以换住/.test(query);
  const party =
    query.match(/同行[：:]?\s*(亲子|情侣|单人)/)?.[1] ||
    (/同行亲子|亲子时光/.test(query) ? '亲子' : /情侣/.test(query) ? '情侣' : null);
  const budgetYuan =
    Number.parseInt(query.match(/人均预算约?(\d+)\s*元/)?.[1] ?? '', 10) ||
    Number.parseInt(query.match(/预算约?(\d+)\s*元/)?.[1] ?? '', 10) ||
    intent.budgetYuan ||
    null;
  return {
    city,
    days,
    originName: originName?.trim() || null,
    preference,
    party,
    lodgingStayPut,
    budgetYuan: Number.isFinite(budgetYuan) && (budgetYuan ?? 0) > 0 ? budgetYuan : null,
  };
}

/** 简介表或「总计 · 约2550元」点分格式 */
export function extractSnailPlanListedTotal(content: string): number | null {
  const intro = content.split('【行程流水账】')[0] ?? content;
  const dotted = intro.match(/总计[^\d]{0,16}(\d+)\s*元/);
  if (dotted?.[1]) {
    return Number.parseInt(dotted[1], 10);
  }
  const table = intro.match(/\|\s*(?:总计|合计)\s*\|\s*(?:约\s*)?(\d+)/);
  if (table?.[1]) {
    return Number.parseInt(table[1], 10);
  }
  return extractIntroBudgetTotal(intro);
}

function collectFictionalIssues(content: string, lock: SnailPlanAuditLock): SnailPlanAuditIssue[] {
  const issues: SnailPlanAuditIssue[] = [];
  if (FICTIONAL_PLACE_PATTERN.test(content)) {
    issues.push({
      code: 'fictional_place',
      message: '正文出现虚构地名（如去北/京玩/自然山）',
    });
  }

  const pref = lock.preference?.trim();
  if (pref && pref.length >= 3 && pref !== lock.city) {
    const prefAsSpot = new RegExp(
      `${escapeRegExp(pref)}(?:站|市|景区|高铁)|抵达${escapeRegExp(pref)}|前往${escapeRegExp(pref)}`,
    );
    if (prefAsSpot.test(content)) {
      issues.push({
        code: 'fictional_place',
        message: `把出行偏好「${pref}」写成了城市或景区`,
      });
    }
  }

  if (lock.city === '北京' && /去北(?!京)|(?<!北)京玩/.test(content)) {
    issues.push({
      code: 'fictional_place',
      message: '把「北京」拆成虚构点位「去北 / 京玩」',
    });
  }

  return issues;
}

function collectConstraintIssues(content: string, lock: SnailPlanAuditLock): SnailPlanAuditIssue[] {
  const issues: SnailPlanAuditIssue[] = [];
  if (lock.city && !content.includes(lock.city)) {
    issues.push({
      code: 'constraint_violation',
      message: `未落实目的地「${lock.city}」`,
    });
  }

  if (lock.party === '亲子' && /情侣出行|咱俩这趟/.test(content)) {
    issues.push({
      code: 'constraint_violation',
      message: '用户锁定亲子，正文写成了情侣行程',
    });
  }

  if (
    lock.city === '青岛' &&
    lock.preference &&
    /自然山水/.test(lock.preference) &&
    !/仰口|崂山/.test(content)
  ) {
    issues.push({
      code: 'constraint_violation',
      message: '青岛自然山水须落实崂山仰口，不能只写老城咖啡馆和信号山',
    });
  }

  if (lock.days != null && lock.days > 0) {
    const maxDay = extractMaxPlanDayNumber(content);
    if (maxDay > lock.days) {
      issues.push({
        code: 'constraint_violation',
        message: `用户锁定${lock.days}天，正文写到了第${maxDay}天`,
      });
    }
    if (lock.days >= 2 && maxDay > 0 && maxDay < lock.days) {
      issues.push({
        code: 'constraint_violation',
        message: `用户锁定${lock.days}天，正文只写到第${maxDay}天`,
      });
    }
    if (new RegExp(`${lock.days}\\s*天\\s*${lock.days}\\s*城`).test(content)) {
      issues.push({
        code: 'constraint_violation',
        message: `单城锁定却写成「${lock.days}天${lock.days}城」`,
      });
    }
  }

  const dayBodies = extractAuditDayBodies(content);
  for (const poi of HEAVY_DAY_POIS) {
    const hitDays = [...dayBodies.values()].filter((body) => dayTargetsHeavyPoi(body, poi)).length;
    if (hitDays >= 2) {
      issues.push({
        code: 'constraint_violation',
        message: `重景区「${poi}」出现在${hitDays}个行程日，须一天主攻、其余天换线`,
      });
    }
  }

  if (lock.days != null && lock.days >= 3) {
    const lastDay = dayBodies.get(lock.days);
    if (lastDay) {
      const remote = LAST_DAY_REMOTE_POIS.filter((poi) => dayTargetsHeavyPoi(lastDay, poi));
      if (remote.length > 0) {
        issues.push({
          code: 'constraint_violation',
          message: `最后一天仍主攻远程景区「${remote[0]}」，应改为市区轻逛并预留返程缓冲`,
        });
      }
      if (
        lock.city === '青岛' &&
        !/2\.5\s*小时|两个半小时|两小时半/.test(lastDay)
      ) {
        issues.push({
          code: 'constraint_violation',
          message: '青岛最后一天须写明预留约2.5小时到站进站缓冲',
        });
      }
    }
  }

  if (lock.lodgingStayPut) {
    const mornings = [...content.matchAll(/从昨晚住宿片区[「"]([^」"]+)[」"]出发/g)].map((m) =>
      (m[1] ?? '').replace(/周边$/, '').trim(),
    );
    const unique = [...new Set(mornings.filter(Boolean))];
    if (unique.length > 1) {
      issues.push({
        code: 'constraint_violation',
        message: `住宿要求不换区域，却出现多个出发片区：${unique.join(' / ')}`,
      });
    }
    const qingdaoFoodStay =
      lock.city === '青岛' &&
      (lock.party === '情侣' || /美食/.test(lock.preference ?? ''));
    if (qingdaoFoodStay) {
      const nightLabels = [...content.matchAll(/今晚住宿片区[：:]\s*([^\n]+)/g)]
        .map((m) => (m[1] ?? '').trim())
        .filter((label) => label && !/返程|回家|无需住宿/.test(label));
      const offBase = [...unique, ...nightLabels].filter(
        (label) => !/中山路|栈桥/.test(label),
      );
      if (offBase.length > 0) {
        issues.push({
          code: 'constraint_violation',
          message: `青岛美食/情侣须连住中山路/栈桥，却写成「${offBase[0]}」`,
        });
      }
    }
  }

  if (lock.city) {
    const skip = new Set<string>([lock.city]);
    for (const city of TRANSFER_CITIES) {
      if (lock.originName && lock.originName.includes(city)) {
        skip.add(city);
      }
    }
    const transferBody =
      lock.days != null && lock.days >= 2
        ? content.split(/第\s*[2-9二三四五六七八九十两]+\s*天/).slice(1).join('\n')
        : content;
    if (transferBody.trim()) {
      const extra = TRANSFER_CITIES.filter(
        (city) => !skip.has(city) && mentionsTransferCity(transferBody, city),
      );
      if (extra.length > 0) {
        issues.push({
          code: 'constraint_violation',
          message: `单城「${lock.city}」出现跨城中转：${extra.slice(0, 3).join('、')}`,
        });
      }
    }
  }

  const intro = content.split('【行程流水账】')[0] ?? content;
  const hasFiveRow =
    /\|\s*交通\s*\|/.test(intro) && /\|\s*机动\s*\|/.test(intro) && /\|\s*总计\s*\|/.test(intro);
  const hasSplitHaul =
    /\|\s*大交通\s*\|/.test(intro) &&
    /\|\s*市内交通\s*\|/.test(intro) &&
    /\|\s*(?:总计|合计)\s*\|/.test(intro);
  if (!hasFiveRow && !hasSplitHaul) {
    issues.push({
      code: 'constraint_violation',
      message: '简介须用表格列出交通（或大交通/市内交通）、餐饮、门票、住宿、机动与总计',
    });
  }
  const trafficRow = intro.match(/\|\s*交通\s*\|([^|\n]+)\|([^|\n]*)/);
  if (trafficRow) {
    const amount = Number.parseInt((trafficRow[1] ?? '').replace(/[^\d]/g, ''), 10);
    const note = trafficRow[2] ?? '';
    if (Number.isFinite(amount) && amount >= 350 && /普快|硬座|硬卧/.test(note)) {
      issues.push({
        code: 'constraint_violation',
        message: '交通分项把普快写成高额，须按普快/硬座实价核算，高铁不计入',
      });
    }
  }

  if (
    (lock.budgetYuan == null || lock.budgetYuan <= 2000) &&
    isHighSpeedRailAsBaseline(content)
  ) {
    issues.push({
      code: 'constraint_violation',
      message: '大交通把高铁写成核算基准，须改用普快/硬座，高铁仅作备选不计入',
    });
  }

  if (lock.budgetYuan != null && lock.budgetYuan > 0) {
    const listed = extractSnailPlanListedTotal(content);
    const ceiling = Math.ceil(lock.budgetYuan * 1.05);
    if (listed != null && listed > ceiling) {
      issues.push({
        code: 'constraint_violation',
        message: `人均总花费约${listed}元，超出锁定预算${lock.budgetYuan}元`,
      });
    }
  }

  return issues;
}

function isQingdaoCoupleFoodLock(lock: SnailPlanAuditLock): boolean {
  return (
    lock.city === '青岛' &&
    lock.party === '情侣' &&
    /美食/.test(lock.preference ?? '')
  );
}

function collectQingdaoCoupleFoodIssues(
  content: string,
  lock: SnailPlanAuditLock,
): SnailPlanAuditIssue[] {
  const issues: SnailPlanAuditIssue[] = [];
  const itinerary =
    content.split('【行程流水账】')[1]?.split(/【蜗牛提示】|【避坑指南】/)[0] ?? '';
  if (/(?:^|\n)\s*\|[-| :]+\|/.test(itinerary) || /\|------\|/.test(itinerary)) {
    issues.push({
      code: 'mechanical_template',
      message: '行程内不得再出现分项消费表或|------|分隔碎片',
    });
  }
  if (/地铁方案/.test(itinerary) && /公交方案/.test(itinerary)) {
    issues.push({
      code: 'mechanical_template',
      message: '交通不得地铁+公交分栏对比，只保留一套公共交通主线',
    });
  }
  if (/栈桥/.test(content) && (!/冬春/.test(content) || !/涨潮|湿滑/.test(content))) {
    issues.push({
      code: 'constraint_violation',
      message: '栈桥须写明海鸥仅冬春出没，以及涨潮栈道湿滑',
    });
  }
  if (!/官方售票/.test(content) || !/黄牛/.test(content)) {
    issues.push({
      code: 'constraint_violation',
      message: '须嵌入奥帆官方售票窗口购票、切勿轻信路边黄牛',
    });
  }
  if (!/登州路\s*56/.test(content) || !/预约/.test(content) || !/16\s*点|16:00/.test(content)) {
    issues.push({
      code: 'constraint_violation',
      message: '须写登州路56号啤酒博物馆、公众号预约与16点停检',
    });
  }
  const lastDay = extractAuditDayBodies(content).get(lock.days ?? 3) ?? '';
  if (lock.days != null && lock.days >= 3) {
    if (!/14\s*[:：]?00|14\s*点/.test(lastDay)) {
      issues.push({
        code: 'constraint_violation',
        message: '第3天须写明下午14:00前动身取回行李前往青岛站',
      });
    }
  }
  return issues;
}

function isHighSpeedRailAsBaseline(content: string): boolean {
  const intro = content.split('【行程流水账】')[0] ?? content;
  if (/第1天高铁直达/.test(intro)) {
    return true;
  }
  if (/大交通（[^）]{0,48}高铁/.test(intro)) {
    return true;
  }
  const haul = intro.match(/大交通[^。\n]{0,32}高铁[^。\n]{0,20}/);
  if (haul && !/备选|不计入|加价/.test(haul[0])) {
    return true;
  }
  const trafficRow = intro.match(/\|\s*交通\s*\|([^|\n]+)/);
  if (trafficRow?.[1] && /高铁/.test(trafficRow[1]) && !/备选|不计入/.test(trafficRow[1])) {
    return true;
  }
  return false;
}

function isMechanicalTemplate(content: string): boolean {
  const triples = content.match(TRIPLE_TRANSIT_BLOCK) ?? [];
  const landingBest = content.match(/落地最佳/g) ?? [];
  const tripleLabels = content.match(/三方案/g) ?? [];
  if (triples.length >= 2 || landingBest.length >= 2 || tripleLabels.length >= 1) {
    return true;
  }
  if (/地铁方案/.test(content) && /公交方案/.test(content)) {
    return true;
  }

  const itinerary =
    content.split('【行程流水账】')[1]?.split('【蜗牛提示】')[0] ?? content;
  const lines = itinerary
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#') && !line.startsWith('|'));
  if (lines.length < 8) {
    return false;
  }
  const bulletish = lines.filter((line) =>
    /^(?:[-*•]|\d+[\.、]|\*\*(?:地铁|公交|出租车|网约车)\*\*)/.test(line),
  ).length;
  return bulletish / lines.length >= 0.55;
}

/** 校验模型攻略：虚构地名 / 违背约束 / 全机械分点 */
export function auditSnailPlanOutput(
  content: string,
  lock: SnailPlanAuditLock,
): SnailPlanAuditResult {
  const trimmed = content.trim();
  if (!trimmed) {
    return {
      ok: false,
      issues: [{ code: 'constraint_violation', message: '攻略正文为空' }],
    };
  }

  const issues = [
    ...collectFictionalIssues(trimmed, lock),
    ...collectConstraintIssues(trimmed, lock),
  ];
  if (isQingdaoCoupleFoodLock(lock)) {
    issues.push(...collectQingdaoCoupleFoodIssues(trimmed, lock));
  }
  if (isMechanicalTemplate(trimmed)) {
    issues.push({
      code: 'mechanical_template',
      message: '全文为机械三选一交通模板或分点套话',
    });
  }

  return { ok: issues.length === 0, issues };
}

export const SNAIL_PLAN_MAX_REGEN_ATTEMPTS = 1;
