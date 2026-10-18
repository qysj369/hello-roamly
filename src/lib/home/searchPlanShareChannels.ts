import { BRAND_DOMAIN } from '@/lib/config/brandCopy';
import { SITE_PLATFORM_DISCLAIMER, SITE_SHARE_REFERENCE_LINE } from '@/lib/config/siteCompliance';
import { pickCityShareDouyinScript, pickCityShareXhsNote, type CityShareDouyinScript, type CityShareXhsNote } from '@/data/cityShareSeedKit';
import { collectSearchPlanShareFragments } from '@/lib/home/searchPlanShareFragments';
import { classifySearchPlanParty, searchPlanShareCityName, searchPlanRouteFlavor } from '@/lib/home/searchPlanShareCopy';
import { buildSearchPlanShareNote } from '@/lib/home/searchPlanShareNote';
import type { SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

export const SEARCH_PLAN_SHARE_CTA = `完整行程路线在蜗牛旅行 ${BRAND_DOMAIN}，AI一键定制你的专属旅行方案`;

/** 公域发布口径：工具定位 + 非旅游经营声明 */
export const SEARCH_PLAN_DISCLAIMER = SITE_PLATFORM_DISCLAIMER;

export const SEARCH_PLAN_SHARE_REF = SITE_SHARE_REFERENCE_LINE;

/** 公域视频/微博用：与分享声明同一口径，不写定制、报价、追踪链接 */
export const SEARCH_PLAN_PUBLIC_NOTE_CTA = SEARCH_PLAN_DISCLAIMER;

/** 抖音短视频：灵感参考，不带站外完整外链 */
export const SEARCH_PLAN_DOUYIN_NOTE_CTA = SEARCH_PLAN_DISCLAIMER;

export type SearchPlanShareChannelId =
  | 'wechat'
  | 'xhs'
  | 'douyin'
  | 'weibo'
  | 'dianping'
  | 'zhihu'
  | 'bilibili'
  | 'kuaishou';

export type SearchPlanShareChannel = {
  id: SearchPlanShareChannelId;
  label: string;
  hint: string;
  appUrl: string;
  webUrl: string;
  androidPackage?: string;
  pinned: boolean;
};

export const SEARCH_PLAN_SHARE_CHANNELS: readonly SearchPlanShareChannel[] = [
  {
    id: 'wechat',
    label: '微信素材',
    hint: '1:1 海报 + 短文案',
    appUrl: 'weixin://',
    webUrl: 'https://wx.qq.com/',
    androidPackage: 'com.tencent.mm',
    pinned: true,
  },
  {
    id: 'xhs',
    label: '小红书',
    hint: '3张3:4海报 + 种草文案',
    appUrl: 'xhsdiscover://home',
    webUrl: 'https://www.xiaohongshu.com/',
    androidPackage: 'com.xingin.xhs',
    pinned: false,
  },
  {
    id: 'douyin',
    label: '抖音素材',
    hint: '9:16 海报 + 口播',
    appUrl: 'snssdk1128://',
    webUrl: 'https://www.douyin.com/',
    androidPackage: 'com.ss.android.ugc.aweme',
    pinned: true,
  },
  {
    id: 'weibo',
    label: '微博',
    hint: '热门话题 + 短笔记',
    appUrl: 'sinaweibo://',
    webUrl: 'https://m.weibo.cn/',
    androidPackage: 'com.sina.weibo',
    pinned: false,
  },
  {
    id: 'dianping',
    label: '大众点评',
    hint: '逛吃笔记',
    appUrl: 'dianping://home',
    webUrl: 'https://www.dianping.com/',
    androidPackage: 'com.dianping.v1',
    pinned: false,
  },
  {
    id: 'zhihu',
    label: '知乎',
    hint: '问答长笔记',
    appUrl: 'zhihu://',
    webUrl: 'https://www.zhihu.com/',
    androidPackage: 'com.zhihu.android',
    pinned: false,
  },
  {
    id: 'bilibili',
    label: 'B站',
    hint: '口播脚本 + 竖版封面',
    appUrl: 'bilibili://home',
    webUrl: 'https://www.bilibili.com/',
    androidPackage: 'tv.danmaku.bili',
    pinned: false,
  },
  {
    id: 'kuaishou',
    label: '快手',
    hint: '平价短笔记',
    appUrl: 'kwai://home',
    webUrl: 'https://www.kuaishou.com/',
    androidPackage: 'com.smile.gifmaker',
    pinned: false,
  },
];

export const SEARCH_PLAN_EXPORT_CHANNELS = [
  { id: 'xhs' as const, label: '一键生成小红书图文', hint: '下载 3 张 3:4 图，复制种草文案' },
  { id: 'douyin' as const, label: '抖音竖版', hint: '下载竖版图，复制口播' },
  { id: 'wechat' as const, label: '微信方图', hint: '下载方形图，复制一段话' },
];

export const SEARCH_PLAN_SHARE_HOWTO = [
  '点下面一个按钮：会下载一张图，并复制一段话。',
  '打开微信或抖音。',
  '发出刚下载的图，在输入框长按「粘贴」。',
];

function publicTags(plan: SearchStructuredPlan): string {
  const city = searchPlanShareCityName(plan);
  return [`#${city}慢游`, '#周末去哪'].join(' ');
}

/** 公域拦截库：营销/成套行程话术 → 中性游玩灵感 */
const SHARE_MARKETING_PHRASES: ReadonlyArray<readonly [RegExp, string]> = [
  [/AI\s*一键定制[^\n]*/g, ''],
  [/AI定制专属行程/g, '游玩灵感'],
  [/专属旅行方案/g, '游玩灵感'],
  [/定制行程/g, '游玩灵感'],
  [/成套行程/g, '游玩灵感'],
  [/全套路线/g, '漫游碎片'],
  [/完整攻略/g, '游玩灵感'],
  [/完整行程/g, '游玩灵感'],
];

function stripShareUrlsAndDays(text: string): string {
  return text
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\bwww\.\S+/gi, '')
    .replace(/helloroamly\.com/gi, '')
    .replace(/Day\s*[1-9]\d*/gi, '')
    .replace(/第[一二三四五六七八九十\d]+天/g, '');
}

