import { scrubPlanDisplayMarkup } from '@/lib/home/scrubPlanDisplayMarkup';

/** 方案浮层展示 / 复制用（不改动 src/lib/plan 流水线） */

export type PlanSummaryCards = {
  totalBudgetYuan: number | null;
  userBudgetYuan: number | null;
  surplusYuan: number | null;
  mustEat: string[];
  mustVisit: string[];
};

export type BudgetLineItem = {
  label: string;
  amountYuan: number | null;
};

export type ExtractedBudgetBlock = {
  totalYuan: number | null;
  items: BudgetLineItem[];
  /** 去掉花费表后的氛围短文 */
  proseMarkdown: string;
};

export type SoftSceneId = 'morning' | 'afternoon' | 'evening' | 'other';

export type SoftSpotCard = {
  title: string;
  feel: string;
  transportShort: string;
  transportDetail: string;
  tip: string;
  /** 一景点一配图（展示层解析） */
  imageSrc?: string;
  imageAlt?: string;
};

export type SoftSceneBlock = {
  id: SoftSceneId;
  label: string;
  marker: string;
  spots: SoftSpotCard[];
};

export type SoftDayBlock = {
  dayLabel: string;
  scenes: SoftSceneBlock[];
  /** 无法拆出场景时的降级 Markdown */
  fallbackMarkdown?: string;
};

export type SoftItineraryView = {
  days: SoftDayBlock[];
  /** 整段无法结构化时的降级 */
  fallbackMarkdown?: string;
};

const SCENE_META: Record<
  SoftSceneId,
  { label: string; marker: string; patterns: RegExp[] }
> = {
  morning: {
    label: '晨起',
    marker: '🌿',
    patterns: [/清晨/, /早晨/, /早上/, /上午/, /午前/, /晨起/],
  },
  afternoon: {
    label: '午后',
    marker: '🐌',
    patterns: [/午后/, /中午/, /下午/, /晌午/],
  },
  evening: {
    label: '傍晚',
    marker: '🌆',
    patterns: [/傍晚/, /黄昏/, /晚上/, /夜间/, /夜晚/, /夜市/, /日落/],
  },
  other: {
    label: '漫步',
    marker: '▫️',
    patterns: [],
  },
};

const TRANSPORT_DETAIL_RE =
  /(?:乘坐|搭乘|换乘|车次|班次|门到门|耗时|约?\d+\s*分钟|公交|地铁|高铁|动车|航班|G\d{1,4}|D\d{1,4}|K\d{1,4}|出发站|到达站)/;

function extractYuanAmounts(text: string): number[] {
  const amounts: number[] = [];
  const re = /¥\s*(\d{2,5})/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const n = Number(match[1]);
    if (Number.isFinite(n)) {
      amounts.push(n);
    }
  }
  return amounts;
}

/** 展示层文案：穷游 → 漫行 / 慢行 */
export function softenPlanDisplayCopy(text: string): string {
  if (!text) return text;
  return scrubPlanDisplayMarkup(
    text
      .replace(/轻穷游/g, '轻漫行')
      .replace(/穷游攻略/g, '漫行攻略')
      .replace(/穷游/g, '漫行'),
  );
}

export function extractUserBudgetYuan(query: string | null | undefined): number | null {
  if (!query?.trim()) {
    return null;
  }
  const match =
    query.match(/(?:预算|人均|花)\s*(\d{3,5})\s*元?/) ||
    query.match(/(\d{3,5})\s*元/);
  if (!match?.[1]) {
    return null;
  }
  const n = Number(match[1]);
  return Number.isFinite(n) && n >= 100 ? n : null;
}

export function extractTotalBudgetYuan(intro: string): number | null {
  const totalRow =
    intro.match(/\*\*总计\*\*\s*\|\s*\*?\*?¥?\s*(\d{2,5})/) ||
    intro.match(/总计[^\n|]*?[|：:]\s*\*?\*?¥?\s*(\d{2,5})/) ||
    intro.match(/总计[^\d]{0,12}¥?\s*(\d{2,5})/);
  if (totalRow?.[1]) {
    return Number(totalRow[1]);
  }
  const amounts = extractYuanAmounts(intro);
  return amounts.length > 0 ? Math.max(...amounts) : null;
}

function uniqKeepOrder(items: string[], limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const key = item.trim();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(key);
    if (out.length >= limit) {
      break;
    }
  }
  return out;
}

