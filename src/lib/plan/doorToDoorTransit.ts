/**
 * 「门到门」出行块：每段市内衔接须写地铁 / 公交 / 出租车 + 落地最佳方案
 */

/** 视为「大城市」须写公交换车的地名关键词 */
const LARGE_CITY_KEYWORDS = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '成都',
  '重庆',
  '杭州',
  '武汉',
  '西安',
  '南京',
  '天津',
  '苏州',
  '青岛',
  '济南',
  '福州',
  '厦门',
  '长沙',
  '郑州',
  '沈阳',
  '哈尔滨',
  '昆明',
  '南宁',
  '合肥',
  '宁波',
  '无锡',
  '东莞',
  '佛山',
  '温州',
  '泉州',
  '莆田',
  '历下',
  '市中',
  '历城',
  '槐荫',
  '天桥',
];

export function isLargeCityTransitContext(...labels: string[]): boolean {
  const blob = labels.filter(Boolean).join('');
  return LARGE_CITY_KEYWORDS.some((city) => blob.includes(city));
}

function buildBusTransitRule(largeCity: boolean): string {
  if (largeCity) {
    return [
      '**公交**（须定位到站，大城市常需换车）：',
      '上车站（靠近起点地标/小区门口）→ 首班车号 → 换乘站（下车）→ 第二路车号 → 下车站（靠近终点）→ 步行至目标约X米 → 约¥、约分钟、一句贴士；',
      '禁止只写「K系列」「公交可达」等模糊表述。',
    ].join('');
  }
  return [
    '**公交**：上车站（地标旁具体站名）→ 线路号 → 下车站 → 步行至目标约X米 → 约¥、约分钟；',
    '若需换车须写明换乘站与第二路车号。',
  ].join('');
}

function buildMetroTransitRule(largeCity: boolean): string {
  if (largeCity) {
    return '**地铁**：起止站点全名、换乘线路（如「3号线XX站换乘1号线」）、约¥、约分钟、一句贴士；';
  }
  return '**地铁**：线路、上下车站全名、约¥、约分钟、一句贴士；';
}

/** 单段市内衔接四项规则（按城市规模区分公交/地铁粒度） */
export function buildDoorToDoorSegmentRules(largeCity: boolean): string {
  return [
    '每一段市内衔接必须写齐四项（不可只写一种）：',
    buildMetroTransitRule(largeCity),
    buildBusTransitRule(largeCity),
    '**出租车/网约车**：约¥、约分钟、适合场景（行李多/赶时间/夜间）；',
    '**🐌落地最佳**：综合省钱/省时/省力，明确推荐地铁/公交/出租车哪一种，并写清下车后步行或站内换乘末段。',
  ].join('');
}

/** @deprecated 使用 buildDoorToDoorSegmentRules */
export const DOOR_TO_DOOR_SEGMENT_RULE = buildDoorToDoorSegmentRules(true);

/** @deprecated 使用 buildDoorToDoorSegmentRules */
export const LOCAL_TRANSIT_THREE_OPTIONS_RULE = DOOR_TO_DOOR_SEGMENT_RULE;

/** 强制 AI 不得改出发地（防 GPS 偏到经十路、方案写错门口） */
export function buildStrictOriginConstraint(originName: string): string {
  const origin = originName.trim();
  if (!origin) {
    return '';
  }
  return [
    `【出发地锁定】用户真实出发地只能是「${origin}」。`,
    `第一段「家门口→出发站/机场」必须从「${origin}」写起，地铁/公交上车站须靠近该地址，禁止改写成经十路6777、舜华路经十路等其他街道或默认示例地址。`,
    '禁止写「假设」「示例」「用户可按实际调整」「以某某站为出发地示例」等措辞；必须按用户给出的真实出发地写门到门交通。',
  ].join('');
}

/** 多地联游：每天一个站点，须写站间大交通 */
export function buildMultiStopDestinationConstraint(stops: string[], days: number | null): string {
  const cleaned = stops.map((stop) => stop.trim()).filter(Boolean);
  if (cleaned.length < 2) {
    return '';
  }
  const dayCount = Math.max(days ?? 0, cleaned.length);
  const dayLines = cleaned
    .map((stop, index) => `第${index + 1}天主玩「${stop}」`)
    .join('；');
  return [
    `【多地联游锁定】用户要求依次游玩 ${cleaned.length} 个站点：${cleaned.join(' → ')}，共 ${dayCount} 天。`,
    `${dayLines}。`,
    `正文【行程流水账】中每个站名都必须出现，缺一不可：${cleaned.join('、')}。`,
    `每天都要写清跨站大交通（高铁/城际/公交/打车）与门到门衔接，禁止只规划其中一个地方而忽略其他站点。`,
    `禁止将站点替换为与用户需求无关的其他城市。`,
  ].join('');
}

