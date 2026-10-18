import { parseTravelSearchIntent } from '@/lib/map/planQueryBuilder';
import { getMultiStopNames } from '@/lib/plan/mapPlanCompleteness';
import { parsePlanSections, serializePlanSections } from '@/lib/plan/parsePlanSections';

const CN_DIGITS: Record<string, number> = {
  一: 1,
  两: 2,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};

function parseChineseDayNumeral(value: string): number | null {
  if (/^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }
  if (value === '十') {
    return 10;
  }
  if (value.startsWith('十') && value.length === 2) {
    const unit = CN_DIGITS[value[1] ?? ''];
    return unit != null ? 10 + unit : null;
  }
  if (value.endsWith('十') && value.length === 2) {
    const tens = CN_DIGITS[value[0] ?? ''];
    return tens != null ? tens * 10 : null;
  }
  return CN_DIGITS[value] ?? null;
}

/** 用户明确要求的天数（多地联游至少覆盖全部站点） */
export function resolveEffectivePlanDays(query: string, locationName: string): number | null {
  // 去掉「第N天」标题与【】内部段，避免把约束文案里的天数误当成用户需求
  const cleanedForDays = query
    .replace(/第\s*[0-9一二三四五六七八九十两]+\s*天/g, ' ')
    .replace(/【[^】]*】/g, ' ');
  const cleanedIntent = parseTravelSearchIntent(cleanedForDays);
  const intent =
    cleanedIntent.days != null ? cleanedIntent : parseTravelSearchIntent(query);
  if (!intent.days || intent.days <= 0) {
    return null;
  }

  const stops = getMultiStopNames(locationName);
  if (stops.length >= 2) {
    return Math.max(intent.days, stops.length);
  }

  return intent.days;
}

export function buildStrictDayCountConstraint(days: number): string {
  return [
    `【强制天数】用户明确要求 ${days} 天行程。`,
    `方案简介与【行程流水账】必须且只能写第 1 天至第 ${days} 天，`,
    `禁止出现第 ${days + 1} 天及以后的内容，禁止在简介写「共 ${days + 1} 天」或更多。`,
  ].join('');
}

/** 多日单城：住宿连续 + 同片区推进，避免「西溪住、次日突然从良渚出发」 */
export function buildLodgingContinuityConstraint(): string {
  return [
    '【住宿与动线强制·逐字遵守】',
    '1. 多日单城默认「一基址连住」：第1天选定唯一主住宿片区后，第2晚及以后（返程日前）全部同一片区；简介若写「一基址连住XXX」，流水账所有「从昨晚住宿片区」必须同为 XXX。',
    '2. 每天正文末必须单列一行：`今晚住宿片区：XXX`（具体商圈/地铁站周边，如「西溪湿地北站周边」）。返程日可写「今晚住宿片区：返程回家，无需住宿」。',
    '3. 第2天及以后（含返程日上午）开头必须写：`从昨晚住宿片区「XXX」出发`；XXX 必须与上一晚「今晚住宿片区」完全一致。',
    '4. 严禁跳棋：禁止第2天从西溪出发、第3天却改口「从昨晚住宿片区「良渚…」出发」——未在第2天傍晚写清退房换宿时，第3天仍须从西溪主基址出发再去良渚。',
    '5. 主题切换≠换宿：「亲子线/近郊线/转场」只换玩法，不换床；去滨江/西湖/良渚玩完须写回主住宿接驳，当晚住宿片区名不得改。',
    '6. 真要换宿（少用）：前一天下午写退房→新宿三方案；次日才可改「今晚住宿片区」与「从昨晚…」；简介住宿分项同步。',
    '7. 【方案简介】首段若写「住宿固定在XXX / 一基址连住」，XXX 必须与第1天「今晚住宿片区」逐字相同；花费表住宿行片区名同步，禁止简介写良渚、正文住西溪。',
    '8. 同城换区只写「住宿→今日首站」地铁/公交/打车三方案 + 🐌落地最佳；禁止套用跨城模板（A.去高铁站 → B.大交通东站↔城站/南站 → C.抵达）；主题「转场/切线」不是换城，禁止为凑大交通绕路去车站。',
    '9. 「大交通」专节仅允许：跨城去程（通常第1天）与跨城返程（末日）；目的地市内日程禁止再开「大交通」专节。',
    '10. 第2天起（非返程日）禁止先写「住宿→东站/西站/城站/机场」再去玩；必须从昨晚住宿片区直接去今日首个景点。仅当日出城返程才写去车站。',
    '11. 【禁止瞬移】「从昨晚住宿片区「X」出发」后的第一段交通，出发点必须仍在 X；禁止写完从鳌山卫/西溪出发，下一段却直接「青岛站/龙翔桥站」地铁——中间必须有「主住宿→今日首站」完整三方案。',
    '12. 若今日首站与主住宿跨镇/跨区县或明显较远，首段标题必须是「主住宿→今日首站」；禁止假设人已在景点门口。',
    '13. 每天必须以独立行 `### 第N天` 开头，写完含「今晚住宿片区」后再开下一天；禁止半截小节（如 `#### 5`、`# ### 第N天`）粘到下一天标题。',
  ].join('');
}