function stripCell(raw: string): string {
  return raw
    .replace(/\*\*/g, '')
    .replace(/\|/g, '')
    .replace(/¥/g, '')
    .trim();
}

function parseAmountCell(raw: string): number | null {
  const cleaned = stripCell(raw);
  const match = cleaned.match(/(\d{2,5})/);
  if (!match?.[1]) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

/** 从简介抽取花费表，并留下氛围短文（去掉大表格） */
export function extractBudgetFromIntro(intro: string): ExtractedBudgetBlock {
  const softened = softenPlanDisplayCopy(intro);
  const lines = softened.replace(/\r\n/g, '\n').split('\n');
  const items: BudgetLineItem[] = [];
  let totalYuan: number | null = null;
  const proseLines: string[] = [];
  let inTable = false;
  let sawHeader = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const isSep = /^\|?\s*:?-{3,}/.test(trimmed) && trimmed.includes('-');
    const isRow = trimmed.startsWith('|') && trimmed.includes('|');

    if (isRow || isSep) {
      inTable = true;
      if (isSep) continue;
      const cells = trimmed
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length < 2) continue;

      const label = stripCell(cells[0] ?? '');
      const amountRaw = cells[1] ?? '';
      if (!sawHeader) {
        sawHeader = true;
        if (/项目|分项|类别|费用|金额/.test(label) || /金额|费用|元/.test(stripCell(amountRaw))) {
          continue;
        }
      }

      if (/总计|合计|一共|总额/.test(label)) {
        totalYuan = parseAmountCell(amountRaw) ?? totalYuan;
        continue;
      }

      const amountYuan = parseAmountCell(amountRaw);
      if (label) {
        items.push({ label, amountYuan });
      }
      continue;
    }

    if (inTable && trimmed === '') {
      inTable = false;
      continue;
    }
    if (inTable && !isRow) {
      inTable = false;
    }
    proseLines.push(line);
  }

  if (totalYuan == null) {
    totalYuan = extractTotalBudgetYuan(softened);
  }

  let proseMarkdown = proseLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  // 控制氛围开篇密度：按句号切段，过长段落再拆
  proseMarkdown = tightenProseParagraphs(proseMarkdown);

  return { totalYuan, items, proseMarkdown };
}

function tightenProseParagraphs(text: string): string {
  if (!text) return text;
  const blocks = text.split(/\n{2,}/);
  const out: string[] = [];
  for (const block of blocks) {
    const plain = block.replace(/\n/g, ' ').trim();
    if (!plain) continue;
    const sentences = plain.split(/(?<=[。！？])/).map((s) => s.trim()).filter(Boolean);
    if (sentences.length <= 3) {
      out.push(sentences.join(''));
      continue;
    }
    for (let i = 0; i < sentences.length; i += 2) {
      out.push(sentences.slice(i, i + 2).join(''));
    }
  }
  return out.slice(0, 4).join('\n\n');
}

/** 深圳攻略开篇问答卡标题（固定文案，禁止改动） */
export const SHENZHEN_INTRO_QA_CARDS = [
  {
    id: 'spots' as const,
    title: '润色后的方案简介中添加一些景点推荐',
  },
  {
    id: 'foods' as const,
    title: '润色后的方案简介中添加一些美食推荐',
  },
  {
    id: 'transit' as const,
    title: '润色后的方案简介中添加一些交通指南',
  },
] as const;

export type ShenzhenIntroEnrichment = {
  isShenzhen: boolean;
  /** 氛围短句（不含三卡） */
  leadProse: string;
  cards: Array<{
    id: (typeof SHENZHEN_INTRO_QA_CARDS)[number]['id'];
    title: string;
    body: string;
  }>;
};

const SHENZHEN_SPOT_CANDIDATES = [
  '南山科技园',
  '海岸城商圈',
  '海岸城',
  '华强北数码市井',
  '华强北',
  '深圳湾滨海栈道',
  '深圳湾公园',
  '深圳湾',
  '滨海栈道',
];

const SHENZHEN_FOOD_CANDIDATES = [
  '花胶鸡煲',
  '花胶鸡',
  '粤式简餐',
  '粤式',
  '西北面食',
  '潮汕牛肉',
  '肠粉',
  '早茶',
  '海鲜',
];

