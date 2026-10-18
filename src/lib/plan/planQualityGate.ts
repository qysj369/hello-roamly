import {
  detectDestinationCityHijack,
  detectStyleAsPlace,
  scrubStyleAsPlacePhrases,
} from '@/lib/plan/destinationDriftGuard';
import {
  enforcePlanItineraryAccuracy,
  resolvePlanLodgingBase,
} from '@/lib/plan/planDayConstraint';
import { parsePlanSections, serializePlanSections } from '@/lib/plan/parsePlanSections';

export type PlanQualityIssueCode =
  | 'lodging_jump'
  | 'fake_long_haul'
  | 'sticky_day'
  | 'teleport'
  | 'weak_destination'
  | 'intro_mismatch'
  | 'day_repeat'
  | 'prompt_leak'
  | 'style_as_place'
  | 'dest_hijack'
  | 'lodging_at_origin';

export type PlanQualityIssue = {
  code: PlanQualityIssueCode;
  message: string;
};

const MAJOR_STATION =
  /(?:杭州|南京|上海|北京|成都|苏州|青岛|济南|西安|武汉|重庆|厦门|福州|昆明|广州|深圳)(?:东|西|南|北)?站|城站/;

/**
 * 主玩法锚点（简介承诺 / 换题检测）。
 * 故意不含「街/广场/慢生活」等附属地名，避免把公交站、街区误报成换题。
 */
const THEME_POI_TOKEN =
  /(中国湿地博物馆|自然博物馆|湿地博物馆|良渚古城遗址公园|良渚博物院|良渚文化村|少年儿童公园|少儿公园|儿童公园|杭州动物园|动物园|西溪湿地|龙坞茶村|茶村|九溪|西湖游船|游船|西湖|灵隐寺|雷峰塔|宋城|熊猫基地|海洋馆|欢乐谷|迪士尼|博物院|博物馆|遗址公园|文化村|古城)/g;

/** 相邻日「整日复刻」只盯高冲突主战场 */
const DAY_REPEAT_FOCUS =
  /(?:动物园|少儿公园|儿童公园|迪士尼|海洋馆|欢乐谷|宋城|熊猫基地)/;

const NOISE_POI = /地铁站|高铁站|火车站|机场|公交站|西广场|东广场|南广场|北广场/;

function normalizePoi(raw: string): string {
  return raw
    .replace(/^(?:杭州|济南|成都|苏州|青岛|上海|北京|南京|西安|武汉|广州|深圳|厦门)/, '')
    .replace(/周边|一带|附近|片区/g, '')
    .trim();
}

export function extractThemePois(text: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  for (const match of text.matchAll(THEME_POI_TOKEN)) {
    const token = normalizePoi(match[1] || match[0] || '');
    if (!token || token.length < 2 || NOISE_POI.test(token)) {
      continue;
    }
    // 泛词单独出现时跳过（「游船」「古城」「博物馆」需结合上下文，已由更长短语优先匹配）
    if (/^(游船|古城|博物馆|博物院|茶村|文化村)$/.test(token)) {
      // 仅当正文里没有更具体命中时，仍保留作弱信号
      if (![...seen].some((s) => s.includes(token) || token.includes(s))) {
        // keep weak token
      }
    }
    if (seen.has(token)) {
      continue;
    }
    seen.add(token);
    found.push(token);
  }
  return found;
}

/** @deprecated 兼容旧测试名 */
export function extractPlanPois(text: string): string[] {
  return extractThemePois(text);
}

function introProseOnly(intro: string): string {
  const cleaned = intro
    .replace(/>\s*🐌[\s\S]*?重新生成。?/g, '')
    .replace(/【蜗牛质检】[\s\S]*$/g, '');
  const cut = cleaned.search(/\n\s*\||\n\s*[-*]?\s*项目\s*[·|｜]/);
  return (cut >= 0 ? cleaned.slice(0, cut) : cleaned).trim();
}

function poiFamilyMatch(a: string, b: string): boolean {
  if (!a || !b) {
    return false;
  }
  if (a.includes(b) || b.includes(a)) {
    return true;
  }
  // 自然博物馆 ↔ 湿地博物馆 / 中国湿地博物馆
  if (/博物馆|博物院/.test(a) && /博物馆|博物院/.test(b)) {
    return true;
  }
  if (/西溪/.test(a) && /西溪/.test(b)) {
    return true;
  }
  if (/良渚/.test(a) && /良渚/.test(b)) {
    return true;
  }
  if (/动物园/.test(a) && /动物园/.test(b)) {
    return true;
  }
  if (/少儿公园|儿童公园/.test(a) && /少儿公园|儿童公园/.test(b)) {
    return true;
  }
  const core = a.slice(0, Math.min(2, a.length));
  if (core.length >= 2 && b.includes(core) && !/^(公园|景区|湿地)$/.test(core)) {
    return true;
  }
  return false;
}