const SHARE_PRICE_LINE =
  /(?:人均|约)?\s*\d{1,5}(?:\s*[-—–‑~～至到]\s*\d{1,5})?\s*元|[¥￥]\s*\d+(?:\.\d+)?/g;

function stripSharePricesAndTipBlocks(text: string): string {
  return text
    .replace(/【预算明细】[\s\S]*?(?=\n【|\s*$)/g, '')
    .replace(/【行程亮点】[^\n]*/g, '')
    .replace(/【本次行程专属贴士】[\s\S]*?(?=\n【|\s*$)/g, '')
    .replace(SHARE_PRICE_LINE, '')
    .replace(/人均/g, '')
    .replace(/预算[^\n。]{0,24}/g, '');
}

function applyShareMarketingPhrases(text: string): string {
  return SHARE_MARKETING_PHRASES.reduce((next, [pattern, replacement]) => next.replace(pattern, replacement), text);
}

/** 海报画面文字：屏蔽网址、多日清单、营销词，不追加免责长句 */
export function sanitizePosterOverlayText(text: string): string {
  return applyShareMarketingPhrases(stripSharePricesAndTipBlocks(stripShareUrlsAndDays(text)))
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function clipSharePhrase(text: string, max = 28): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, max);
}

function sharePartyLabel(peopleType: string): string {
  const focus = classifySearchPlanParty(peopleType);
  if (focus === 'family') return '亲子慢游';
  if (focus === 'couple') return '情侣慢游';
  if (focus === 'solo') return '一人慢游';
  return '好友慢游';
}

