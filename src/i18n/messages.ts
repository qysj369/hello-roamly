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
    /** 首屏入口：山野慢行 */
    ctaNiche: string;
    /** 首屏入口：野营栖居 */
    ctaBudget: string;
    /** 首屏入口：旅途手记 */
    ctaStories: string;
    /** 首屏入口：秘境漫游 */
    ctaImmerse: string;
  };
  quick: {
    suburb: string;
    budget: string;
    stories: string;
    aiPlan: string;
    buddy: string;
    sectionTitle: string;
    /** 旅行工具 8 宫格 / Hero 三入口 */
    cycling: string;
    budgetFine: string;
    storiesReal: string;
    immerse: string;
    camping: string;
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
    /** 社区板块浏览提示（无业务操作按钮） */
    browseHint: string;
    readMore: string;
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
    listTitle: string;
    listDesc: string;
    previewHighlights: string;
    previewSpots: string;
    previewFoods: string;
    previewTransit: string;
    previewEarthTip: string;
    goPlan: string;
    more: string;
  };
  clarify: {
    title: string;
    hint: string;
    city: string;
    days: string;
    party: string;
    budget: string;
    preference: string;
    stepCity: string;
    stepDays: string;
    stepParty: string;
    stepBudget: string;
    stepPreference: string;
    hintReady: string;
    voiceHint: string;
    confirm: string;
    skip: string;
  };
  inspire: {
    /** 漫游灵感（近郊小众种草） */
    sectionTitle: string;
    /** 场景六宫格分区标题 */
    scenesTitle: string;
    more: string;
    rock: string;
    farm: string;
    raft: string;
    shortRoam: string;
    nearbyTitle: string;
    goPlan: string;
  };
  tabs: {
    home: string;
    routes: string;
    stories: string;
    buddy: string;
    me: string;
    messages: string;
    advisor: string;
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
    /** 页脚小字标语 */
    motto: string;
    langZh: string;
    langEn: string;
    about: string;
    privacy: string;
    terms: string;
    contact: string;
    feedback: string;
    legalNav: string;
    copyright: string;
    placeholderHint: string;
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
    /** 移动端轻量预览 */
    mobilePreviewTitle: string;
    mobilePreviewDesc: string;
    mobilePreviewHint: string;
    /** 移动端无街景时：生成该城攻略 */
    mobileGeneratePlan: string;
    mobileNoVideoTitle: string;
    mobileNoVideoDesc: string;
  };
  search: {
    title: string;
    placeholder: string;
    submit: string;
    /** 生成漫行攻略 CTA */
    submitPlan: string;
    fromLabel: string;
    originHint: string;
    close: string;
    /** 空输入友好提示 */
    emptyHint: string;
  };
  menu: {
    open: string;
    close: string;
  };
  heroExtra: {
    enterCabin: string;
    mainVisual: string;
    bottomNav: string;
    shareLanding: string;
    shareLandingCity: string;
    shareLandingCta: string;
    shareLandingClose: string;
  };
  roamGuide: {
    text: string;
    close: string;
  };
  voice: {
    listening: string;
    hint: string;
    openAi: string;
    closeVoice: string;
    openVoice: string;
    unsupported: string;
    finish: string;
  };
  picker: {
    immerseEyebrow: string;
    cabinEyebrow: string;
    immerseTitle: string;
    cabinTitle: string;
    immerseHint: string;
    cabinHint: string;
    close: string;
    justNow: string;
  };
  tripCards: Record<
    string,
    {
      title: string;
      subtitle: string;
    }
  >;
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
  mobilePreviewTitle: '移动端街景预览',
  mobilePreviewDesc: '手机端为轻量预览。有路况视频可先看；完整驾驶舱建议用电脑打开。',
  mobilePreviewHint: '移动端轻量预览 · 完整驾驶舱建议使用电脑',
  mobileGeneratePlan: '生成该城漫行攻略',
  mobileNoVideoTitle: '本城暂无路况视频',
  mobileNoVideoDesc: '完整驾驶舱请用电脑打开。手机上可先生成漫行攻略，或回首页换城。',
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
  mobilePreviewTitle: 'Mobile street preview',
  mobilePreviewDesc:
    'Light mobile preview. Watch a road clip if available; full cabin works best on desktop.',
  mobilePreviewHint: 'Light mobile preview · full cabin works best on desktop',
  mobileGeneratePlan: 'Generate budget plan for this city',
  mobileNoVideoTitle: 'No road video for this city yet',
  mobileNoVideoDesc: 'Open the full cabin on desktop. On phone, generate a budget plan or pick another city.',
} as const;