/** 强制 AI 不得改目的地（防莆田→昆明/弥勒） */
export function buildStrictDestinationConstraint(destinationName: string): string {
  const dest = destinationName.trim();
  if (!dest) {
    return '';
  }
  if (dest.includes('→')) {
    const stops = dest.split('→').map((stop) => stop.trim()).filter(Boolean);
    return buildMultiStopDestinationConstraint(stops, stops.length);
  }
  return [
    `【目的地锁定】本次规划目的地只能是「${dest}」及其下属区县、景点、车站。`,
    `大交通终点、抵达接驳、每日玩法、餐饮都必须落在「${dest}」境内。`,
    `禁止将目的地写成昆明、弥勒、厦门、泉州等其他城市；禁止编造与「${dest}」无关的火车终点。`,
    `若从济南出发去莆田：大交通应写福州/莆田方向高铁，不得写昆明南、弥勒等云南站点。`,
    `「慢游 / 亲子 / 近郊 / 转场 / 亲子出行 / 近郊慢行」只是玩法标签，绝不是城市或高铁站；禁止写「近郊慢行目的地」「亲子出行近郊慢行（济南→…）」这类站名。`,
    `主住宿必须选在「${dest}」境内商圈；禁止把出发地小区（如历下绿城百合花园）当成目的地住宿基址。`,
  ].join('');
}

/** 行程流水账市内衔接：信息要全，文风可口语 */
export function buildItinerarySegmentOutputTemplate(): string {
  return [
    '【行程流水账格式】跨区/门到门衔接须写清地铁（无则注明）、公交（上车站→方向→下车站）、打车参考与 🐌落地最佳。',
    '可用短段落或加粗小标题，勿整页机械复制「地铁/公交/出租车」套话；信息准确优先于格式整齐。',
  ].join('\n');
}

export function buildDoorToDoorSegmentInstruction(
  segmentTitle: string,
  fromLabel: string,
  toLabel: string,
): string {
  const largeCity = isLargeCityTransitContext(fromLabel, toLabel);
  return [
    `### ${segmentTitle}`,
    `从「${fromLabel}」到「${toLabel}」`,
    buildDoorToDoorSegmentRules(largeCity),
  ].join('\n');
}

function jinanBusExampleSnippet(origin: string): string {
  return `济南出发须以用户给出的「${origin}」查最近地铁/公交上车站，禁止套用经十路6777、K139/K156 等与本地址无关的示例。`;
}

/** 跨城全程门到门结构（写入 AI 用户消息） */
export function buildCrossCityDoorToDoorHint(
  originName: string,
  destinationName: string,
): string {
  const origin = originName.trim();
  const dest = destinationName.trim();
  if (!origin || !dest) {
    return '';
  }

  const departureStation = pickDepartureStationHint(origin);
  const arrivalStation = pickArrivalStationHint(dest);
  const originLarge = isLargeCityTransitContext(origin);
  const destLarge = isLargeCityTransitContext(dest);

  const extraLines: string[] = [];
  if (originLarge && /济南|历下/.test(origin)) {
    extraLines.push(jinanBusExampleSnippet(origin));
  }
  if (destLarge) {
    extraLines.push(
      `${dest}为大城市：抵达段公交须写「火车站/高铁站→住宿」的具体站名、是否换车、下车站与步行距离。`,
    );
  }

  return [
    buildStrictOriginConstraint(origin),
    buildStrictDestinationConstraint(dest),
    buildItinerarySegmentOutputTemplate(),
    '【门到门规划要求】跨城方案须按时间线写全以下段落，每段市内出行都用「地铁 / 公交 / 出租车」三方案 + 🐌落地最佳，禁止跳段：',
    extraLines.length > 0 ? extraLines.join('\n') : '',
    '',
    buildDoorToDoorSegmentInstruction('1. 出发·家门口→出发站/机场', origin, departureStation),
    '',
    '### 2. 大交通',
    `从出发站乘高铁/火车/飞机抵达${dest}境内车站（终点须为${arrivalStation}，写清车次类型、票价、约小时；禁止写到其他城市终点站）。`,
    '',
    buildDoorToDoorSegmentInstruction('3. 抵达·车站→目的地首站/住宿', arrivalStation, `${dest}市区首站或酒店`),
    '',
    '### 4. 目的地玩法',
    '写当日景点、餐饮与花费；若换区超过 5 公里，对该段再写三方案 + 落地最佳（公交须写到站+换车）。',
    '',
    '### 5. 返程（若有）',
    `目的地车站→${origin}家门口，同样写地铁/公交/出租车三方案 + 🐌落地最佳。`,
  ]
    .filter(Boolean)
    .join('\n');
}

function pickDepartureStationHint(origin: string): string {
  if (/济南|历下|市中|槐荫|天桥|历城/.test(origin)) {
    return '济南西站/济南站/济南东站（择最近且写明）';
  }
  return '本市主要高铁站/火车站/机场（择一并写明）';
}

function pickArrivalStationHint(destination: string): string {
  if (/曲阜|三孔|尼山/.test(destination)) {
    return '曲阜东站/曲阜站（济宁曲阜，勿写到济南/徐州）';
  }
  if (/微山湖/.test(destination)) {
    return '微山湖站/滕州站/济宁站（再转景区接驳，写清大巴/公交/打车）';
  }
  if (/台儿庄/.test(destination)) {
    return '台儿庄站/枣庄站（再转BRT/公交至台儿庄古城，写清下车站）';
  }
  if (/济宁/.test(destination)) {
    return '济宁站/济宁东站';
  }
  if (/莆田/.test(destination)) {
    return '莆田站/莆田北站（福州—莆田方向，勿写昆明/弥勒）';
  }
  if (/福州/.test(destination)) {
    return '福州站/福州南站';
  }
  return `${destination}高铁站/火车站（须在该市境内）`;
}