function shareDayHint(day: SearchStructuredPlan['dayList'][number]): string {
  const intro = day.spots
    .map((spot) =>
      spot.intro
        .replace(/必体验[:：]?\s*/gu, '')
        .replace(/时间充裕可选[:：]?\s*/gu, '')
        .trim(),
    )
    .find((text) => text.length >= 4);
  const introLine = intro?.split(/[。；;]/u)[0]?.trim() ?? '';
  if (introLine.length >= 4) return clipSharePhrase(introLine);
  const tipLine = day.tips.split(/[。；;]/u)[0]?.trim() ?? '';
  if (tipLine.length >= 4) return clipSharePhrase(tipLine);
  return '按自己的节奏慢慢逛';
}

function shareDayHighlight(day: SearchStructuredPlan['dayList'][number]): string {
  const names = day.spots.map((spot) => spot.name.trim()).filter(Boolean).slice(0, 2);
  const title = day.title.replace(/慢逛|抵达[^，,]*/gu, '').trim();
  const namePart = names.join('+') || title.slice(0, 16) || '街巷漫步';
  const food = day.foods[0];
  const foodBit = food
    ? `，品尝${clipSharePhrase(
        [food.shop, (food.dish || '').split(/[、,，]/u)[0]].filter(Boolean).join(''),
        16,
      )}`
    : '';
  return `D${day.day} ${namePart}，${shareDayHint(day)}${foodBit}`;
}

function shareOpeningHook(plan: SearchStructuredPlan): string {
  const city = searchPlanShareCityName(plan);
  const days = plan.baseInfo.days;
  const party = sharePartyLabel(plan.baseInfo.peopleType);
  const spots = plan.dayList.flatMap((day) => day.spots.map((spot) => spot.name.trim()).filter(Boolean));
  const place = spots.slice(0, 2).join('与') || searchPlanRouteFlavor(plan);
  return `${city}${days}天${party}｜不用追赶人流，轻松逛${place}`;
}

function shareSceneLine(plan: SearchStructuredPlan): string {
  const spots = plan.dayList
    .flatMap((day) => day.spots.map((spot) => spot.name.trim()).filter(Boolean))
    .slice(0, 3);
  const foods = plan.dayList
    .flatMap((day) =>
      day.foods.map((food) => food.shop.replace(/（[^）]*）$/u, '').trim()).filter(Boolean),
    )
    .slice(0, 2);
  if (spots.length + foods.length < 2) return '';
  const head = spots.join('、');
  return foods.length ? `${head}，再配${foods.join('、')}` : head;
}

function shareTravelTip(plan: SearchStructuredPlan): string {
  const traffic = plan.dayList.map((day) => day.traffic?.[0]?.desc?.trim()).find(Boolean);
  if (traffic) return `出行小提示：${clipSharePhrase(traffic, 36)}`;
  const hotel = plan.dayList[0]?.hotelArea?.trim();
  if (hotel) return `出行小提示：住宿优先${clipSharePhrase(hotel, 24)}，少换乘。`;
  const global = plan.globalTips.find((tip) => tip.trim() && !/预算/.test(tip));
  if (global) return `出行小提示：${clipSharePhrase(global.replace(/^[^：:]*[:：]/u, ''), 36)}`;
  return '出行小提示：地铁沿线住宿，近处优先步行。';
}

/** 发给朋友 / 海报配套文案：开篇 + 三日亮点 + 贴士 + 免责与话题 */
export function buildStructuredShareCopy(plan: SearchStructuredPlan): string {
  const highlights = plan.dayList.slice(0, 3).map(shareDayHighlight).join('\n');
  return withShareFooter(
    [shareOpeningHook(plan), highlights, shareTravelTip(plan)].filter(Boolean).join('\n'),
    publicTags(plan),
  );
}

function buildWechatShareCopy(plan: SearchStructuredPlan): string {
  const city = searchPlanShareCityName(plan);
  const party = sharePartyLabel(plan.baseInfo.peopleType);
  const hook = `${shareOpeningHook(plan)}。想转给朋友时，就说这是一趟不赶场的${city}${party}。`;
  return withShareFooter(
    [hook, plan.dayList.slice(0, 3).map(shareDayHighlight).join('\n'), shareTravelTip(plan)]
      .filter(Boolean)
      .join('\n'),
    publicTags(plan),
  );
}