function poiAppearsIn(haystack: string, poi: string): boolean {
  if (!poi) {
    return false;
  }
  if (haystack.includes(poi)) {
    return true;
  }
  if (/博物馆|博物院/.test(poi) && /博物馆|博物院/.test(haystack)) {
    return true;
  }
  const core = poi.replace(/中国|杭州|自然|湿地/g, '').slice(0, 2);
  if (core.length >= 2 && haystack.includes(core) && !/^(公园|景区)$/.test(core)) {
    return true;
  }
  return false;
}

/** 简介点名的主景点若流水账几乎未写 → 换题 */
export function detectIntroItineraryMismatch(
  intro: string,
  itinerary: string,
): { missing: string[]; hijacked: string[] } {
  const introPois = extractThemePois(introProseOnly(intro));
  const bodyPois = extractThemePois(itinerary);
  const bodyBlob = itinerary;

  const missing = introPois.filter(
    (poi) =>
      !poiAppearsIn(bodyBlob, poi) &&
      !bodyPois.some((bp) => poiFamilyMatch(poi, bp)),
  );

  // 仅把「高冲突主战场」算作换题（动物园等），忽略街区附属名
  const hijacked = bodyPois.filter((poi) => {
    if (!DAY_REPEAT_FOCUS.test(poi) && !/良渚|茶村|九溪|游船|西湖|宋城|灵隐/.test(poi)) {
      // 西溪系默认是基址玩法，不算 hijack
      if (/西溪|湿地博物馆|博物馆/.test(poi)) {
        return false;
      }
    }
    if (introPois.some((ip) => poiFamilyMatch(poi, ip))) {
      return false;
    }
    // 必须是明显主战场：出现 ≥2 次，或动物园类
    const hits = bodyBlob.split(poi).length - 1;
    const strong = DAY_REPEAT_FOCUS.test(poi);
    return strong ? hits >= 1 : hits >= 2;
  });

  return { missing, hijacked };
}