/** 同城日程结构与大交通边界（全城通用技术底线） */
export function buildSameCityAccuracyConstraint(): string {
  return [
    '【同城准确度强制·全城通用】',
    '1. 跨城去程/返程才写高铁/飞机「大交通」；同一目的地城市内移动一律市内交通。',
    '2. 禁止：住宿→东站/西站/城站 →「大交通」短驳 → 再去景点；应直接写「住宿→景点」最优市内方案。',
    '3. 禁止把「主题切换（近郊慢行→亲子）」写成换城转场并套 A/B/C 大交通骨架。',
    '4. 简介写的第N天玩法须在流水账同天出现；禁止简介写「第1天西溪、第2天良渚」而流水账第2天改写动物园；禁止简介景点只出现在【蜗牛提示】/避坑却从未写入当天玩法。',
    '5. 先在心里定「日程骨架」再写正文：简介第N天点名的公园/湿地/博物院/古城/茶村/游船/九溪等，流水账第N天必须有对应专节；不得中途换成动物园等未承诺主战场。',
    '6. 禁止两天重复同一主战场（如第2天与第3天都写动物园+少儿公园）；返程日上午可轻体验或补漏，不得整日复刻前一天。',
    '7. 每天独立成节、信息写完再换天；天数标题必须单独成行写成 `### 第N天`；禁止 `# ### 第N天`、半截「蒋村 # ### 第2天」、花费清单中途粘天下一天。',
    '8. 慢游、亲子、近郊、转场仅为玩法标签，不是地名；禁止当城市开高铁，也禁止写进方案主题/第N天标题（严禁出现「禁止把慢游」这类错题）。目的地以用户锁定城市为准。',
    '9. 第2天起首段标题应为「住宿→今日景点」，禁止出现「住宿→杭州东站/成都东站」之类除非当日返程。',
    '10. 禁止瞬移：从主住宿出发后，不可直接从另一城区车站写地铁（如住鳌山卫却直接写青岛站进站），必须先写接驳。',
    '11. 简介写「一基址连住」则全程不得中途改宿到青芝坞等新区；主题切换≠换床。',
    '12. 简介第1/2/3天点名的玩法必须在流水账对应天落地；禁止第3天只在提示/避坑出现九溪、茶村、运河，正文却缺第3天。',
  ].join('');
}

const LODGING_MORNING_PATTERN = /从昨晚住宿片区[「"]([^」"]+)[」"]出发/g;
const LODGING_NIGHT_PATTERN = /今晚住宿片区[：:]\s*([^\n*]+)/;
const LODGING_MAIN_PATTERN = /主住宿片区[：:]\s*([^\n*]+)/;

function cleanLodgingLabel(raw: string): string {
  return raw
    .replace(/\*+/g, '')
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/[。；;].*$/, '')
    .trim();
}