function collectMatches(blob: string, candidates: string[], limit: number): string[] {
  const hits: string[] = [];
  for (const name of candidates) {
    if (blob.includes(name) && !hits.some((h) => h.includes(name) || name.includes(h))) {
      hits.push(name);
    }
    if (hits.length >= limit) break;
  }
  return hits;
}

function extractTransitGuide(blob: string): string {
  const sentences = blob
    .split(/(?<=[。！？；])/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => /地铁|公交|乘车码|支付宝|高铁|交通|接驳|刷码/.test(s));
  if (sentences.length > 0) {
    return softenPlanDisplayCopy(sentences.slice(0, 2).join(''));
  }
  return '城内优先地铁出行，支付宝乘车码可刷深圳地铁与公交，通达绝大多数游玩点；住宿尽量选地铁沿线，把时间留给慢逛。';
}

/**
 * 仅深圳攻略：开篇保留松弛短句，并按固定顺序补齐
 * ①景点推荐 ②美食推荐 ③交通指南（三张问答卡标题不可改）
 */
export function enrichShenzhenIntroDisplay(input: {
  proseMarkdown: string;
  intro: string;
  itinerary?: string;
  initialQuery?: string | null;
}): ShenzhenIntroEnrichment {
  const blob = softenPlanDisplayCopy(
    `${input.initialQuery ?? ''}\n${input.intro}\n${input.itinerary ?? ''}\n${input.proseMarkdown}`,
  );
  const isShenzhen = /深圳/.test(blob);
  const leadProse = softenPlanDisplayCopy(input.proseMarkdown).trim();

  if (!isShenzhen) {
    return { isShenzhen: false, leadProse, cards: [] };
  }

  const spots = collectMatches(blob, SHENZHEN_SPOT_CANDIDATES, 4);
  const foods = collectMatches(blob, SHENZHEN_FOOD_CANDIDATES, 4);

  const spotBody =
    spots.length > 0
      ? `建议打卡：${spots.join('、')}。节奏松弛，一日可走南山科技园与海岸城滨海烟火，一日深度逛华强北市井与深圳湾落日海岸线。`
      : '建议打卡华强北数码市井、海岸城商圈、深圳湾滨海栈道与南山科技园；看海湾日落，感受滨海都市气息。';

  const foodBody =
    foods.length > 0
      ? `可以品尝${foods.join('、')}，体验多元的城市味道；把预算多留给地道粤式美食。`
      : '可以品尝花胶鸡煲、粤式简餐、西北面食，体验多元的城市味道；把预算留给地道美食与免费海滨风光。';

  const transitBody = extractTransitGuide(blob);

  return {
    isShenzhen: true,
    leadProse,
    cards: SHENZHEN_INTRO_QA_CARDS.map((card) => ({
      id: card.id,
      title: card.title,
      body:
        card.id === 'spots' ? spotBody : card.id === 'foods' ? foodBody : transitBody,
    })),
  };
}

/** 只认目的地，不认出发城（流水账里的济南西站不能套开篇） */
export function resolvePlanDisplayCity(
  intro: string,
  initialQuery?: string | null,
): string | null {
  const text = `${intro}\n${initialQuery ?? ''}`;
  const locked = text.match(/都在\s*([\u4e00-\u9fa5]{2,8})/)?.[1];
  const going = text.match(/去([\u4e00-\u9fa5]{2,8})玩/)?.[1];
  const confirmed = text.match(/【用户已确认】城市\s*([\u4e00-\u9fa5]{2,8})/)?.[1];
  const raw = (locked || going || confirmed || '').replace(/市$/, '').trim();
  return raw.length >= 2 ? raw : null;
}

/**
 * 首页热门城：开篇只展示模型正文。
 * 禁止按流水账里的出发城套另一座城的景点/美食（济南出发去青岛会误织芙蓉街）。
 */
export function enrichHomeKitIntroDisplay(input: {
  proseMarkdown: string;
  intro: string;
  itinerary?: string;
  initialQuery?: string | null;
}): {
  active: boolean;
  cityName: string | null;
  leadProse: string;
  /** @deprecated 保留字段兼容；现改为空，景食行已织进 leadProse */
  softBlocks: Array<{ id: string; title: string; body: string }>;
} {
  const rawLead = softenPlanDisplayCopy(input.proseMarkdown || input.intro).trim();
  const cityName = resolvePlanDisplayCity(input.intro, input.initialQuery);
  return {
    active: false,
    cityName,
    leadProse: rawLead,
    softBlocks: [],
  };
}