/** 相邻两天主战场高度重合（整日复刻动物园等）；只看 Markdown 天标题，避免简介散文误拆 */
export function detectRepeatedDayFocus(itinerary: string): string | null {
  const dayBlocks = itinerary.split(
    /(?=(?:^|\n)#{1,4}\s*第\s*[0-9一二三四五六七八九十两]+\s*天)/,
  );
  const dayFoci = dayBlocks
    .map((block) => {
      if (!/#{1,4}\s*第\s*[0-9一二三四五六七八九十两]+\s*天/.test(block)) {
        return [];
      }
      return extractThemePois(block).filter((p) => DAY_REPEAT_FOCUS.test(p));
    })
    .filter((pois) => pois.length > 0);

  for (let i = 0; i < dayFoci.length - 1; i++) {
    const a = dayFoci[i] || [];
    const b = dayFoci[i + 1] || [];
    const overlap = b.filter((poi) => a.some((x) => poiFamilyMatch(poi, x)));
    if (overlap.length >= 1) {
      return overlap.slice(0, 3).join('、');
    }
  }
  return null;
}

const ORIGIN_DISTRICT_ONLY =
  /^(历下|历城|市中|槐荫|天桥|章丘|长清|高新|市北|市南|李沧|崂山|黄岛|城阳)/;

const MAJOR_DEST_CITIES = [
  '杭州',
  '苏州',
  '成都',
  '青岛',
  '南京',
  '上海',
  '北京',
  '西安',
  '厦门',
  '广州',
  '深圳',
  '武汉',
  '重庆',
  '福州',
  '昆明',
];

/** 审计用目的地：优先正文锁定句；避免把出发区县（历下）当成目的地 */
export function resolveAuditDestination(locationName: string, content: string): string {
  const locked = content.match(/【目的地锁定】\s*([^\n（(【。]+)/)?.[1]?.trim();
  if (locked && locked.length >= 2 && !ORIGIN_DISTRICT_ONLY.test(locked.replace(/区|县|市/g, ''))) {
    return locked.replace(/市$/, '').trim();
  }

  let dest = locationName.replace(/市$/, '').trim();
  // 全称地址里抽区县
  const district = dest.match(
    /(历下|历城|市中|槐荫|天桥|章丘|长清|市北|市南|李沧|崂山|黄岛|城阳)区?/,
  )?.[1];
  if (district && (ORIGIN_DISTRICT_ONLY.test(district) || dest.includes('区'))) {
    for (const city of MAJOR_DEST_CITIES) {
      if (content.includes(city) && !dest.startsWith(city)) {
        return city;
      }
    }
  }
  if (ORIGIN_DISTRICT_ONLY.test(dest) || (dest.length <= 3 && district)) {
    for (const city of MAJOR_DEST_CITIES) {
      if (content.includes(city)) {
        return city;
      }
    }
  }
  // 过长出发地址：取正文里的主城
  if (dest.length > 8) {
    for (const city of MAJOR_DEST_CITIES) {
      if (content.includes(city)) {
        return city;
      }
    }
  }
  return dest;
}

/** 模型把约束文案抄成主题名时清洗 */
export function scrubPromptLeakPhrases(content: string): string {
  return content
    .replace(/「禁止把慢游」/g, '深度慢游')
    .replace(/禁止把慢游/g, '深度慢游')
    .replace(/「禁止把亲子」/g, '亲子出行')
    .replace(/禁止把亲子/g, '亲子出行')
    .replace(/「禁止把近郊」/g, '近郊慢行')
    .replace(/禁止把近郊/g, '近郊慢行');
}

function originHomeTokens(originName: string): string[] {
  const raw = originName.trim();
  if (!raw) {
    return [];
  }
  const tokens: string[] = [];
  const suffixes = ['花园', '小区', '家园', '公寓', '苑', '府', '里'] as const;
  for (const suffix of suffixes) {
    const idx = raw.lastIndexOf(suffix);
    if (idx < 2) {
      continue;
    }
    // 取后缀前 2–6 字，避免「中林路绿城百合花园」整段过长对不上正文
    for (const take of [6, 4, 3, 2]) {
      if (idx >= take) {
        tokens.push(raw.slice(idx - take, idx + suffix.length));
      }
    }
  }
  const road = raw.match(/([\u4e00-\u9fa5]{2,6}路)/)?.[1];
  if (road) {
    tokens.push(road);
  }
  return [...new Set(tokens.filter((t) => t.length >= 3))];
}

export type AuditPlanQualityOptions = {
  originName?: string | null;
};

/** 审计攻略正文准度（住宿连续 / 伪大交通 / 瞬移 / 目的地 / 简介一致） */
export function auditPlanQuality(
  content: string,
  locationName: string,
  options?: AuditPlanQualityOptions,
): PlanQualityIssue[] {
  const issues: PlanQualityIssue[] = [];
  const trimmed = content.trim();
  if (!trimmed) {
    return issues;
  }

  const sections = parsePlanSections(trimmed);
  const itinerary = sections.itinerary || trimmed;
  const blob = `${sections.intro}\n${itinerary}`;

  const mornings = [...itinerary.matchAll(/从昨晚住宿片区[「"]([^」"]+)[」"]出发/g)].map(
    (m) => m[1]!.trim(),
  );
  const uniqueMorns = [...new Set(mornings.filter((m) => !/返程|回家|无需/.test(m)))];
  if (uniqueMorns.length > 1) {
    issues.push({
      code: 'lodging_jump',
      message: `住宿片区不一致：${uniqueMorns.join(' / ')}`,
    });
  }

  if (
    (/B\.\s*大交通/.test(itinerary) &&
      /(东站|西站|南站|城站).{0,40}(东站|西站|南站|城站)|同城|市域|城际短驳/.test(itinerary)) ||
    /高铁直达近郊慢行|济南西站→近郊慢行|大交通·[^\n]{0,40}近郊慢行/.test(itinerary)
  ) {
    issues.push({
      code: 'fake_long_haul',
      message: '同城伪大交通或把玩法标签写成高铁终点',
    });
  }

  if (detectStyleAsPlace(blob)) {
    issues.push({
      code: 'style_as_place',
      message: '把「亲子/近郊慢行」等玩法标签写成了站名或城市',
    });
  }

  const hijack = detectDestinationCityHijack(blob, locationName);
  if (hijack) {
    issues.push({
      code: 'dest_hijack',
      message: `锁定目的地被写成「${hijack}」（正文严重偏离）`,
    });
  }

  const originName = options?.originName?.trim() || '';
  if (originName) {
    const tokens = originHomeTokens(originName);
    const lodgingLines = trimmed
      .split('\n')
      .filter((line) => /住宿片区|一基址连住|主住宿/.test(line))
      .join('\n');
    const lodging =
      lodgingLines || resolvePlanLodgingBase(trimmed) || uniqueMorns.join(' ');
    const lodgingAtHome = tokens.some((token) => lodging.includes(token));
    if (lodgingAtHome) {
      issues.push({
        code: 'lodging_at_origin',
        message: '主住宿写成了出发地小区，未在目的地城市选基址',
      });
    }
  }

  if (
    /#\s+#{1,4}\s*第/.test(itinerary) ||
    /#{1,4}\s+\d{1,2}\s+#{1,4}\s*第/.test(itinerary) ||
    /[^\n#]#\s*#{1,3}\s*第/.test(itinerary) ||
    /「[^」\n]{0,40}#+\s*#{0,4}\s*第/.test(itinerary)
  ) {
    issues.push({
      code: 'sticky_day',
      message: '天数标题粘连',
    });
  }

  if (detectTeleportSegments(itinerary)) {
    issues.push({
      code: 'teleport',
      message: '疑似瞬移：从住宿出发后直接从另一城区车站开写',
    });
  }

  const dest = resolveAuditDestination(locationName, `${sections.intro}\n${itinerary}`);
  if (dest && !dest.includes('→') && dest.length >= 2) {
    const blob = `${sections.intro}\n${itinerary}`;
    const destHit = blob.includes(dest) || blob.includes(dest.slice(0, 2));
    if (!destHit) {
      issues.push({
        code: 'weak_destination',
        message: `正文几乎未出现锁定目的地「${dest}」`,
      });
    }
  }

  if (/禁止把慢游|禁止把亲子|禁止把近郊|主题词当成第二座/.test(`${sections.intro}\n${itinerary}`)) {
    issues.push({
      code: 'prompt_leak',
      message: '疑似把生成约束抄成方案主题（如「禁止把慢游」）',
    });
  }

  if (sections.intro.trim() && itinerary.trim()) {
    const { missing, hijacked } = detectIntroItineraryMismatch(sections.intro, itinerary);
    if (missing.length > 0 || hijacked.length > 0) {
      const parts: string[] = [];
      if (missing.length > 0) {
        parts.push(`简介承诺未写入正文：${missing.slice(0, 4).join('、')}`);
      }
      if (hijacked.length > 0) {
        parts.push(`正文主写简介未承诺：${hijacked.slice(0, 4).join('、')}`);
      }
      issues.push({
        code: 'intro_mismatch',
        message: parts.join('；'),
      });
    }
  }

  const repeated = detectRepeatedDayFocus(itinerary);
  if (repeated) {
    issues.push({
      code: 'day_repeat',
      message: `相邻两天主战场高度重复（${repeated}）`,
    });
  }

  return issues;
}

/** 「从住宿X出发」后不久出现无关大城市车站，且中间没有「住宿→」接驳 */
function detectTeleportSegments(itinerary: string): boolean {
  const chunks = itinerary.split(/(?=从昨晚住宿片区[「"][^」"]+[」"]出发)/);
  for (const chunk of chunks) {
    const morning = chunk.match(/从昨晚住宿片区[「"]([^」"]+)[」"]出发/);
    if (!morning?.[1]) {
      continue;
    }
    const base = morning[1];
    const window = chunk.slice(0, 520);
    if (/住宿\s*→|主住宿\s*→|市内衔接|接驳/.test(window)) {
      continue;
    }
    const station = window.match(MAJOR_STATION)?.[0];
    if (!station) {
      continue;
    }
    const baseKey = base.replace(/周边|片区|附近/g, '').slice(0, 2);
    if (baseKey && station.includes(baseKey)) {
      continue;
    }
    if (!station.includes(baseKey) && !base.includes(station.slice(0, 2))) {
      return true;
    }
  }
  return false;
}

/** 去掉旧质检块，保证 finalize 幂等；并修复曾用章节标题污染简介的坏文案 */
export function scrubPriorQualityArtifacts(content: string): string {
  let next = content;

  // 修复：简介里写了「请以【行程流水账】为准」导致章节被拆开
  next = next.replace(
    />\s*🐌\s*\*{0,2}质检提醒\*{0,2}[\s\S]*?请以\s*【行程流水账】\s*为准[^\n]*/g,
    '',
  );
  next = next.replace(
    /请以\s*\n+\s*【行程流水账】\s*\n+\s*为准[，,]?\s*或重新生成。?/g,
    '',
  );
  next = next.replace(/>\s*🐌\s*\*{0,2}质检提醒\*{0,2}[^\n]*/g, '');

  // 流水账开头残留的坏尾巴
  next = next.replace(
    /(【行程流水账】\s*)(?:为准[，,]?\s*或重新生成。?\s*)+/g,
    '$1',
  );

  const sections = parsePlanSections(next);
  let intro = sections.intro
    .replace(/>\s*🐌[\s\S]*?重新生成。?/g, '')
    .replace(/【蜗牛质检】[\s\S]*$/g, '')
    .trim();
  let pitfalls = sections.pitfalls.replace(/(?:\n*【蜗牛质检】[\s\S]*)+$/g, '').trim();
  let itinerary = sections.itinerary
    .replace(/^(?:为准[，,]?\s*或重新生成。?\s*)+/g, '')
    .trim();

  // 偶发双章节标题
  itinerary = itinerary.replace(/^(?:【行程流水账】\s*)+/g, '').trim();

  return serializePlanSections({
    ...sections,
    intro,
    itinerary,
    pitfalls,
  });
}

function appendQualityNote(content: string, issues: PlanQualityIssue[]): string {
  if (issues.length === 0) {
    return content;
  }
  const sections = parsePlanSections(content);
  const note = [
    '【蜗牛质检】本方案已自动校正住宿/标题/同城交通；以下项仍请人工留意（建议重新生成）：',
    ...issues.map((issue) => `- ${issue.message}`),
  ].join('\n');

  let intro = sections.intro.trim();
  const critical = issues.find(
    (i) =>
      i.code === 'dest_hijack' ||
      i.code === 'style_as_place' ||
      i.code === 'lodging_at_origin',
  );
  if (critical && intro && !intro.includes('严重偏差')) {
    intro = `> 🐌 **严重偏差**：${critical.message}。本方案参考价值低，请重新生成。\n\n${intro}`;
  }

  const mismatch = issues.find((i) => i.code === 'intro_mismatch');
  // 禁止在质检文案里写【行程流水账】等章节标记，否则会再次拆坏解析
  if (mismatch && intro && !intro.includes('简介日程与正文不一致')) {
    intro = `${intro}\n\n> 🐌 **质检提醒**：简介日程与正文不一致（${mismatch.message}）。请优先看下方行程正文，或重新生成。`;
  }

  const tips = sections.pitfalls.trim()
    ? `${sections.pitfalls.trim()}\n\n${note}`
    : note;

  return serializePlanSections({
    ...sections,
    intro,
    pitfalls: tips,
  });
}

/**
 * 出门检：先跑结构化校正，再审计；残留问题写入避坑提示，避免静默放出离谱方案。
 */
export function applyPlanQualityGate(
  content: string,
  locationName: string,
  options?: AuditPlanQualityOptions,
): { content: string; issues: PlanQualityIssue[]; repaired: boolean } {
  const before = content.trim();
  const cleaned = scrubPromptLeakPhrases(scrubPriorQualityArtifacts(before));
  const hadStyleAsPlace = detectStyleAsPlace(cleaned);
  const styleScrubbed = scrubStyleAsPlacePhrases(cleaned, locationName);
  const repairedContent = enforcePlanItineraryAccuracy(styleScrubbed);
  const repaired = repairedContent !== before;
  const issues = auditPlanQuality(repairedContent, locationName, options);
  if (hadStyleAsPlace && !issues.some((issue) => issue.code === 'style_as_place')) {
    issues.push({
      code: 'style_as_place',
      message: '把「亲子/近郊慢行」等玩法标签写成了站名或城市',
    });
  }

  const hardCodes: PlanQualityIssueCode[] = [
    'lodging_jump',
    'fake_long_haul',
    'teleport',
    'weak_destination',
    'intro_mismatch',
    'day_repeat',
    'prompt_leak',
    'style_as_place',
    'dest_hijack',
    'lodging_at_origin',
  ];
  // 已自动 scrub 的 prompt_leak 不写进避坑硬伤
  const hardIssues = issues.filter(
    (issue) => hardCodes.includes(issue.code) && issue.code !== 'prompt_leak',
  );
  const withNote =
    hardIssues.length > 0 ? appendQualityNote(repairedContent, hardIssues) : repairedContent;

  return {
    content: withNote,
    issues,
    repaired: repaired || withNote !== repairedContent,
  };
}

/** 供测试/调试：当前主住宿基址 */
export function peekPlanLodgingBase(content: string): string | null {
  return resolvePlanLodgingBase(content);
}