export const zhMessages: HoloHomeMessages = {
  brand: {
    logo: '蜗牛旅行 HelloRoamly',
    slogan: '极简于心，慢行致远',
    snailTip: '蜗牛漫游：不赶路，感受路',
  },
  hero: {
    title: '极简于心，慢行致远',
    desc: '缓步山河，遇见不期而遇的风景',
    btn: '点击地球开启漫游',
    earthTip: '拖拽旋转 · 悬停查看热门目的地',
    guideTip: '悬停地球可查看济南、大理、杭州、阳朔等光点',
    ctaAi: 'AI 生成漫行行程',
    ctaDrive: '秘境街景漫游',
    ctaNiche: '山野慢行',
    ctaBudget: '野营栖居',
    ctaStories: '旅途手记',
    ctaImmerse: '秘境漫游',
  },
  quick: {
    suburb: '山野近途',
    budget: '长线预算',
    stories: '旅途手记',
    aiPlan: '智囊规划',
    buddy: '旅行搭子',
    sectionTitle: '慢行工具箱',
    cycling: '环湖骑行',
    budgetFine: '精打细算',
    storiesReal: '真实游记',
    immerse: '秘境漫游',
    camping: '星空露营',
  },
    track: {
    sectionTitle: '小众旅行赛道',
    suburbTitle: '近郊轻户外路线',
    suburbDesc: '周末短途、低预算轻装出发，适合城市周边松弛慢游。',
    budgetTitle: '长线漫行预算攻略',
    budgetDesc: '多天跨城行程与花费出处，做路线参考与出行规划。',
  },
  ugc: {
    sectionTitle: '蜗友在路上',
    storiesTitle: '游记预览',
    storiesDesc: '普通人真实短途松弛出行分享，慢慢挑、慢慢走。',
    storiesCta: '逛发现流',
    buddyTitle: '旅行搭子动态',
    buddyDesc: '同频出发的旅途分享，先读故事再决定要不要结伴。',
    buddyCta: '去招募 / 匹配',
    browseHint: '浏览小众赛道与真实游记；工具箱里可继续做路线参考与出行规划。',
    readMore: '阅读',
  },
  feature: {
    item1Title: '全球探索',
    item1Desc: '点击城市光点，直达当地驾驶舱街景',
    item2Title: '驾驶舱漫游',
    item2Desc: '第一人称行车视角，沉浸式欣赏沿路风光',
  },
  city: {
    sectionTitle: '热门城市',
    directTitle: '直达热门目的地',
    listTitle: '全部热门城市',
    listDesc: '按热门度浏览目的地，点选城市即可生成该城漫行攻略。',
    previewHighlights: '游玩亮点',
    previewSpots: '核心地标',
    previewFoods: '本地美食与街巷',
    previewTransit: '出行贴士',
    previewEarthTip: '点左侧地标锁定地球；可拖拽慢慢转看',
    goPlan: '去规划攻略',
    more: '更多',
  },
  clarify: {
    title: '慢慢告诉蜗牛',
    hint: '先记目的地，再按天数、同行、预算、偏好一步步补齐，然后生成漫行攻略。',
    city: '出行城市',
    days: '出行天数',
    party: '同行人群',
    budget: '大致预算',
    preference: '旅行偏好',
    stepCity: '想去哪一座城慢慢逛？说城市名，或写在下面也可以。',
    stepDays: '打算走几天？点选下方天数。',
    stepParty: '这次是单人、亲子、情侣，还是好友结伴？点选或说出来。',
    stepBudget: '大概准备花多少？点选或说出大概金额。',
    stepPreference: '更想怎么玩？点选一个偏好，蜗牛会按这个节奏写。',
    hintReady: '都齐了，蜗牛这就去写漫行攻略…',
    voiceHint: '也可以点麦克风，用语音补这一项。',
    confirm: '开始规划',
    skip: '先等等',
  },
  inspire: {
    sectionTitle: '漫游灵感',
    scenesTitle: '近郊小众场景',
    more: '更多',
    rock: '山野近憩',
    farm: '野营栖居',
    raft: '溪涧漂流',
    shortRoam: '短途漫游',
    nearbyTitle: '适合的近郊目的地',
    goPlan: '规划这个行程',
  },
  tabs: {
    home: '首页',
    routes: '路线',
    stories: '游记',
    buddy: '搭子',
    me: '我的',
    messages: '消息',
    advisor: '管家',
  },
  guide: {
    sectionTitle: '小众漫行攻略',
    entry: '查看全部 AI 平价旅行路线',
  },
  review: {
    text: '点地球就能慢行一座城——极简、真实、不赶路',
  },
  nav: {
    guides: '漫行攻略',
    cities: '目的地',
    saved: '我的收藏',
  },
  footer: {
    line: '蜗牛旅行 HelloRoamly | 极简于心，慢行致远',
    motto: '蜗牛旅行｜路慢，方能读懂山河',
    langZh: '中文',
    langEn: 'EN',
    about: '关于我们',
    privacy: '隐私政策',
    terms: '用户协议',
    contact: '联系我们',
    feedback: '意见反馈',
    legalNav: '页脚导航',
    copyright: '© 2026 HelloRoamly 蜗牛旅行 版权所有',
    placeholderHint: '本页为合规信息占位，正文将单独完善。',
  },
  drive: { ...driveZh },
  search: {
    title: '搜索目的地或攻略',
    placeholder: '输入目的地',
    submit: '搜索',
    submitPlan: '生成漫行方案',
    fromLabel: '出发地',
    originHint: '将使用浏览器定位作为出发地（若已授权）',
    close: '关闭',
    emptyHint: '请先输入目的地，再生成漫行攻略',
  },
  menu: {
    open: '打开菜单',
    close: '收起菜单',
  },
  heroExtra: {
    enterCabin: '点击进入驾驶舱',
    mainVisual: '主视觉',
    bottomNav: '底部导航',
    shareLanding: '朋友用海报把你带到这里。点「打开行程」接着看完整参考——免费、无推销。',
    shareLandingCity: '朋友分享了「{city}」行程。点「打开行程」接着看，不用从首页再搜一遍。',
    shareLandingCta: '打开行程',
    shareLandingClose: '关闭分享提示',
  },
  roamGuide: {
    text: '慢行工具箱里的「秘境漫游」可进入驾驶舱',
    close: '关闭提示',
  },
  voice: {
    listening: '正在听…',
    hint: '说出目的地与天数，停顿约 2 秒自动规划',
    openAi: '打开 AI 顾问',
    closeVoice: '结束收音',
    openVoice: '语音输入',
    unsupported: '该设备暂不支持语音输入',
    finish: '说完了',
  },
  picker: {
    immerseEyebrow: '秘境漫游',
    cabinEyebrow: '街景驾驶舱',
    immerseTitle: '选一座热门城，缓步出发',
    cabinTitle: '选一座城，出发漫游',
    immerseHint: '有街景/视频进驾驶舱；本城暂无素材时直接生成漫行攻略',
    cabinHint: '点击城市进入第一人称街景驾驶舱',
    close: '关闭',
    justNow: '刚才',
  },
  tripCards: {
    farmstay: { title: '山野农家', subtitle: '采摘闲坐·亲子时光' },
    camping: { title: '星空露营', subtitle: '近郊过夜·枕星而眠' },
    heritage: { title: '非遗市集', subtitle: '手作慢逛·老街烟火' },
    rafting: { title: '溪谷轻游', subtitle: '浅水缓行·近郊半日' },
    cycling: { title: '环湖骑行', subtitle: '平缓绿道·亲子可随' },
    nighttown: { title: '古镇夜游', subtitle: '灯影街巷·慢步夜色' },
  },
};