function buildXhsShareCopy(plan: SearchStructuredPlan): string {
  const city = searchPlanShareCityName(plan);
  const hook = `${city}这几天，原来可以这么松 🌿`;
  const scenes = shareSceneLine(plan);
  const feel = scenes
    ? `没有赶场清单。${scenes}，把空档留给自己。`
    : '没有赶场清单，只留江风、小馆和一段自己的步子。';
  const days = plan.dayList.slice(0, 3).map((day) => `📍 ${shareDayHighlight(day)}`);
  return withShareFooter(
    [hook, feel, ...days, shareTravelTip(plan)].join('\n'),
    `${publicTags(plan)} #城市漫步`,
  );
}

function buildDouyinShareCopy(plan: SearchStructuredPlan): string {
  const city = searchPlanShareCityName(plan);
  const scenes = shareSceneLine(plan);
  const spoken = [
    `${city}这几天，别追人流。`,
    scenes ? `镜头里就这几处：${scenes}。` : '',
    ...plan.dayList.slice(0, 3).map(shareDayHighlight),
    '按自己的节奏就够了。',
    shareTravelTip(plan),
  ].filter(Boolean);
  return withShareFooter(spoken.join('\n'), publicTags(plan));
}

function fragmentCaptionLine(caption: string): string {
  return (
    caption
      .replace(/^【行程亮点】/u, '')
      .replace(/必体验[:：]?\s*/gu, '')
      .replace(/时间充裕可选[:：]?\s*/gu, '')
      .split(/[；;。]/u)
      .map((part) => part.trim())
      .find((part) => part.length >= 4) ?? caption
  ).slice(0, 36);
}

/** 知乎轻量问答：长一点但仍是碎片点位，不写成套行程 */
function buildZhihuAnswerCopy(plan: SearchStructuredPlan): string {
  const city = searchPlanShareCityName(plan);
  const fragments = collectSearchPlanShareFragments(plan).slice(0, 4);
  const lines = fragments
    .map((item) => `${item.name}：${fragmentCaptionLine(item.caption) || `${city}随便走走`}`)
    .join('\n');
  const body = [
    `${city}周末漫游怎么走才不赶场？单人短途也可以只停两三个点，亲子出游先留空档。`,
    lines || `${city}先找一条老街慢慢走。`,
  ].join('\n\n');
  return withShareFooter(body, publicTags(plan));
}

/** 公域导出强制过滤：多日清单、预算、外链、定制话术一律去掉 */
export function sanitizeShareExportText(text: string): string {
  const cleaned = applyShareMarketingPhrases(
    stripShareUrlsAndDays(
      stripSharePricesAndTipBlocks(
        text
          .replace(SEARCH_PLAN_DISCLAIMER, '')
          .replace(/蜗牛旅行——AI行程规划工具[^\n]*/g, '')
          .replace(/不从事旅行社组团[^\n]*/g, '')
          .replace(/完整行程路线在蜗牛旅行[^\n]*/g, ''),
      ),
    ),
  )
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!cleaned) return SEARCH_PLAN_SHARE_REF;
  if (cleaned.includes(SEARCH_PLAN_SHARE_REF)) return cleaned;
  return `${cleaned}\n\n${SEARCH_PLAN_SHARE_REF}`;
}

function withShareFooter(body: string, tags?: string): string {
  return sanitizeShareExportText(
    [body.trim(), '', SEARCH_PLAN_SHARE_REF, tags?.trim()]
      .filter(Boolean)
      .join('\n')
      .trim(),
  );
}

export function buildCityShareDouyinCopy(script: CityShareDouyinScript): string {
  return withShareFooter(script.spoken, script.tags);
}