function pickInterStopTransitHint(fromStop: string, toStop: string): string {
  if (/曲阜/.test(fromStop) && /微山湖/.test(toStop)) {
    return '曲阜→微山湖：曲阜东站/曲阜站乘高铁或动车至滕州东/微山湖站，或曲阜→济宁→微山湖景区大巴；写清车次类型、票价、约小时、抵达后接驳。';
  }
  if (/微山湖/.test(fromStop) && /台儿庄/.test(toStop)) {
    return '微山湖→台儿庄：景区大巴/城际公交/打车至台儿庄古城（约1–2小时），写清上车站、下车站、票价；也可经枣庄站转BRT。';
  }
  if (/济南|历下/.test(fromStop) && /曲阜/.test(toStop)) {
    return '济南→曲阜：济南西站/济南站/济南东站乘高铁至曲阜东站（约35–50分钟），写清车次类型与票价。';
  }
  return `从「${fromStop}」到「${toStop}」须写清大交通（高铁/城际/大巴/打车）的车次或线路、票价、约小时、抵达站，再接驳至当日首站/住宿。`;
}

/** 站间转场：上一站出口/住宿 → 下一站首站，须门到门 */
export function buildInterStopTransitHint(
  fromStop: string,
  toStop: string,
  dayNumber: number,
): string {
  const from = fromStop.trim();
  const to = toStop.trim();
  if (!from || !to) {
    return '';
  }

  const departureStation = pickDepartureStationHint(from);
  const arrivalStation = pickArrivalStationHint(to);
  const largeContext = isLargeCityTransitContext(from, to);

  return [
    `### 第${dayNumber}天 · 转场：${from} → ${to}`,
    pickInterStopTransitHint(from, to),
    '',
    buildDoorToDoorSegmentInstruction(
      `A. ${from}出发·住宿/末站→${from}出发站`,
      `${from}当日住宿或末站`,
      departureStation,
    ),
    '',
    '### B. 大交通',
    `从${departureStation}出发，抵达${arrivalStation}（禁止写到与「${to}」无关的城市）。`,
    '',
    buildDoorToDoorSegmentInstruction(
      `C. 抵达·${to}车站→${to}首站/住宿`,
      arrivalStation,
      `${to}市区首站或酒店`,
    ),
    '',
    `### D. 第${dayNumber}天 · ${to}玩法`,
    `写${to}当日景点、餐饮（早/午/晚）、门票与分项花费；换区超过5公里须再写地铁/公交/出租车三方案 + 🐌落地最佳。`,
    largeContext ? '大城市/景区接驳须写到具体站名、是否换车、步行距离。' : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/** 多地联游全程门到门：出发地→站1→站2→…，每段不断档 */
export function buildMultiStopDoorToDoorChain(
  stops: string[],
  originName?: string | null,
): string {
  const cleaned = stops.map((stop) => stop.trim()).filter(Boolean);
  if (cleaned.length < 2) {
    return '';
  }

  const origin = originName?.trim() ?? null;
  const legs: string[] = [
    '【全程门到门衔接链】用户要求从出发地到每个目的地无缝衔接，禁止跳段、禁止只写景点不写交通：',
    buildItinerarySegmentOutputTemplate(),
  ];

  if (origin) {
    legs.push(
      '',
      buildCrossCityDoorToDoorHint(origin, cleaned[0]!),
      '',
      `第1天除上述抵达${cleaned[0]!}外，须写${cleaned[0]!}当日玩法、餐饮、住宿区域建议。`,
    );
  } else if (cleaned[0]) {
    legs.push(
      '',
      `第1天在「${cleaned[0]!}」：若用户未给出发地，写「抵达${cleaned[0]!}」后的车站→住宿→玩法，仍须门到门三方案。`,
    );
  }

  for (let index = 1; index < cleaned.length; index += 1) {
    legs.push('', buildInterStopTransitHint(cleaned[index - 1]!, cleaned[index]!, index + 1));
  }

  const lastStop = cleaned[cleaned.length - 1]!;
  if (origin) {
    legs.push(
      '',
      '### 返程（若行程含返程日）',
      `${lastStop}→${origin}：写清${lastStop}至返程站的大交通、抵达${origin}后家门口接驳，同样地铁/公交/出租车 + 🐌落地最佳。`,
    );
  }

  return legs.join('\n');
}

/** 仅出发地已知时（兼容旧调用） */
export function buildCrossCityDay1LocalTransitHint(
  originName: string,
  destinationName?: string,
): string {
  if (destinationName?.trim()) {
    return buildCrossCityDoorToDoorHint(originName, destinationName);
  }
  const origin = originName.trim();
  if (!origin) {
    return '';
  }
  return buildCrossCityDoorToDoorHint(origin, '目的地');
}