export const enMessages: HoloHomeMessages = {
  brand: {
    logo: 'HelloRoamly',
    slogan: 'Minimal Heart, Slow Travel',
    snailTip: 'Snail Travel: Slow down to feel the world',
  },
  hero: {
    title: 'Minimal heart, slow travel',
    desc: 'Walk the mountains slowly, meet unplanned scenery',
    btn: 'Click the globe to roam',
    earthTip: 'Drag to spin · hover for city lights',
    guideTip: 'Hover the globe to reveal Jinan, Dali, Hangzhou, Yangshuo',
    ctaAi: 'AI budget itinerary',
    ctaDrive: 'Secret-realm street roam',
    ctaNiche: 'Mountain walks',
    ctaBudget: 'Wild camping',
    ctaStories: 'Trail notes',
    ctaImmerse: 'Secret roam',
  },
  quick: {
    suburb: 'Near trails',
    budget: 'Long-haul',
    stories: 'Trail notes',
    aiPlan: 'AI guide',
    buddy: 'Travel buddies',
    sectionTitle: 'Slow toolbox',
    cycling: 'Lakeside cycling',
    budgetFine: 'Smart budget',
    storiesReal: 'Real notes',
    immerse: 'Secret roam',
    camping: 'Star camping',
  },
  track: {
    sectionTitle: 'Niche travel tracks',
    suburbTitle: 'Nearby light outdoors',
    suburbDesc: 'Weekend escapes with light packs and small budgets.',
    budgetTitle: 'Long-haul budget guides',
    budgetDesc: 'Multi-day routes with clear spend notes.',
  },
  ugc: {
    sectionTitle: 'Friends on the road',
    storiesTitle: 'Story previews',
    storiesDesc: 'Real moments and route ideas from fellow travelers.',
    storiesCta: 'Open Discover',
    buddyTitle: 'Buddy updates',
    buddyDesc: 'Read stories first; recruit from the toolbox below.',
    buddyCta: 'Recruit / match',
    browseHint: 'Browse tracks, notes and buddy posts. Publish or recruit in the Slow toolbox.',
    readMore: 'Read',
  },
  feature: {
    item1Title: 'Global explore',
    item1Desc: 'Tap a city light to enter the driving cabin',
    item2Title: 'Cabin roam',
    item2Desc: 'First-person driving view along the road',
  },
  city: {
    sectionTitle: 'Popular cities',
    directTitle: 'Go to popular spots',
    listTitle: 'All popular cities',
    listDesc: 'Browse by popularity. Tap a city to generate its budget travel plan.',
    previewHighlights: 'Highlights',
    previewSpots: 'Key landmarks',
    previewFoods: 'Local food & lanes',
    previewTransit: 'Getting around',
    previewEarthTip: 'Tap a landmark to lock the globe; drag to look around',
    goPlan: 'Plan this trip',
    more: 'More',
  },
  clarify: {
    title: 'A soft check-in',
    hint: 'Fill city, days, companions, budget and preference before we draft the plan.',
    city: 'City',
    days: 'Days',
    party: 'Traveling with',
    budget: 'Rough budget',
    preference: 'Preference',
    stepCity: 'Which city shall we wander?',
    stepDays: 'How many days? Tap a choice below.',
    stepParty: 'Solo, family, couple, or friends? Tap or speak.',
    stepBudget: 'Rough budget — tap or say an amount.',
    stepPreference: 'What mood fits — tap one preference.',
    hintReady: 'All set — drafting your soft plan…',
    voiceHint: 'Or tap the mic to answer by voice.',
    confirm: 'Start planning',
    skip: 'Not now',
  },
  inspire: {
    sectionTitle: 'Roam inspo',
    scenesTitle: 'Nearby niche scenes',
    more: 'More',
    rock: 'Mountain rest',
    farm: 'Wild camping',
    raft: 'Creek rafting',
    shortRoam: 'Short roam',
    nearbyTitle: 'Nearby places that fit',
    goPlan: 'Plan this itinerary',
  },
  tabs: {
    home: 'Home',
    routes: 'Routes',
    stories: 'Stories',
    buddy: 'Buddies',
    me: 'Me',
    messages: 'Messages',
    advisor: 'Butler',
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
    motto: 'HelloRoamly｜Go slow to read the mountains',
    langZh: '中文',
    langEn: 'EN',
    about: 'About',
    privacy: 'Privacy',
    terms: 'Terms',
    contact: 'Contact',
    feedback: 'Feedback',
    legalNav: 'Footer links',
    copyright: '© 2026 HelloRoamly. All rights reserved.',
    placeholderHint: 'Placeholder page — full legal copy will be published later.',
  },
  drive: { ...driveEn },
  search: {
    title: 'Search places or guides',
    placeholder: 'Enter a destination',
    submit: 'Search',
    submitPlan: 'Generate budget plan',
    fromLabel: 'From',
    originHint: 'Will use your browser location as origin when available',
    close: 'Close',
    emptyHint: 'Please enter a destination first',
  },
  menu: {
    open: 'Open menu',
    close: 'Close menu',
  },
  heroExtra: {
    enterCabin: 'Enter the cabin',
    mainVisual: 'Hero',
    bottomNav: 'Bottom navigation',
    shareLanding:
      'A friend shared a slow-travel plan. Open the itinerary to see the full reference — free, no selling.',
    shareLandingCity:
      'A friend shared a {city} itinerary. Open it to continue — no need to search again from the home page.',
    shareLandingCta: 'Open itinerary',
    shareLandingClose: 'Dismiss share tip',
  },
  roamGuide: {
    text: 'Open “Secret roam” in the Slow toolbox to enter the cabin',
    close: 'Dismiss tip',
  },
  voice: {
    listening: 'Listening…',
    hint: 'Say destination and days; pause ~2s to plan',
    openAi: 'Open AI advisor',
    closeVoice: 'Stop listening',
    openVoice: 'Voice input',
    unsupported: 'Voice input is not supported on this device',
    finish: 'Done speaking',
  },
  picker: {
    immerseEyebrow: 'Secret roam',
    cabinEyebrow: 'Street cabin',
    immerseTitle: 'Pick a city and ease into the road',
    cabinTitle: 'Pick a city to start roaming',
    immerseHint: 'Opens cockpit when street view/video exists; otherwise generates a budget plan',
    cabinHint: 'Tap a city to enter the first-person cabin',
    close: 'Close',
    justNow: 'Just now',
  },
  tripCards: {
    farmstay: { title: 'Mountain farmstay', subtitle: 'Picking · easy family time' },
    camping: { title: 'Starry camping', subtitle: 'Near-city night · under stars' },
    heritage: { title: 'Heritage market', subtitle: 'Handmade · old-street fire' },
    rafting: { title: 'Gentle valley walk', subtitle: 'Shallow water · half-day ease' },
    cycling: { title: 'Lakeside cycling', subtitle: 'Easy greenway · family pace' },
    nighttown: { title: 'Old town night', subtitle: 'Lantern lanes · slow night stroll' },
  },
};

export const messagesByLocale: Record<AppLocale, HoloHomeMessages> = {
  zh: zhMessages,
  en: enMessages,
};