/** 从简介 / 流水账 / 蜗牛提示里抽必吃、必打卡（启发式） */
export function buildPlanSummaryCards(input: {
  intro: string;
  itinerary: string;
  snailTips: string;
  initialQuery?: string | null;
}): PlanSummaryCards {
  const intro = softenPlanDisplayCopy(input.intro);
  const itinerary = softenPlanDisplayCopy(input.itinerary);
  const snailTips = softenPlanDisplayCopy(input.snailTips);
  const budget = extractBudgetFromIntro(intro);
  const totalBudgetYuan = budget.totalYuan ?? extractTotalBudgetYuan(intro);
  const userBudgetYuan = extractUserBudgetYuan(input.initialQuery);
  const surplusYuan =
    totalBudgetYuan != null && userBudgetYuan != null
      ? userBudgetYuan - totalBudgetYuan
      : null;

  const blob = `${intro}\n${itinerary}\n${snailTips}`;
  const mustEat = uniqKeepOrder(
    [
      ...(blob.match(/[\u4e00-\u9fff]{2,12}(?:包子|煎饼|锅巴菜|嘎巴菜|麻花|海鲜|饺子|面|烧烤|小吃|馆|餐厅)/g) ??
        []),
      ...(snailTips.match(/吃[^。！\n]{2,16}/g) ?? []).map((s) => s.replace(/^吃/, '')),
    ],
    4,
  );

  const mustVisit = uniqKeepOrder(
    [
      ...(blob.match(
        /古文化街|鼓楼|天津之眼|瓷房子|五大道|意大利风情区|海河|意式风情区|解放桥|民园广场|西开教堂/g,
      ) ?? []),
      ...(blob.match(/【?打卡】?[：:]?\s*([\u4e00-\u9fff·]{2,12})/g) ?? []).map((s) =>
        s.replace(/^.*?[：:]/, ''),
      ),
    ],
    5,
  );

  return {
    totalBudgetYuan,
    userBudgetYuan,
    surplusYuan,
    mustEat,
    mustVisit,
  };
}

function detectScene(text: string): SoftSceneId {
  for (const id of ['morning', 'afternoon', 'evening'] as const) {
    if (SCENE_META[id].patterns.some((re) => re.test(text))) {
      return id;
    }
  }
  return 'other';
}

function splitTransport(text: string): { short: string; detail: string } {
  const sentences = text
    .split(/(?<=[。！？；\n])/)
    .map((s) => s.trim())
    .filter(Boolean);
  const detailParts: string[] = [];
  const shortParts: string[] = [];

  for (const sentence of sentences) {
    if (TRANSPORT_DETAIL_RE.test(sentence) && sentence.length > 12) {
      detailParts.push(sentence);
    } else {
      shortParts.push(sentence);
    }
  }

  let short = shortParts.join('');
  const detail = detailParts.join('');

  if (!short && detail) {
    if (/地铁/.test(detail)) {
      short = '推荐地铁出行，不堵车更省心';
    } else if (/公交|巴士/.test(detail)) {
      short = '公交接驳方便，慢行更从容';
    } else if (/步行|走路|漫步/.test(detail)) {
      short = '适合步行慢逛，沿途风景不错';
    } else if (/高铁|动车|火车/.test(detail)) {
      short = '高铁直达更省心，到站再慢慢接驳';
    } else {
      short = '按推荐方案出行即可，细节可展开查看';
    }
  }

  return { short: short || '按推荐方案出行即可', detail };
}

export function formatPlanDayModuleTitle(index: number): string {
  return `D${index + 1}`;
}

