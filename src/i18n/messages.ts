export type AppLocale = 'zh' | 'en';

export type HoloHomeMessages = {
  brand: {
    logo: string;
    slogan: string;
    snailTip: string;
  };
  hero: {
    title: string;
    desc: string;
    btn: string;
    earthTip: string;
    guideTip: string;
    ctaAi: string;
    ctaDrive: string;
    /** 首屏三大入口：小众路线 */
    ctaNiche: string;
    /** 首屏三大入口：精巧露营 */
    ctaBudget: string;
    /** 首屏三大入口：真实游记 */
    ctaStories: string;
  };
  quick: {
    suburb: string;
    budget: string;
    stories: string;
    aiPlan: string;
    buddy: string;
    sectionTitle: string;
  };
  track: {
    sectionTitle: string;
    suburbTitle: string;
    suburbDesc: string;
    budgetTitle: string;
    budgetDesc: string;
  };
  ugc: {
    sectionTitle: string;
    storiesTitle: string;
    storiesDesc: string;
    storiesCta: string;
    buddyTitle: string;
    buddyDesc: string;
    buddyCta: string;
  };
  feature: {
    item1Title: string;
    item1Desc: string;
    item2Title: string;
    item2Desc: string;
  };
  city: {
    sectionTitle: string;
    directTitle: string;
  };
  inspire: {
    /** 卡片流分区标题 */
    sectionTitle: string;
    more: string;
    rock: string;
    farm: string;
    raft: string;
    budget: string;
  };
  tabs: {
    home: string;
    routes: string;
    stories: string;
    buddy: string;
    me: string;
  };
  guide: {
    sectionTitle: string;
    entry: string;
  };
  review: {
    text: string;
  };
  nav: {
    guides: string;
    cities: string;
    saved: string;
  };
  footer: {
    line: string;
    langZh: string;
    langEn: string;
  };
  drive: {
    badge: string;
    loadingTitle: string;
    loadingDesc: string;
    providerNote: string;
    backNav: string;
    backHome: string;
    viewGuides: string;
    streetLoading: string;
    streetUnavailableTitle: string;
    streetUnavailableDesc: string;
    streetError: string;
    streetConfigError: string;
    tryStreetCity: string;
    speedUnit: string;
    tempLabel: string;
    tempLoading: string;
    tempUnavailable: string;
    play: string;
    pause: string;
    speedSnail: string;
    speedCruise: string;
    speedSport: string;
    driveHint: string;
    videoHint: string;
    videoError: string;
    videoDemoBadge: string;
    modeSwitchLabel: string;
    modeVideo: string;
    modeMapillary: string;
    modeBaidu: string;
    contributeBtn: string;
    contributeTitle: string;
    contributeDesc: string;
    contributeTitlePlaceholder: string;
    contributeDropIdle: string;
    contributeDropActive: string;
    contributeSubmit: string;
    contributeCancel: string;
    contributeSuccess: string;
    contributeLimitHint: string;
    mapillaryHint: string;
    mapillaryUnavailableTitle: string;
    mapillaryUnavailableDesc: string;
    mapillaryError: string;
    mapillaryConfigError: string;
    roadEnd: string;
  };
};

const driveZh = {
  badge: '驾驶舱',
  loadingTitle: '街景筹备中',
  loadingDesc: '第一人称行车视角即将开放。可先查攻略，或回地球继续选城。',
  providerNote: '百度街景 · 可调车速巡航',
  backNav: '← 返回',
  backHome: '回地球首页',
  viewGuides: '查攻略',
  streetLoading: '街景加载中…',
  streetUnavailableTitle: '该城市暂无街景',
  streetUnavailableDesc: '可试试下方有街景的城市，或先查攻略。',
  streetError: '街景加载失败，请稍后重试',
  streetConfigError: '未配置百度地图 AK，请在 .env.local 设置 VITE_BAIDU_MAP_AK',
  tryStreetCity: '看街景',
  speedUnit: 'km/h',
  tempLabel: '车外',
  tempLoading: '…',
  tempUnavailable: '--℃',
  play: '出发',
  pause: '停车',
  speedSnail: '稳妥',
  speedCruise: '常态',
  speedSport: '稍快',
  driveHint: '按前方路况自动加减速 · 可拖动环顾',
  videoHint: '真实路况视频 · 时快时慢模拟开车',
  videoError: '实拍视频加载失败，可切换百度街景',
  videoDemoBadge: '演示片（请替换为城市实拍）',
  modeSwitchLabel: '驾驶画面来源',
  modeVideo: '真实视频',
  modeMapillary: '连续序列',
  modeBaidu: '百度街景',
  contributeBtn: '投稿本城视频',
  contributeTitle: '上传本城漫游视频',
  contributeDesc: '为「{city}」贡献第一人称路况视频，保存在本机，立刻可在驾驶舱播放。',
  contributeTitlePlaceholder: '例如：西湖沿线午后漫游',
  contributeDropIdle: '拖拽或点击选择视频',
  contributeDropActive: '松开即可添加',
  contributeSubmit: '保存并播放',
  contributeCancel: '关闭',
  contributeSuccess: '已保存！审核通过后可点「出发」播放；本机也会保留备份。',
  contributeLimitHint: '支持 mp4/webm/mov，最大 80MB（优先云端，失败则本机）',
  mapillaryHint: 'Mapillary 连续序列 · 有覆盖即可漫游',
  mapillaryUnavailableTitle: '附近暂无 Mapillary 序列',
  mapillaryUnavailableDesc: '可切换真实视频或百度街景，也可投稿本城视频。',
  mapillaryError: 'Mapillary 加载失败',
  mapillaryConfigError: '未配置 VITE_MAPILLARY_ACCESS_TOKEN',
  roadEnd: '前方路段暂无街景，已停车',
} as const;