/** 从流水账提取主住宿基址（优先今晚住宿 / 主住宿 / 次日出发片区） */
export function resolvePlanLodgingBase(content: string): string | null {
  const night = content.match(LODGING_NIGHT_PATTERN)?.[1];
  if (night) {
    const cleaned = cleanLodgingLabel(night);
    if (cleaned && !/返程|回家|无需住宿/.test(cleaned)) {
      return cleaned;
    }
  }

  const main = content.match(LODGING_MAIN_PATTERN)?.[1];
  if (main) {
    const cleaned = cleanLodgingLabel(main);
    if (cleaned) {
      return cleaned;
    }
  }

  const morning = [...content.matchAll(LODGING_MORNING_PATTERN)][0]?.[1]?.trim();
  return morning || null;
}

function syncLodgingPlacesInText(text: string, base: string): string {
  let next = text;
  next = next.replace(/住宿固定在[^，。\n（(]{2,40}/g, `住宿固定在${base}`);
  next = next.replace(/住宿锁定在[^，。\n（(]{2,40}/g, `住宿锁定在${base}`);
  next = next.replace(/住宿锁(?:定在|死在)?[^，。\n]{2,40}/g, `住宿锁定在${base}`);
  next = next.replace(/住宿基址锁定[：:「"]?\s*[^」"\n，。]{2,40}/g, `住宿基址锁定：「${base}」`);
  next = next.replace(/一基址连住[（(]?[^）)\n，。]{2,40}[）)]?/g, `一基址连住（${base}）`);
  next = next.replace(
    /(\d\s*晚\s*[·.\-—]\s*)([^|\n·]{2,36}?)(经济型|酒店|民宿|青旅)/g,
    `$1${base}$3`,
  );
  next = next.replace(
    /(住宿\s*[·|｜][^\n]{0,140}?)((?:良渚|西湖|西溪|滨江|拱墅|余杭|转塘|龙坞|留下|蒋村|武林)[^\n|·｜]{0,28})/g,
    (full, prefix: string, place: string) => {
      if (base.includes(place.slice(0, 2)) || place.includes(base.slice(0, 2))) {
        return full;
      }
      return `${prefix}${base}`;
    },
  );
  // 正文/提示里单独写的冲突片区（转塘/龙坞 等）
  if (!/转塘|龙坞/.test(base)) {
    next = next.replace(/转塘\s*[\/／与和]?\s*龙坞(?:茶村)?片区/g, base);
    next = next.replace(/龙坞\s*[\/／与和]?\s*转塘(?:茶村)?片区/g, base);
  }
  return next;
}

/**
 * 统一「从昨晚住宿片区」；并把简介/蜗牛提示里的住宿片区同步到流水账主基址
 */
export function enforceLodgingMorningConsistency(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) {
    return trimmed;
  }

  const base = resolvePlanLodgingBase(trimmed);
  let next = trimmed;

  if (base) {
    next = next.replace(LODGING_MORNING_PATTERN, (full, place: string) => {
      const current = place.trim();
      if (current === base || /返程|回家|无需住宿/.test(current)) {
        return full;
      }
      return `从昨晚住宿片区「${base}」出发`;
    });

    const sections = parsePlanSections(next);
    const synced = {
      ...sections,
      intro: syncLodgingPlacesInText(sections.intro, base),
      snailTips: syncLodgingPlacesInText(sections.snailTips, base),
      pitfalls: syncLodgingPlacesInText(sections.pitfalls, base),
    };
    if (
      synced.intro !== sections.intro ||
      synced.snailTips !== sections.snailTips ||
      synced.pitfalls !== sections.pitfalls
    ) {
      next = serializePlanSections(synced);
    }
  }

  return next;
}

/** 天数标题规范化 + 去掉同城伪大交通 + 住宿连续 */
export function enforcePlanItineraryAccuracy(content: string): string {
  let next = normalizeItineraryDayHeaders(content);
  next = scrubSameCityFakeLongHaul(next);
  return enforceLodgingMorningConsistency(next);
}

/**
 * 砍掉同城「住宿→东站 → 大交通东站↔城站 → 抵达」伪跨城骨架
 */