function dayNumberFromLabel(raw: string): number | null {
  const match = raw.match(/(?:Day\s*|D\s*|第\s*)(\d+)/i);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

function toDayModuleTitle(raw: string | undefined, index: number): string {
  const n = raw ? dayNumberFromLabel(raw) : null;
  return formatPlanDayModuleTitle(n != null ? n - 1 : index);
}

function isAbstractSpotTitle(title: string): boolean {
  const compact = title.replace(/\s+/g, '').trim();
  if (!compact) return true;
  return /^(?:漫行小站\d*|今日漫行|所选地点|第\d+天|Day\d+|D\d+)$/i.test(compact);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function looksLikePlayHighlight(text: string): boolean {
  return /必体验|时间充裕|值得|慢慢|适合|可以|推荐|闲逛|避开|停留|分钟|小时|看馆|拍照|落日|街巷|烟火/.test(
    text,
  );
}

function looksLikeBarePlaceList(text: string): boolean {
  if (looksLikePlayHighlight(text)) return false;
  const parts = text
    .split(/[、，,；;／/|]/)
    .map((part) => part.replace(/[。！？\s]/g, '').trim())
    .filter(Boolean);
  if (parts.length < 2) return false;
  return parts.every(
    (part) =>
      part.length >= 2 &&
      part.length <= 14 &&
      !/地铁|公交|分钟|小时|推荐|适合|慢慢|值得|闲逛|可以|必体验|避开/.test(part),
  );
}

function looksLikeBarePlaceName(text: string): boolean {
  if (looksLikePlayHighlight(text)) return false;
  const compact = text.replace(/[。！？\s·：:]/g, '');
  if (!compact) return true;
  return compact.length <= 12 && !/[，、]/.test(text);
}

/** 展示层：地名后必须跟一句游玩亮点，禁止只罗列地点 */
export function ensureSpotPlayHighlight(placeName: string, raw: string): string {
  const title = placeName.replace(/\s+/g, '').trim();
  const text = softenPlanDisplayCopy(raw).trim();
  const withoutName = title
    ? text.replace(new RegExp(`^${escapeRegExp(title)}[：:\\s·、，-]*`), '').trim()
    : text;

  if (looksLikeBarePlaceList(withoutName) || looksLikeBarePlaceList(text)) {
    const place =
      title && !isAbstractSpotTitle(title)
        ? title
        : withoutName.split(/[、，]/)[0] || '这一站';
    return `${place}值得慢慢逛，把时间留给眼前这一处，不必赶场。`;
  }

  if (!withoutName || looksLikeBarePlaceName(withoutName)) {
    const place = title && !isAbstractSpotTitle(title) ? title : '这一站';
    return `${place}值得慢慢逛，把时间留给眼前这一处。`;
  }

  return withoutName;
}

function inferSpotTitle(chunk: string, fallbackTitle: string): string {
  const heading =
    chunk.match(/^#{1,4}\s*(.+)$/m)?.[1] ||
    chunk.match(/^\*\*(.+?)\*\*/)?.[1] ||
    chunk.match(/^[（(]?[\d一二三四五六七八九十]+[）).、]\s*(.+)/)?.[1];
  if (heading) {
    const cleaned = softenPlanDisplayCopy(heading.replace(/[：:].*$/, '').trim());
    if (cleaned && !isAbstractSpotTitle(cleaned)) return cleaned;
  }
  const named = chunk.match(
    /(深圳博物馆|深圳湾滨海栈道|深圳湾公园|深圳湾|华强北|海岸城|南山科技园|光明农场|光明招待所|虹桥公园|滨海栈道)/,
  );
  if (named?.[1]) return named[1];
  const place = chunk.match(
    /([\u4e00-\u9fff]{2,12}(?:公园|寺|庙|街|巷|岛|湖|山|塔|广场|博物馆|老街|夜市|码头|海滩|古城|景区|农场|招待所))/,
  );
  if (place?.[1]) return place[1];
  return fallbackTitle;
}

function chunkToSpot(chunk: string, fallbackTitle: string): SoftSpotCard {
  const softened = softenPlanDisplayCopy(chunk.trim());
  const tipMatch = softened.match(/(?:提醒|注意|避坑|建议)[：:]\s*([^\n。]+[。]?)/);
  const tip = tipMatch?.[1]?.trim() ?? '';
  const withoutTip = tipMatch ? softened.replace(tipMatch[0], '').trim() : softened;
  const { short, detail } = splitTransport(withoutTip);

  const feelSentences = withoutTip
    .split(/(?<=[。！？\n])/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !(TRANSPORT_DETAIL_RE.test(s) && s.length > 12));
  let feel = feelSentences.join('').trim();
  if (!feel) {
    feel = '慢慢逛就好，把时间留给眼前的风景。';
  }

  const title = inferSpotTitle(softened, fallbackTitle);
  return {
    title,
    feel: ensureSpotPlayHighlight(title, feel),
    transportShort: short,
    transportDetail: detail,
    tip: softenPlanDisplayCopy(tip),
  };
}

function parseDayBodyToScenes(body: string, fallbackTitle: string): SoftSceneBlock[] {
  const softened = softenPlanDisplayCopy(body).trim();
  if (!softened) return [];

  // 按场景关键词或空行切块
  const rawChunks = softened
    .split(/\n{2,}|(?=(?:清晨|早晨|早上|上午|午后|中午|下午|傍晚|晚上|夜间|夜晚))/)
    .map((c) => c.trim())
    .filter(Boolean);

  const sceneMap = new Map<SoftSceneId, SoftSpotCard[]>();
  const order: SoftSceneId[] = [];

  rawChunks.forEach((chunk) => {
    const sceneId = detectScene(chunk);
    if (!sceneMap.has(sceneId)) {
      sceneMap.set(sceneId, []);
      order.push(sceneId);
    }
    sceneMap.get(sceneId)!.push(chunkToSpot(chunk, fallbackTitle));
  });

  return order.map((id) => ({
    id,
    label: SCENE_META[id].label,
    marker: SCENE_META[id].marker,
    spots: sceneMap.get(id) ?? [],
  }));
}

/** 行程展示层：按日 + 晨起/午后/傍晚拆分；失败则降级 Markdown */
export function buildSoftItineraryView(itinerary: string): SoftItineraryView {
  const softened = softenPlanDisplayCopy(itinerary).trim();
  if (!softened) {
    return { days: [] };
  }

  const daySplits = softened.split(/(?=^(?:#{1,4}\s*)?(?:Day\s*|第)\s*\d+\s*天?)/im);
  const parts = daySplits.map((p) => p.trim()).filter(Boolean);

  if (parts.length === 0) {
    return { days: [], fallbackMarkdown: softened };
  }

  const looksLikeDays = parts.some((p) => /^(?:#{1,4}\s*)?(?:Day\s*|第)\s*\d+/i.test(p));
  if (!looksLikeDays && parts.length === 1) {
    const scenes = parseDayBodyToScenes(parts[0]!, formatPlanDayModuleTitle(0));
    if (scenes.length === 0 || (scenes.length === 1 && scenes[0]!.spots.length === 0)) {
      return { days: [], fallbackMarkdown: softened };
    }
    return {
      days: [{ dayLabel: formatPlanDayModuleTitle(0), scenes }],
    };
  }

  const days: SoftDayBlock[] = parts.map((part, index) => {
    const dayMatch = part.match(/^(?:#{1,4}\s*)?((?:Day\s*\d+|第\s*\d+\s*天)[^\n]*)/i);
    const dayLabel = toDayModuleTitle(dayMatch?.[1], index);
    const body = dayMatch ? part.slice(dayMatch[0].length).trim() : part;
    const scenes = parseDayBodyToScenes(body || part, dayLabel);
    if (scenes.length === 0) {
      return { dayLabel, scenes: [], fallbackMarkdown: softenPlanDisplayCopy(part) };
    }
    return { dayLabel, scenes };
  });

  return { days };
}

/** 贴士拆成单行短句 */
export function splitTipLines(text: string): string[] {
  const softened = softenPlanDisplayCopy(text).trim();
  if (!softened) return [];

  const lines = softened
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .flatMap((line) => {
      const cleaned = line
        .replace(/^[-*•▫️🌿🐌🌆]\s*/, '')
        .replace(/^\d+[.、．)]\s*/, '')
        .replace(/^[（(]?\d+[）)]\s*/, '')
        .trim();
      if (!cleaned) return [];
      return cleaned.split(/(?<=[。！？])/).map((s) => s.trim()).filter(Boolean);
    })
    .map((s) => s.replace(/^[-*•]\s*/, '').trim())
    .filter((s) => s.length > 1);

  return uniqKeepOrder(lines, 24);
}

/** 复制到剪贴板：去掉多余 Markdown，预算表保留管道，禁止改成圆点伪表 */
export function toCleanPlanCopyText(markdown: string): string {
  const softened = softenPlanDisplayCopy(markdown).replace(/\r\n/g, '\n');
  const next = softened
    .split('\n')
    .map((line) => {
      if (/^\s*\|/.test(line)) {
        return line.trim();
      }
      return line
        .replace(/```[\s\S]*?```/g, '')
        .replace(/!\[[^\]]*]\([^)]*\)/g, '')
        .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
        .replace(/^#{1,6}\s+/, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*\n]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/^>\s?/, '');
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return next;
}