const driveEn = {
  badge: 'Cabin',
  loadingTitle: 'Street view coming soon',
  loadingDesc: 'First-person driving view is on the way. Browse guides or return to the globe.',
  providerNote: 'Baidu street view · cruise at your pace',
  backNav: '← Back',
  backHome: 'Globe home',
  viewGuides: 'Guides',
  streetLoading: 'Loading street view…',
  streetUnavailableTitle: 'No street view in this city',
  streetUnavailableDesc: 'Try a covered city below, or browse guides.',
  streetError: 'Street view failed to load',
  streetConfigError: 'Missing VITE_BAIDU_MAP_AK in environment',
  tryStreetCity: 'View',
  speedUnit: 'km/h',
  tempLabel: 'Outside',
  tempLoading: '…',
  tempUnavailable: '--℃',
  play: 'Drive',
  pause: 'Stop',
  speedSnail: 'Easy',
  speedCruise: 'Normal',
  speedSport: 'Brisk',
  driveHint: 'Speed follows the road ahead · drag to look around',
  videoHint: 'Real road video · pace changes like driving',
  videoError: 'Video failed — try Baidu street view',
  videoDemoBadge: 'Demo clip (replace with city dashcam)',
  modeSwitchLabel: 'Drive media source',
  modeVideo: 'Real video',
  modeMapillary: 'Sequence',
  modeBaidu: 'Baidu pano',
  contributeBtn: 'Contribute city video',
  contributeTitle: 'Upload a city drive video',
  contributeDesc: 'Share a first-person drive clip for “{city}”. Saved on this device and playable immediately.',
  contributeTitlePlaceholder: 'e.g. Afternoon lakeside cruise',
  contributeDropIdle: 'Drop or click to choose a video',
  contributeDropActive: 'Release to add',
  contributeSubmit: 'Save & play',
  contributeCancel: 'Close',
  contributeSuccess: 'Saved! Play after approval — a local backup is kept if cloud is offline.',
  contributeLimitHint: 'mp4/webm/mov up to 80MB (cloud first, local fallback)',
  mapillaryHint: 'Mapillary sequence · play where covered',
  mapillaryUnavailableTitle: 'No Mapillary sequence nearby',
  mapillaryUnavailableDesc: 'Try real video, Baidu, or contribute a clip.',
  mapillaryError: 'Mapillary failed to load',
  mapillaryConfigError: 'Missing VITE_MAPILLARY_ACCESS_TOKEN',
  roadEnd: 'No more street view ahead — stopped',
} as const;