export function scrubSameCityFakeLongHaul(content: string): string {
  const sections = parsePlanSections(content);
  if (!sections.itinerary.trim()) {
    return content;
  }

  let itinerary = sections.itinerary;

  // A … B.大交通 … C.抵达 三连（同城站间短驳）
  itinerary = itinerary.replace(
    /(?:^|\n)#{0,4}\s*A\.\s*[^\n]*[\s\S]*?(?:^|\n)#{0,4}\s*B\.\s*大交通[\s\S]*?(?:^|\n)#{0,4}\s*C\.\s*抵达[\s\S]*?(?=(?:(?:^|\n)#{0,4}\s*D\.|(?:^|\n)#{0,4}\s*第|(?:^|\n)#{0,4}\s*今晚|\n*$))/gm,
    (block) => {
      const stationHop =
        /(东站|西站|南站|城站).{0,120}(东站|西站|南站|城站)/.test(block) ||
        /(同城|市域|跨区转场|城际短驳|不跨市)/.test(block);
      if (!stationHop) {
        return block;
      }
      const dest =
        block.match(/C\.\s*抵达[^→\n]*→\s*([^\n（(]+)/)?.[1]?.trim() ||
        '今日首站';
      return `\n\n#### 住宿→${dest}（同城直达）\n从昨晚住宿片区直接地铁/公交/打车前往「${dest}」，须写三方案 + 🐌落地最佳；禁止先去东站/城站再换乘。\n`;
    },
  );

  // 残留单独 B.大交通（东站↔城站）
  itinerary = itinerary.replace(
    /(?:^|\n)#{0,4}\s*B\.\s*大交通[^\n]*\n(?:(?!(?:^|\n)#{0,4}\s*(?:[A-D]\.|第|今晚))[\s\S])*/gm,
    (block) => {
      if (/(东站|西站|南站|城站)/.test(block) && /(东站|西站|南站|城站|同城|市域|短驳)/.test(block)) {
        return '\n\n> 蜗牛校正：同城换区请直接地铁/公交，已去掉伪「大交通」短驳。\n';
      }
      return block;
    },
  );

  return serializePlanSections({
    ...sections,
    itinerary,
  });
}

/**
 * 仅修复流水账里粘连的天数标题（如 `#### 5 ### 第2天`），
 * 不改简介正文里的「第1天…」叙述句。
 */
export function normalizeItineraryDayHeaders(content: string): string {
  const sections = parsePlanSections(content);
  const hasItinerary = Boolean(sections.itinerary.trim());
  let target = hasItinerary ? sections.itinerary : content;
  if (!target.trim()) {
    return content;
  }

  // 未闭合引号粘连：`继续走到「蒋村 # ### 第2天`
  target = target.replace(
    /「([^」\n]{0,40}?)\s*#+\s*(?:#{1,4}\s*)?(第\s*[0-9一二三四五六七八九十两]+\s*天[^\n]*)/g,
    (_full, before: string, dayTitle: string) => {
      const label = String(before).trim() || '此处';
      return `「${label}」。\n\n### ${String(dayTitle).trim()}`;
    },
  );

  // 显式拆开 `# ### 第N天` / `## ### 第N天`（行首或行中）
  target = target.replace(
    /#+\s+#{1,4}\s*(第\s*[0-9一二三四五六七八九十两]+\s*天[^\n]*)/g,
    (_full, dayTitle: string) => `\n\n### ${String(dayTitle).trim()}`,
  );

  // 正文中粘着的 `# ### 第2天` / `玩法 # ### 第3天`
  target = target.replace(
    /([^\n])\s*#+\s*(?:#{1,4}\s*)?(第\s*[0-9一二三四五六七八九十两]+\s*天[^\n]*)/g,
    (_full, prev: string, dayTitle: string) => `${prev}\n\n### ${String(dayTitle).trim()}`,
  );

  // 行首 `# ### 第2天` / `# 第2天`
  target = target.replace(
    /(?:^|\n)#+\s*(?:#{1,4}\s*)?(第\s*[0-9一二三四五六七八九十两]+\s*天[^\n]*)/g,
    (_full, dayTitle: string) => `\n\n### ${String(dayTitle).trim()}`,
  );

  // `#### 5 ### 第2天 · xxx`
  target = target.replace(
    /#{1,4}\s*\d{0,2}\s*#{1,4}\s*(第\s*[0-9一二三四五六七八九十两]+\s*天[^\n]*)/g,
    (_full, dayTitle: string) => `\n\n### ${String(dayTitle).trim()}`,
  );

  // 同一行正文后粘着 `### 第2天`
  target = target.replace(
    /([^\n])([ \t]*#{1,4}[ \t]*第\s*[0-9一二三四五六七八九十两]+\s*天[^\n]*)/g,
    (_full, prev: string, dayPart: string) => {
      const cleaned = String(dayPart)
        .trim()
        .replace(/^#{1,4}\s*/, '### ');
      return `${prev}\n\n${cleaned}`;
    },
  );

  target = target.replace(/\n{3,}/g, '\n\n');
  // 避免把已是 ### 第N天 的标题再拆出孤立的「#」行
  target = target.replace(/(?:^|\n)#\s*\n+(#{1,3}\s*第)/g, '\n\n$1');

  if (hasItinerary) {
    return serializePlanSections({
      ...sections,
      itinerary: target,
    });
  }
  return target;
}

const DAY_HEADER_PATTERN =
  /(?:^|\n)(?:#{1,4}\s*)?(?:\*\*)?第\s*(?:([0-9]{1,2})|([一二三四五六七八九十两]+))\s*天/g;

/** 统计行程正文里出现了多少个「第N天」标题 */
export function countItineraryDayHeaders(itinerary: string): number {
  const seen = new Set<number>();
  for (const match of itinerary.matchAll(DAY_HEADER_PATTERN)) {
    const dayNum = match[1]
      ? Number.parseInt(match[1], 10)
      : parseChineseDayNumeral(match[2] ?? '');
    if (dayNum != null && dayNum > 0) {
      seen.add(dayNum);
    }
  }
  return seen.size;
}

/** 截掉超出用户要求天数的行程段落 */
export function clampItineraryToMaxDays(itinerary: string, maxDays: number): string {
  const trimmed = itinerary.trim();
  if (!trimmed || maxDays <= 0) {
    return trimmed;
  }

  let cutIndex: number | null = null;
  for (const match of trimmed.matchAll(DAY_HEADER_PATTERN)) {
    const dayNum = match[1]
      ? Number.parseInt(match[1], 10)
      : parseChineseDayNumeral(match[2] ?? '');
    if (dayNum != null && dayNum > maxDays && match.index != null) {
      cutIndex = match.index;
      break;
    }
  }

  if (cutIndex == null) {
    return trimmed;
  }

  return trimmed.slice(0, cutIndex).trim();
}

/** 简介里夸大的「N天M晚 / 共N天」压回用户确认天数 */
export function alignIntroToMaxDays(intro: string, maxDays: number): string {
  if (!intro.trim() || maxDays <= 0) {
    return intro;
  }
  const nights = Math.max(0, maxDays - 1);
  return intro
    .replace(/(\d+)\s*天\s*(\d+)\s*晚/g, (full, daysRaw: string) => {
      const days = Number.parseInt(daysRaw, 10);
      return Number.isFinite(days) && days > maxDays ? `${maxDays}天${nights}晚` : full;
    })
    .replace(/共\s*(\d+)\s*天/g, (full, daysRaw: string) => {
      const days = Number.parseInt(daysRaw, 10);
      return Number.isFinite(days) && days > maxDays ? `共${maxDays}天` : full;
    })
    .replace(/行程\s*(\d+)\s*天/g, (full, daysRaw: string) => {
      const days = Number.parseInt(daysRaw, 10);
      return Number.isFinite(days) && days > maxDays ? `行程${maxDays}天` : full;
    });
}

export function enforcePlanDayCountOnContent(
  content: string,
  query: string,
  locationName: string,
): string {
  const maxDays = resolveEffectivePlanDays(query, locationName);
  if (!maxDays) {
    return content;
  }

  const normalized = normalizeItineraryDayHeaders(content);
  const sections = parsePlanSections(normalized);
  const clampedItinerary = clampItineraryToMaxDays(sections.itinerary, maxDays);
  const alignedIntro = alignIntroToMaxDays(sections.intro, maxDays);

  if (clampedItinerary === sections.itinerary && alignedIntro === sections.intro) {
    return normalized;
  }

  return serializePlanSections({
    ...sections,
    intro: alignedIntro,
    itinerary: clampedItinerary,
  });
}
