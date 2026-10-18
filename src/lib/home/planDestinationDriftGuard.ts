import { scrubPlanDisplayMarkup } from '@/lib/home/scrubPlanDisplayMarkup';
import type { ClarifyLockedPlanFields } from '@/lib/map/planQueryBuilder';
import { extractThemePois, scrubPriorQualityArtifacts } from '@/lib/plan/planQualityGate';
import { parsePlanSections, serializePlanSections } from '@/lib/plan/parsePlanSections';
import { applySnailPlanAuditRepairs } from '@/lib/home/snailPlanAuditRepair';
import { resolveSnailPlanAuditLock } from '@/lib/home/snailPlanOutputAudit';

/** 模型把「偏好/玩法」拆字或误读成的假地名 */
const FAKE_PREF_CITY_PATTERN =
  /约偏|偏好站|偏门站|玩法偏好站|旅行偏好站|近郊轻游站|近郊轻游市|近郊慢行站/;

/** 玩法标签被当成高铁终点/整城目的地 */
const PREF_AS_HAUL_DEST =
  /(?:高铁|火车|抵达|前往|直达|转场至|终点)[^。\n]{0,24}(?:约偏|偏好站|近郊轻游(?:站|市)?|探店站|「探店」)/;

/** 离开锁定城的外市 / 假站（正文裁切用） */
const OFF_CITY_BODY =
  /绍兴|上虞|乌镇|西塘|南浔|嘉兴|苏州|上海|南京|宁波|无锡|探店站|转场[：:]|我猜您说的是|按绍兴偏门/;

export type ClarifyPlanDriftIssue = {
  code:
    | 'fake_pref_city'
    | 'multi_city_title'
    | 'preference_as_haul'
    | 'prompt_leak'
    | 'day_count_mismatch'
    | 'extra_city';
  message: string;
};

/** 模型把系统约束句抄成景点 / 站名 */
const PROMPT_LEAK_PATTERN =
  /禁止另造城市|绝不是城市或高铁站|主住宿连住在|这\d+个站点挨个玩透|\d+\s*天\s*\d+\s*站|50天50站|把一串词儿当成|每天解锁一个|“预算小表”|“行程流水账”|「预算小表」|「行程流水账」/;