export const zhMessages: HoloHomeMessages = {
  brand: {
    logo: '蜗牛旅行 HelloRoamly',
    slogan: '极简于心，慢行致远',
    snailTip: '蜗牛漫游：不赶路，感受路',
  },
  hero: {
    title: '把旅行慢下来',
    desc: '为Z世代打造真实、随性、可落地的旅游体验',
    btn: '点击地球开启漫游',
    earthTip: '拖拽旋转 · 悬停查看热门目的地',
    guideTip: '悬停地球可查看济南、大理、杭州、阳朔等光点',
    ctaAi: 'AI 生成穷游行程',
    ctaDrive: '沉浸式街景漫游',
    ctaNiche: '小众路线',
    ctaBudget: '精巧露营',
    ctaStories: '真实游记',
  },
  quick: {
    suburb: '近郊路线',
    budget: '长线预算',
    stories: '游记灵感',
    aiPlan: 'AI规划',
    buddy: '招募旅行搭子',
    sectionTitle: '旅行工具',
  },
  track: {
    sectionTitle: '小众旅行赛道',
    suburbTitle: '近郊轻户外路线',
    suburbDesc: '周末短途、低预算轻装出发，适合城市周边慢游。',
    budgetTitle: '长线穷游预算攻略',
    budgetDesc: '多天跨城行程与花费出处，帮你把每一分花在刀刃上。',
  },
  ugc: {
    sectionTitle: '蜗友在路上',
    storiesTitle: '游记预览',
    storiesDesc: '看看真实旅途瞬间与路线灵感，慢慢挑、慢慢走。',
    storiesCta: '逛发现流',
    buddyTitle: '旅行搭子',
    buddyDesc: '同频出发、结伴穷游，找到愿意一起慢行的人。',
    buddyCta: '去招募 / 匹配',
  },
  feature: {
    item1Title: '全球探索',
    item1Desc: '点击城市光点，直达当地驾驶舱街景',
    item2Title: '驾驶舱漫游',
    item2Desc: '第一人称行车视角，沉浸式欣赏沿路风光',
  },
  city: {
    sectionTitle: '热门目的地',
    directTitle: '直达热门目的地',
  },
  inspire: {
    sectionTitle: '卡片流',
    more: '更多',
    rock: '近郊游憩',
    farm: '农家乐',
    raft: '漂流',
    budget: '长线预算',
  },
  tabs: {
    home: '首页',
    routes: '路线',
    stories: '游记',
    buddy: '搭子',
    me: '我的',
  },
  guide: {
    sectionTitle: '小众穷游攻略',
    entry: '查看全部 AI 平价旅行路线',
  },
  review: {
    text: '点地球就能慢行一座城——极简、真实、不赶路',
  },
  nav: {
    guides: '穷游攻略',
    cities: '目的地',
    saved: '我的收藏',
  },
  footer: {
    line: '蜗牛旅行 HelloRoamly | 极简于心，慢行致远',
    langZh: '中文',
    langEn: 'EN',
  },
  drive: { ...driveZh },
};

export const enMessages: HoloHomeMessages = {
  brand: {
    logo: 'HelloRoamly',
    slogan: 'Minimal Heart, Slow Travel',
    snailTip: 'Snail Travel: Slow down to feel the world',
  },
  hero: {
    title: 'Slow travel down',
    desc: 'Real, easygoing, doable budget travel for Gen Z',
    btn: 'Click the globe to roam',
    earthTip: 'Drag to spin · hover for city lights',
    guideTip: 'Hover the globe to reveal Jinan, Dali, Hangzhou, Yangshuo',
    ctaAi: 'AI budget itinerary',
    ctaDrive: 'Immersive street roam',
    ctaNiche: 'Niche routes',
    ctaBudget: 'Boutique camping',
    ctaStories: 'Real stories',
  },
  quick: {
    suburb: 'Nearby',
    budget: 'Long-haul',
    stories: 'Stories',
    aiPlan: 'AI plan',
    buddy: 'Find a travel buddy',
    sectionTitle: 'Travel tools',
  },
  track: {
    sectionTitle: 'Niche travel tracks',
    suburbTitle: 'Nearby light outdoors',
    suburbDesc: 'Weekend escapes with light packs and small budgets.',
    budgetTitle: 'Long-haul budget guides',
    budgetDesc: 'Multi-day routes with clear spend notes.',
  },
  ugc: {
    sectionTitle: 'Community on the road',
    storiesTitle: 'Story previews',
    storiesDesc: 'Real moments and route ideas from fellow travelers.',
    storiesCta: 'Open Discover',
    buddyTitle: 'Travel buddies',
    buddyDesc: 'Match with people who want to roam slowly together.',
    buddyCta: 'Recruit / match',
  },
  feature: {
    item1Title: 'Global explore',
    item1Desc: 'Tap a city light to enter the driving cabin',
    item2Title: 'Cabin roam',
    item2Desc: 'First-person driving view along the road',
  },
  city: {
    sectionTitle: 'Popular spots',
    directTitle: 'Go to popular spots',
  },
  inspire: {
    sectionTitle: 'Card stream',
    more: 'More',
    rock: 'Nearby getaways',
    farm: 'Farm stay',
    raft: 'Rafting',
    budget: 'Long-haul budget',
  },
  tabs: {
    home: 'Home',
    routes: 'Routes',
    stories: 'Stories',
    buddy: 'Buddies',
    me: 'Me',
  },
  guide: {
    sectionTitle: 'Budget travel guides',
    entry: 'Browse all AI budget routes',
  },
  review: {
    text: 'Tap the globe and slow-travel a city — minimal and real',
  },
  nav: {
    guides: 'Guides',
    cities: 'Destinations',
    saved: 'Saved',
  },
  footer: {
    line: 'HelloRoamly | Minimal Heart, Slow Travel',
    langZh: '中文',
    langEn: 'EN',
  },
  drive: { ...driveEn },
};

export const messagesByLocale: Record<AppLocale, HoloHomeMessages> = {
  zh: zhMessages,
  en: enMessages,
};