export function buildCityShareXhsCopy(note: CityShareXhsNote): string {
  return withShareFooter(`${note.title}\n\n${note.body}`);
}

export function buildSearchPlanChannelCopy(
  channel: SearchPlanShareChannelId,
  plan: SearchStructuredPlan,
  _shareUrl?: string,
): string {
  if (channel === 'wechat') return buildWechatShareCopy(plan);
  if (channel === 'xhs') return buildXhsShareCopy(plan);
  if (channel === 'douyin') return buildDouyinShareCopy(plan);
  if (channel === 'zhihu') {
    return buildZhihuAnswerCopy(plan);
  }
  if (channel === 'bilibili' || channel === 'kuaishou') {
    const script = pickCityShareDouyinScript(plan);
    if (script) return buildCityShareDouyinCopy(script);
    return withShareFooter(
      buildSearchPlanShareNote(plan, { density: 'spoken', publicSafe: true, tags: false }),
      publicTags(plan),
    );
  }
  const note = pickCityShareXhsNote(plan);
  if (note) return buildCityShareXhsCopy(note);
  return withShareFooter(
    buildSearchPlanShareNote(plan, { density: 'seed', publicSafe: true, tags: false }),
    publicTags(plan),
  );
}

export function searchPlanComposeAppUrl(channel: SearchPlanShareChannel, copy: string): string {
  const text = encodeURIComponent(copy.slice(0, 1600));
  if (channel.id === 'wechat') return 'weixin://';
  if (channel.id === 'weibo') return `sinaweibo://sendweibo?content=${text}`;
  if (channel.id === 'zhihu') return `zhihu://pin/editor?content=${text}`;
  if (channel.id === 'xhs') return 'xhsdiscover://post';
  if (channel.id === 'douyin') return 'snssdk1128://';
  if (channel.id === 'kuaishou') return 'kwai://post';
  if (channel.id === 'bilibili') return 'bilibili://uper/user_center/add_archive';
  return channel.appUrl;
}

export function searchPlanExportHint(channelId: 'wechat' | 'douyin' | 'xhs'): string {
  if (channelId === 'xhs') {
    return '种草文案已复制，汇总海报已保存。打开小红书发图文：选刚保存的海报，输入框长按粘贴。';
  }
  if (channelId === 'wechat') {
    return '短文案已复制，汇总海报已保存。打开微信发图后，输入框长按粘贴。';
  }
  return '口播已复制，汇总海报已保存。打开抖音发图文：选刚保存的海报，输入框长按粘贴。';
}

export function searchPlanExportSteps(channelId: 'wechat' | 'douyin' | 'xhs'): string[] {
  if (channelId === 'wechat') {
    return [
      '复制走心短文，再下载封面+三日行程汇总海报。',
      '打开微信发给朋友或朋友圈。',
      '从相册选刚保存的海报，输入框长按粘贴。',
    ];
  }
  if (channelId === 'xhs') {
    return [
      '复制种草文案，再下载封面+三日行程汇总海报。',
      '打开小红书，点 + 发图文。',
      '选刚保存的海报，输入框长按粘贴文案。',
    ];
  }
  return [
    '复制口播短句，再下载竖版行程汇总海报。',
    '打开抖音，点 + 发图文。',
    '选刚保存的海报，输入框长按粘贴。',
  ];
}

export function searchPlanShareGuide(
  channel: SearchPlanShareChannel,
  _isMobile?: boolean,
  _mode?: string,
): string {
  if (channel.id === 'douyin') return searchPlanExportHint('douyin');
  if (channel.id === 'wechat') return searchPlanExportHint('wechat');
  if (channel.id === 'zhihu') return '知乎短文案已复制。打开知乎提问或想法，长按粘贴。';
  if (channel.id === 'bilibili') return 'B站口播已复制。发动态或视频简介时粘贴即可。';
  if (channel.id === 'kuaishou') return '快手短文案已复制。发图文时输入框长按粘贴。';
  return `文案已复制。打开${channel.label}粘贴即可。`;
}