/** 把「锁定 / 一共 / 单城」当成第N天主标题 */
const CONSTRAINT_AS_DAY_TITLE =
  /第\s*[0-9一二三四五六七八九十两]+\s*天[^\n]{0,20}(?:单城锁定|锁定|一共|只写)(?:\s|[·•（(]|$)/;

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

function parseDayToken(token: string): number | null {
  if (/^\d+$/.test(token)) {
    return Number.parseInt(token, 10);
  }
  return CN_DAY_VALUE[token] ?? null;
}

export function extractMaxPlanDayNumber(content: string): number {
  let max = 0;
  for (const match of content.matchAll(/第\s*([0-9]+|[一二三四五六七八九十两]+)\s*天/g)) {
    const value = parseDayToken(match[1] ?? '');
    if (value != null && value > max) {
      max = value;
    }
  }
  return max;
}

/**
 * 仅在「真的写出第 N+1 天标题」时视为天数溢出。
 * 简介里提前提到第2天/外市，不算溢出——否则会掐断生成，只剩半篇简介。
 */
export function hasClarifyStreamOverflow(
  content: string,
  lock: ClarifyLockedPlanFields,
): boolean {
  return extractMaxPlanDayNumber(content) > lock.days;
}

/** 单城锁定下，天数标题里不该出现的外市（近郊区县不算） */
const EXTRA_CITY_IN_DAY =
  /第\s*[0-9一二三四五六七八九十两]+\s*天[^\n]{0,40}(?:乌镇|西塘|南浔|苏州|上海|嘉兴|南京|宁波|无锡|绍兴)/;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 单城锁定下，正文是否仍含偏好造城 / N天N城 等漂移 */
export function detectClarifyPlanDrift(
  content: string,
  lock: ClarifyLockedPlanFields,
): ClarifyPlanDriftIssue[] {
  const issues: ClarifyPlanDriftIssue[] = [];
  const trimmed = content.trim();
  if (!trimmed) {
    return issues;
  }

  if (FAKE_PREF_CITY_PATTERN.test(trimmed)) {
    issues.push({
      code: 'fake_pref_city',
      message: `正文出现假地名（如约偏），与锁定城市「${lock.city}」不符`,
    });
  }

  if (PREF_AS_HAUL_DEST.test(trimmed)) {
    issues.push({
      code: 'preference_as_haul',
      message: `把玩法偏好「${lock.preference}」写成了大交通终点或第二座城市`,
    });
  }

  const multiCity = new RegExp(`${lock.days}\\s*天\\s*${lock.days}\\s*城`);
  if (multiCity.test(trimmed)) {
    issues.push({
      code: 'multi_city_title',
      message: `单城锁定却写成「${lock.days}天${lock.days}城」`,
    });
  }

  const pref = lock.preference.trim();
  if (pref.length >= 3 && pref !== lock.city) {
    const prefAsCity = new RegExp(
      `第\\s*[0-9一二三四五六七八九十两]+\\s*天[^\\n]{0,20}${escapeRegExp(pref)}(?:站|市|高铁|大交通)`,
    );
    if (prefAsCity.test(trimmed)) {
      issues.push({
        code: 'preference_as_haul',
        message: `第N天标题或交通把偏好「${pref}」当成了城市/车站`,
      });
    }
  }

  if (PROMPT_LEAK_PATTERN.test(trimmed)) {
    issues.push({
      code: 'prompt_leak',
      message: '把生成约束抄进正文当景点或站名',
    });
  }

  if (/\d+\s*天\s*\d+\s*站/.test(trimmed) || /(?:^|[^\d])(?:[4-9]|[1-9]\d)\s*天(?:行程|住宿)/.test(trimmed)) {
    issues.push({
      code: 'day_count_mismatch',
      message: `用户锁定${lock.days}天，正文写成超长天数或「N天N站」`,
    });
  }

  const maxDay = extractMaxPlanDayNumber(trimmed);
  if (maxDay > lock.days) {
    issues.push({
      code: 'day_count_mismatch',
      message: `用户锁定${lock.days}天，正文写到了第${maxDay}天`,
    });
  }

  if (CONSTRAINT_AS_DAY_TITLE.test(trimmed)) {
    issues.push({
      code: 'prompt_leak',
      message: '把「锁定/一共/单城」写成了第N天标题',
    });
  }

  const fromDayTwo = trimmed.split(/第\s*[2-9二三四五六七八九十两]+\s*天/).slice(1).join('\n');
  if (/济南西\s*[→\-－].{0,8}杭州|主住宿→济南西/.test(fromDayTwo)) {
    issues.push({
      code: 'extra_city',
      message: '第2天起又把出发地车站写成了当日大交通',
    });
  }

  if (
    /转场[：:]/.test(trimmed) ||
    EXTRA_CITY_IN_DAY.test(trimmed) ||
    OFF_CITY_BODY.test(trimmed)
  ) {
    issues.push({
      code: 'extra_city',
      message: `单城锁定「${lock.city}」却出现外市转场或把玩法写成第二座城`,
    });
  }

  return issues;
}

/** 校正偏好造城：把假地名替换成锁定城市及近郊表述 */
export function scrubClarifyPlanDrift(
  content: string,
  lock: ClarifyLockedPlanFields,
): string {
  const { city, days, preference } = lock;
  const cityStation = `${city}站`;
  const suburbLabel = `${city}近郊（${preference}）`;

  let next = content
    .replace(
      /约偏站|约偏市|约偏高铁|约偏大交通|抵达约偏|前往约偏|直达约偏|转场至约偏|高铁去约偏/g,
      cityStation,
    )
    .replace(
      new RegExp(`${escapeRegExp(city)}、约偏、轻游(?:三地|两城)?`, 'g'),
      `${city}（${preference}，单城+近郊当日往返）`,
    )
    .replace(/串起[^，。\n]{0,8}约偏[^，。\n]{0,12}轻游[^，。\n]{0,6}/g, `以${city}为主、近郊当日往返`)
    .replace(/、约偏、轻游/g, `（${preference}）`)
    .replace(/约偏/g, city)
    .replace(/偏好站|偏门站|玩法偏好站|旅行偏好站/g, cityStation)
    .replace(/近郊轻游站|近郊轻游市|近郊慢行站/g, cityStation)
    .replace(
      new RegExp(`${days}\\s*天\\s*${days}\\s*城`, 'g'),
      `${days}天${city}漫行`,
    )
    .replace(
      /第\s*([0-9一二三四五六七八九十两]+)\s*天\s*[·•]\s*约偏/g,
      `第$1天 · ${suburbLabel}`,
    )
    .replace(
      /第\s*([0-9一二三四五六七八九十两]+)\s*天\s*[·•]\s*近郊轻游(?:站|市)?/g,
      `第$1天 · ${suburbLabel}`,
    )
    .replace(/高铁直达近郊轻游(?:站|市)?/g, `前往${city}近郊`)
    .replace(/（[^）]{0,16}→\s*约偏）/g, `（→${city}）`)
    .replace(/(?:[4-9]|1[0-4])\s*天行程/g, `${days}天行程`)
    .replace(/\d+\s*天\s*\d+\s*站/g, `${days}天${city}漫行`)
    .replace(/这\d+个站点挨个玩透。?/g, '')
    .replace(
      /第\s*([0-9一二三四五六七八九十两]+)\s*天[^\n]{0,12}(?:单城锁定|锁定|一共|只写)/g,
      `第$1天 · ${city}`,
    )
    .replace(
      /[“「"](?:禁止另造城市|绝不是城市或高铁站|主住宿连住在[^”」"]+|或当日往返[^”」"]+|预算小表|行程流水账|蜗牛提示)[”」"]/g,
      city,
    );

  const pref = preference.trim();
  if (pref.length >= 3) {
    next = next.replace(
      new RegExp(`前往${escapeRegExp(pref)}(?:站|市)`, 'g'),
      `前往${city}（${pref}玩法）`,
    );
  }

  return next;
}

export function appendClarifyDriftNote(
  content: string,
  issues: ClarifyPlanDriftIssue[],
): string {
  if (issues.length === 0) {
    return content;
  }
  const note = [
    '【蜗牛质检·漂移校正】已自动替换「约偏/偏好站」等假地名；请核对下方行程是否仍偏离锁定城市：',
    ...issues.map((issue) => `- ${issue.message}`),
  ].join('\n');
  if (content.includes('【蜗牛质检·漂移校正】')) {
    return content;
  }
  return `${content.trim()}\n\n${note}`;
}

export function isCriticalClarifyDrift(issues: ClarifyPlanDriftIssue[]): boolean {
  return issues.some(
    (issue) =>
      issue.code === 'fake_pref_city' ||
      issue.code === 'multi_city_title' ||
      issue.code === 'preference_as_haul' ||
      issue.code === 'prompt_leak' ||
      issue.code === 'day_count_mismatch' ||
      issue.code === 'extra_city',
  );
}

/**
 * 按用户锁定天数裁掉第 N+1 天及之后（结构截断，不再靠提示词劝模型停笔）。
 */
export function clipClarifyPlanToLockedDays(content: string, days: number): string {
  const trimmed = content.trim();
  if (!trimmed || days < 1) {
    return trimmed;
  }

  let cutAt = trimmed.length;
  for (const match of trimmed.matchAll(/(?:^|\n)\s*(?:#{1,4}\s*)?第\s*([0-9]+|[一二三四五六七八九十两]+)\s*天/g)) {
    const value = parseDayToken(match[1] ?? '');
    if (value != null && value > days) {
      const idx = match.index ?? -1;
      if (idx >= 0 && idx < cutAt) {
        cutAt = idx;
      }
    }
  }

  let clipped = trimmed.slice(0, cutAt).trim();
  clipped = clipped
    .replace(/\d+\s*天\s*\d+\s*站/g, `${days}天行程`)
    .replace(/(?:[4-9]|[1-9]\d)\s*天行程/g, `${days}天行程`)
    .replace(/50\s*天/g, `${days}天`);
  return clipped;
}

function lockIntroFacts(lock: ClarifyLockedPlanFields): string {
  return `${lock.days}天都在${lock.city}。同行${lock.party}，人均预算约${lock.budgetYuan}元，${lock.preference}。晚上住${lock.city}同一片区，不换城。`;
}

function stripClarifyIntroArtifacts(intro: string): string {
  return intro
    .replace(/【方案简介】/g, '')
    .replace(/>?\s*🐌\s*\*{0,2}质检提醒\*{0,2}[\s\S]*?重新生成。?/g, '')
    .replace(/【蜗牛质检】[\s\S]*$/g, '')
    .replace(/今晚住宿片区[：:][^\n。]*/g, '')
    .replace(/当日双人消费[：:][^\n]*/g, '')
    .replace(/花费要点[（(]人均[）)][：:][^\n]*/g, '')
    .replace(/[·•]\s*项目\s*[·•][\s\S]*?合计[^\n]*/g, '')
    .replace(/(?:^|\n)\s*(?:大交通|市内交通|餐饮|门票|住宿|机动备用|合计)\s*[·•][^\n]*/g, '')
    .replace(/🐌\s*第[一二三123]天[^\n；;]*/g, '')
    .replace(/第[一二三123]天[^。\n]{0,24}(?:到|步行|补个|上午|下午)[^\n]*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function introNeedsRewrite(intro: string): boolean {
  return (
    !intro.trim() ||
    OFF_CITY_BODY.test(intro) ||
    FAKE_PREF_CITY_PATTERN.test(intro) ||
    PROMPT_LEAK_PATTERN.test(intro) ||
    /我猜您说的是/.test(intro)
  );
}

/**
 * 质检会把正文里反复出现的这些词当成「简介未承诺」。
 * 不用 extractThemePois 计数：西湖文化广场 / 九溪烟树 也必须点名。
 */
const INTRO_MUST_NAME = ['西湖', '九溪', '灵隐寺', '灵隐', '良渚', '宋城', '茶村'] as const;

function introCoversPoi(intro: string, poi: string): boolean {
  if (intro.includes(poi)) {
    return true;
  }
  if (poi === '灵隐寺') {
    return intro.includes('灵隐');
  }
  if (poi === '灵隐') {
    return intro.includes('灵隐寺');
  }
  return false;
}

export function ensureIntroMentionsItineraryPois(intro: string, itinerary: string): string {
  const missing: string[] = [];
  for (const poi of INTRO_MUST_NAME) {
    const hits = itinerary.split(poi).length - 1;
    if (hits < 2 || introCoversPoi(intro, poi) || missing.some((item) => introCoversPoi(item, poi))) {
      continue;
    }
    missing.push(poi);
  }
  const compact = missing.filter((poi, _, list) => {
    if (poi === '灵隐' && list.includes('灵隐寺')) {
      return false;
    }
    return true;
  });
  const fromTheme = extractThemePois(itinerary).filter((poi) => {
    if (!/良渚|茶村|九溪|游船|西湖|宋城|灵隐/.test(poi)) {
      return false;
    }
    return itinerary.split(poi).length - 1 >= 2 && !introCoversPoi(intro, poi) && !compact.some((item) => introCoversPoi(item, poi) || item.includes(poi) || poi.includes(item));
  });
  const names = [...compact, ...fromTheme].slice(0, 4);
  if (names.length === 0) {
    return intro.trim();
  }
  const trimmed = intro.trim();
  const prefix = trimmed && !/[。！？]$/.test(trimmed) ? `${trimmed}。` : trimmed;
  return `${prefix}行程会走到${names.join('、')}一带，按心情取舍即可。`;
}

/** 结果页复制/展示前再补一句景点，并去掉质检红字（出门检会在补景点前先报警） */
export function polishClarifyPlanForDisplay(content: string): string {
  const cleaned = scrubPriorQualityArtifacts(content);
  const sections = parsePlanSections(cleaned);
  if (!sections.itinerary.trim()) {
    return cleaned;
  }
  const itinerary =
    /青岛/.test(sections.itinerary) && /栈桥|春和楼/.test(sections.itinerary)
      ? sections.itinerary.replace(
          /第\s*[1-9一二三四五六七八九十两]+\s*天\s*·\s*[^\n]+（[^）]+）\n(?:抵达[^，\n]+后安顿住宿，|从昨晚住宿出发，)全天留在[^\n]+市内按「[^」]+」慢慢逛[\s\S]*?不跨市。\n?/g,
          '',
        )
      : sections.itinerary;
  const intro = ensureIntroMentionsItineraryPois(
    stripClarifyIntroArtifacts(sections.intro),
    itinerary,
  );
  let next = scrubPlanDisplayMarkup(
    serializePlanSections({
      ...sections,
      intro,
      itinerary,
      snailTips: '',
      pitfalls: '',
    }),
  );
  if (/青岛/.test(next) && /情侣|美食探店/.test(next)) {
    const lock = resolveSnailPlanAuditLock('青岛', next);
    next = scrubPlanDisplayMarkup(applySnailPlanAuditRepairs(next, lock));
  }
  return next;
}

export function buildClarifyLockIntro(
  lock: ClarifyLockedPlanFields,
  itinerary = '',
): string {
  const body = ensureIntroMentionsItineraryPois(lockIntroFacts(lock), itinerary);
  return ['【方案简介】', '', body].join('\n');
}

export function replaceClarifyIntro(content: string, lock: ClarifyLockedPlanFields): string {
  const cut = content.search(/【行程流水账】|(?:^|\n)\s*(?:#{1,4}\s*)?第\s*[1一]\s*天/);
  if (cut < 0) {
    return buildClarifyLockIntro(lock);
  }
  let rest = content.slice(cut).trim();
  if (!rest.startsWith('【行程流水账】')) {
    rest = `【行程流水账】\n\n${rest}`;
  }
  const itinerary = rest.replace(/^【行程流水账】\s*/, '');
  const originalIntro = stripClarifyIntroArtifacts(content.slice(0, cut));
  const introBody = introNeedsRewrite(originalIntro)
    ? lockIntroFacts(lock)
    : originalIntro;
  const withFacts = introBody.includes(`${lock.days}天都在${lock.city}`)
    ? introBody
    : `${lockIntroFacts(lock)}${introBody ? introBody : ''}`;
  const withPois = ensureIntroMentionsItineraryPois(withFacts, itinerary);
  return `【方案简介】\n\n${withPois}\n\n${rest}`;
}

function cleanClarifyLodgingLabel(raw: string): string {
  return raw
    .replace(/周边|一带|附近|片区/g, '')
    .replace(/[。．]+$/g, '')
    .trim()
    .slice(0, 28);
}

function extractDay1Lodging(content: string): string | null {
  const day1 = content.split(/第\s*[2-9二三四五六七八九十两]+\s*天/)[0] ?? content;
  const quoted =
    day1.match(/首晚住宿选在「([^」]{2,40})」/)?.[1] ||
    day1.match(/住宿选在「([^」]{2,40})」/)?.[1] ||
    day1.match(/住宿（[^）]{0,12}西湖区([^）]{2,24})）/)?.[1];
  if (quoted) {
    return cleanClarifyLodgingLabel(quoted);
  }
  const tonight = day1.match(/今晚住宿片区[：:]\s*([^\n。]{2,40})/)?.[1];
  if (tonight && !/返程|回家|无需住宿/.test(tonight)) {
    const short = tonight.split(/[（(，,]/)[0]?.trim() ?? tonight;
    return cleanClarifyLodgingLabel(short);
  }
  return null;
}

/** 后面几天跟第1天同一住宿；出门句补市内衔接，避免开篇写到火车站被判瞬移 */
export function alignClarifyMorningLodging(content: string): string {
  const mornings = [...content.matchAll(/从昨晚住宿片区[「"]([^」"]+)[」"]出发/g)];
  const canonical = extractDay1Lodging(content) || cleanClarifyLodgingLabel(mornings[0]?.[1] ?? '');
  if (!canonical) {
    return content;
  }

  let next = content.replace(
    /从昨晚住宿片区[「"]([^」"]+)[」"]出发/g,
    `从昨晚住宿片区「${canonical}」出发`,
  );
  next = next.replace(/今晚住宿片区[：:]\s*([^\n]+)/g, (full, place: string) => {
    if (/返程|回家|无需住宿/.test(place)) {
      return full;
    }
    return `今晚住宿片区：${canonical}`;
  });
  next = next.replace(
    /从昨晚住宿片区「[^」]+」出发(?!，先市内衔接)/g,
    (match) => `${match}，先市内衔接`,
  );
  return next;
}

function buildInCityDayStub(dayNo: number, lock: ClarifyLockedPlanFields): string {
  const start =
    dayNo <= 1
      ? `抵达${lock.city}后安顿住宿，`
      : '从昨晚住宿出发，';
  return `第${dayNo}天 · ${lock.city}（${lock.preference}）\n${start}全天留在${lock.city}市内按「${lock.preference}」慢慢逛，中午找一家本地小馆，下午留空档闲逛，当晚仍回同一住宿，不跨市。\n`;
}

function buildClarifyItinerary(lock: ClarifyLockedPlanFields): string {
  return Array.from({ length: lock.days }, (_, index) =>
    buildInCityDayStub(index + 1, lock),
  ).join('\n');
}

function isUsableClarifySection(body: string, minLength: number): boolean {
  const trimmed = body.trim();
  if (trimmed.length < minLength || !/[。！？]/.test(trimmed)) {
    return false;
  }
  const lastLine = trimmed.split('\n').pop()?.trim() ?? '';
  return /[。！？]$/.test(lastLine);
}

function collectPresentDays(content: string): Set<number> {
  const days = new Set<number>();
  for (const match of content.matchAll(/第\s*([0-9]+|[一二三四五六七八九十两]+)\s*天/g)) {
    const value = parseDayToken(match[1] ?? '');
    if (value != null) {
      days.add(value);
    }
  }
  return days;
}

/** 补齐四段与锁定天数，避免半篇简介被结果页当成「还在生成」 */
export function ensureClarifyPlanComplete(
  content: string,
  lock: ClarifyLockedPlanFields,
): string {
  const sections = parsePlanSections(content);
  let itinerary = sections.itinerary.trim();
  const present = collectPresentDays(itinerary);
  const missingStubs: string[] = [];
  for (let dayNo = 1; dayNo <= lock.days; dayNo += 1) {
    if (!present.has(dayNo)) {
      missingStubs.push(buildInCityDayStub(dayNo, lock));
    }
  }
  if (!itinerary) {
    itinerary = buildClarifyItinerary(lock);
  } else if (
    missingStubs.length > 0 &&
    itinerary.length < 80 &&
    !/栈桥|春和楼|教堂|啤酒|海鲜/.test(itinerary)
  ) {
    itinerary = `${itinerary}\n\n${missingStubs.join('\n')}`.trim();
  } else if (!present.has(1) && itinerary.trim()) {
    itinerary = `第1天\n${itinerary}`;
  }
  if (!isUsableClarifySection(itinerary, 24)) {
    itinerary = `${itinerary}\n\n${buildClarifyItinerary(lock)}`.trim();
  }

  const intro = ensureIntroMentionsItineraryPois(
    sections.intro.trim() || lockIntroFacts(lock),
    itinerary,
  );

  return serializePlanSections({
    intro,
    itinerary,
    snailTips: '',
    pitfalls: '',
    isLegacy: false,
  });
}

export function rewriteOffCityDays(content: string, lock: ClarifyLockedPlanFields): string {
  const daySplit = /(?=(?:^|\n)\s*(?:#{1,4}\s*)?第\s*[0-9一二三四五六七八九十两]+\s*天)/;
  const parts = content.split(daySplit);
  return parts
    .map((part) => {
      const heading = part.match(/第\s*([0-9]+|[一二三四五六七八九十两]+)\s*天/);
      if (!heading) {
        return part;
      }
      const dayNo = parseDayToken(heading[1] ?? '');
      if (dayNo == null) {
        return part;
      }
      if (OFF_CITY_BODY.test(part) || /探店站|杭州\s*→\s*探店|大交通[^。\n]{0,16}探店/.test(part)) {
        return `\n${buildInCityDayStub(dayNo, lock)}`;
      }
      return part;
    })
    .join('');
}

/** 锁定行程出门检：先裁漂、对齐住宿，再按正文景点写简介，最后补齐四段 */
export function finalizeClarifyLockedPlan(
  content: string,
  lock: ClarifyLockedPlanFields,
): string {
  const cleaned = scrubPriorQualityArtifacts(content);
  const clipped = clipClarifyPlanToLockedDays(cleaned, lock.days);
  const inCity = rewriteOffCityDays(clipped, lock);
  const scrubbed = scrubClarifyPlanDrift(inCity, lock);
  const lodged = alignClarifyMorningLodging(scrubbed);
  const withIntro = replaceClarifyIntro(lodged, lock);
  return polishClarifyPlanForDisplay(ensureClarifyPlanComplete(withIntro, lock));
}
