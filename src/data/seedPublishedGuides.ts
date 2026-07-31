import { DEMO_CURRENT_USER_ID } from '@/data/demoUsers';
import type { GuidePublishEditorDraft, PublishedGuideRecord } from '@/types/domain/guidePublish';
import type { UserId } from '@/types/domain/user/userId';
import {
  buildStructuredGuideContent,
  editorDraftToListMeta,
  syncDailyJournalWithDays,
} from '@/utils/guidePublishDraft';

export const SEED_PUBLISHED_GUIDE_IDS = [
  'user-guide-seed-xian-3d',
  'user-guide-seed-chengdu-3d',
  'user-guide-seed-xiamen-4d',
  'user-guide-seed-chongqing-3d',
  'user-guide-seed-hangzhou-3d',
  'user-guide-seed-dali-4d',
  'user-guide-seed-changsha-3d',
  'user-guide-seed-qingdao-3d',
  'user-guide-seed-nanjing-3d',
] as const;

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function buildSeedRecord(
  draft: GuidePublishEditorDraft,
  options: {
    id: string;
    authorId: UserId;
    publishedAt: string;
    aiAssisted?: boolean;
  },
): PublishedGuideRecord {
  const normalized = syncDailyJournalWithDays(draft);
  const content = buildStructuredGuideContent(normalized, options.id);
  return {
    id: options.id,
    authorId: options.authorId,
    listMeta: {
      ...editorDraftToListMeta(normalized, options.id),
      updatedAt: options.publishedAt,
    },
    content: { ...content, id: options.id },
    publishedAt: options.publishedAt,
    aiAssisted: options.aiAssisted ?? false,
  };
}

const XIAN_DRAFT: GuidePublishEditorDraft = {
  title: '西安三天硬壳穷游：城墙骑行 + 兵马俑错峰',
  destination: '西安',
  days: '3',
  budgetLabel: '人均 ¥1000–2000',
  interests: '文化、美食、预算',
  costBreakdown: {
    transportation: {
      amount: '318',
      savingTips:
        '提前 15 天抢二等座高铁；市区地铁日票不如长安通电子卡划算，押金可退\n钟楼—兵马俑乘地铁 9 号线转公交 613，比黑车便宜一半',
    },
    accommodation: {
      amount: '396',
      savingTips:
        '住钟楼/南门附近青旅床位，约 ¥120–140/晚\n避开节假日，连住 3 晚可谈价到 ¥110/晚',
    },
    food: {
      amount: '368',
      savingTips:
        '回民街主街只逛不吃，钻北院门、大皮院巷子\n早餐吃洒金桥肉丸胡辣汤+牛肉饼，人均 ¥15 管饱',
    },
    entertainment: {
      amount: '398',
      savingTips:
        '兵马俑提前 3 天在「秦始皇帝陵博物院」官微预约，门票 ¥120\n城墙建议 19:00 后上，部分日期有惠民票',
    },
    total: '1480',
  },
  dailyJournal: [
    {
      day: 1,
      narrative:
        '中午抵达西安北站，地铁 2 号线到钟楼站（约 45 分钟 ¥5）。放下行李后步行登南门城墙，租自行车环骑 13.7 公里（约 1.5 小时 ¥45）。傍晚下城墙逛书院门，晚餐在大皮院吃老孙家牛肉泡馍（馍自己掰更入味，¥28）。',
      expenses: [
        { item: '高铁二等座（邻省参考）', amount: '268' },
        { item: '地铁 + 公交', amount: '12' },
        { item: '城墙门票 + 租车', amount: '70' },
        { item: '牛肉泡馍 + 酸梅汤', amount: '32' },
      ],
      tips: '城墙日落约 18:30，建议 17:00 前上墙\n南门租车点排队最长，可改永宁门西侧入口',
    },
    {
      day: 2,
      narrative:
        '早起地铁 9 号线到华清池站，转公交 613 到兵马俑（全程约 1.5 小时）。务必跟免费讲解排队，或提前 B 站看讲解再进坑。下午返回市区，傍晚逛大唐不夜城（免费），夜景拍照足够，不必买周边。',
      expenses: [
        { item: '兵马俑门票', amount: '120' },
        { item: '往返交通', amount: '18' },
        { item: '午餐（景区外农家乐）', amount: '35' },
        { item: '晚餐（回民街巷子）', amount: '42' },
      ],
      tips: '兵马俑 8:30 开园，第一批进 1 号坑人最少\n丽山园含在门票里，别被「另收费」忽悠',
    },
    {
      day: 3,
      narrative:
        '上午陕西历史博物馆（需提前 5 天预约基本陈列馆，免费）。若约不到，改逛小雁塔+西安博物院（免费、人少）。中午吃秦豫肉夹馍（东木头市店），下午洒金桥买腊牛肉当伴手礼，傍晚高铁返程。',
      expenses: [
        { item: '地铁 + 共享单车', amount: '10' },
        { item: '肉夹馍 + 凉皮 + 冰峰', amount: '28' },
        { item: '伴手礼腊牛肉', amount: '58' },
        { item: '返程高铁', amount: '268' },
      ],
      tips: '陕历博预约放票时间固定，设闹钟\n小雁塔周一可能闭馆，出发前查公告',
    },
  ],
  snailInsights: {
    regrets:
      '不要在回民街主街吃羊肉泡馍，价高味平。兵马俑门口「假公交」会拉你去购物店，认准公交 613 官方站牌。城墙中午暴晒，没防晒会晒到怀疑人生。',
    recommendations:
      '宝藏点：洒金桥马老四肉丸胡辣汤（早去），秦豫肉夹馍东木头市店。陕历约不到就去西安博物院，空调足、文物精。晚上城墙灯亮后比白天更出片。',
  },
};

const CHENGDU_DRAFT: GuidePublishEditorDraft = {
  title: '成都三天慢爬：熊猫基地早起 + 青城山前山',
  destination: '成都',
  days: '3',
  budgetLabel: '人均 ¥1000–2000',
  interests: '美食、自然、文化',
  costBreakdown: {
    transportation: {
      amount: '286',
      savingTips:
        '市区地铁 + 天府通 NFC 够用；去青城山在犀浦站换乘城际（¥10）\n熊猫基地建议直拨景区直通车，比打车便宜',
    },
    accommodation: {
      amount: '360',
      savingTips: '住宽窄巷子外围/文殊院附近青旅，¥110–130/晚\n避开周五周六，床位可降到 ¥100',
    },
    food: {
      amount: '412',
      savingTips:
        '火锅选社区店（如玉林片区），避开网红排号店\n早餐吃钟水饺+担担面，人均 ¥12',
    },
    entertainment: {
      amount: '292',
      savingTips:
        '熊猫基地门票 ¥55，必须早 7:30 前到\n青城山前山门票 ¥80，索道上行 ¥35 可按体力选择',
    },
    total: '1350',
  },
  dailyJournal: [
    {
      day: 1,
      narrative:
        '抵达后住文殊院附近，下午逛宽窄巷子（只拍照不买小吃），晚餐在魁星楼街吃冒烤鸭+冰粉（人均 ¥45）。晚上人民公园鹤鸣茶社喝茶（盖碗茶 ¥15），体验掏耳朵可砍价。',
      expenses: [
        { item: '市内交通', amount: '8' },
        { item: '冒烤鸭 + 冰粉', amount: '48' },
        { item: '盖碗茶', amount: '15' },
      ],
      tips: '宽窄巷子主巷物价高，侧巷同样好看\n鹤鸣茶社下午人多，想安静可早去',
    },
    {
      day: 2,
      narrative:
        '6:00 出发熊猫基地，7:15 到月亮产房看幼崽喂食。上午看完步行下山，下午地铁到犀浦，城际到青城山站，住山脚农家（¥90）。傍晚在山脚吃腊肉炒饭。',
      expenses: [
        { item: '熊猫基地门票 + 直通车', amount: '78' },
        { item: '城际 + 公交', amount: '24' },
        { item: '山脚住宿', amount: '90' },
        { item: '晚餐', amount: '32' },
      ],
      tips: '熊猫上午活跃，下午大多睡觉\n自带干粮，景区内烤肠 ¥8 一根',
    },
    {
      day: 3,
      narrative:
        '早起爬青城山前山（约 3 小时到上清宫），体力不够可索道上行步行下。中午山脚吃青城老腊肉。下午城际回成都东站，若时间够可买叶婆婆钵钵鸡当晚餐（人均 ¥35）。',
      expenses: [
        { item: '青城山门票 + 索道', amount: '115' },
        { item: '午餐 + 钵钵鸡', amount: '58' },
        { item: '返程交通', amount: '35' },
      ],
      tips: '青城山雨后石阶滑，穿防滑鞋\n前山道观多，后山更野但交通不便',
    },
  ],
  snailInsights: {
    regrets:
      '周末熊猫基地人挤人，月亮产房排队 1 小时起。宽窄巷子「网红奶茶」性价比低。青城山门口黑导游别信，自己买票走官方栈道。',
    recommendations:
      '宝藏点：文殊院洞子口张老二凉粉，魁星楼冒烤鸭。熊猫基地看「熊猫塔」展区人少。青城山山脚「张醪糟」汤圆好吃不贵。',
  },
};

const XIAMEN_DRAFT: GuidePublishEditorDraft = {
  title: '厦门四天蹭宿版：鼓浪屿船票 + 八市海鲜自己挑',
  destination: '厦门',
  days: '4',
  budgetLabel: '人均 ¥1000–2000',
  interests: '美食、海岛、摄影',
  costBreakdown: {
    transportation: {
      amount: '342',
      savingTips:
        '高铁到厦门站比厦门北站离市区近；上岛船票提前在「厦门轮渡」官微买 ¥35 往返\n岛内公交 1 元，BRT 很快',
    },
    accommodation: {
      amount: '480',
      savingTips:
        '住沙坡尾/曾厝垵外围民宿床位 ¥100–130/晚\n连住 4 晚可送洗衣机烘干',
    },
    food: {
      amount: '468',
      savingTips:
        '八市买海鲜到「小眼镜」旁代加工店，加工费 ¥15/斤\n沙茶面选佳味添或月华，别在中山路主街吃',
    },
    entertainment: {
      amount: '230',
      savingTips:
        '鼓浪屿联票已取消，核心景点单独买更划算\n厦大需预约，约不到改逛南普陀（免费）',
    },
    total: '1520',
  },
  dailyJournal: [
    {
      day: 1,
      narrative:
        '抵达厦门站，地铁到沙坡尾放行李。傍晚演武大桥观景台看日落（免费），晚餐在大学路吃姜母鸭半只（¥68 两人分）。夜逛沙坡尾艺术西区，咖啡街只拍照不消费。',
      expenses: [
        { item: '高铁参考', amount: '286' },
        { item: '地铁 + 公交', amount: '6' },
        { item: '姜母鸭 + 米饭', amount: '38' },
      ],
      tips: '演武大桥日落机位在世茂双子塔对面沙滩\n姜母鸭偏咸，配米饭和汤',
    },
    {
      day: 2,
      narrative:
        '早上 8:00 轮渡上鼓浪屿，走港仔后路—日光岩—菽庄花园路线。中午在龙头路巷子吃土笋冻+海蛎煎（¥25）。下午逛风琴博物馆，17:00 前离岛避开人流。晚上中山路吃沙茶面。',
      expenses: [
        { item: '轮渡 + 日光岩门票', amount: '95' },
        { item: '小吃午餐', amount: '28' },
        { item: '沙茶面晚餐', amount: '18' },
      ],
      tips: '船票选「邮轮中心—三丘田」航线\n日光岩 9 点前到人少',
    },
    {
      day: 3,
      narrative:
        '上午八市买花蛤、皮皮虾，找代加工店（加工费约 ¥30）。下午南普陀寺 + 五老峰（免费，爬山约 1 小时）。傍晚曾厝垵海边散步，不吃主街烧烤。',
      expenses: [
        { item: '海鲜采购 + 加工', amount: '85' },
        { item: '饮料水果', amount: '15' },
        { item: '公交', amount: '4' },
      ],
      tips: '八市 10 点前最新鲜，讲价正常\n代加工看清单价，防止按「斤」乱收费',
    },
    {
      day: 4,
      narrative:
        '上午集美学村 + 嘉庚建筑（地铁 1 号线海上段风景好）。中午在石鼓路吃烧肉粽。下午买黄胜记肉松、阿吉仔馅饼当伴手礼（约 ¥80），提前 2 小时去厦门北站返程。',
      expenses: [
        { item: '地铁 + 小吃', amount: '32' },
        { item: '伴手礼', amount: '80' },
        { item: '返程高铁', amount: '286' },
      ],
      tips: '集美适合上午拍建筑光影\n北站远，预留 1 小时地铁',
    },
  ],
  snailInsights: {
    regrets:
      '鼓浪屿周末船票秒没，临时买票只能买高价旅行团套餐。中山路主街海鲜排档天价。曾厝垵主街烧烤又贵又一般。',
    recommendations:
      '宝藏点：八市阿杰五香、沙坡尾「四里沙茶面」。鼓浪屿走内厝澳码头一侧更安静。集美学村海上地铁段靠窗位很值。',
  },
};

const CHONGQING_DRAFT: GuidePublishEditorDraft = {
  title: '重庆三天辣壳游：轻轨穿楼 + 防空洞火锅',
  destination: '重庆',
  days: '3',
  budgetLabel: '人均 ¥1000–2000',
  interests: '美食、夜景、预算',
  costBreakdown: {
    transportation: {
      amount: '298',
      savingTips:
        '江北机场轨道 10 号线直达市区 ¥7；市区靠轻轨 + 步行，别轻易打车（8D 路况易堵）\n长江索道提前在官微预约，比现场排队省 40 分钟',
    },
    accommodation: {
      amount: '330',
      savingTips:
        '住解放碑/较场口青旅床位 ¥100–120/晚\n江景房不必住，晚上去千厮门大桥免费看夜景',
    },
    food: {
      amount: '445',
      savingTips:
        '火锅选社区防空洞店（如洞子火锅、储奇门），人均 ¥60–80\n小面早餐选街边老店，¥8–12 一碗',
    },
    entertainment: {
      amount: '187',
      savingTips:
        '洪崖洞免费；磁器口主街只逛不买\n武隆天生三桥一日游跟团约 ¥200+，本攻略市区为主省钱',
    },
    total: '1260',
  },
  dailyJournal: [
    {
      day: 1,
      narrative:
        '中午重庆北站抵达，轻轨到较场口放行李。下午步行洪崖洞（白天一般，等夜景），傍晚千厮门大桥拍洪崖洞全景（免费最佳机位）。晚餐在储奇门附近吃老火锅，九宫格微辣起步，香油蒜泥碟标配。',
      expenses: [
        { item: '高铁参考', amount: '245' },
        { item: '轻轨 + 步行', amount: '10' },
        { item: '老火锅（含锅底饮料）', amount: '78' },
      ],
      tips: '洪崖洞 19:30 亮灯，大桥上别堵在第一个机位\n火锅毛肚七上八下，鸭血要冷锅下',
    },
    {
      day: 2,
      narrative:
        '上午李子坝轻轨站看 2 号线穿楼（10 分钟够），步行鹅岭二厂文创园（免费）。下午皇冠大扶梯（¥2）体验「亚洲第二长扶梯」，傍晚坐长江索道到南岸，逛下浩老街。夜宵八一路好吃街吃酸辣粉+烤脑花。',
      expenses: [
        { item: '长江索道往返', amount: '30' },
        { item: '皇冠大扶梯', amount: '2' },
        { item: '小吃夜宵', amount: '35' },
        { item: '轻轨', amount: '8' },
      ],
      tips: '索道选南站→北站方向人少些\n下浩老街比磁器口安静，咖啡小店适合歇脚',
    },
    {
      day: 3,
      narrative:
        '早上花市豌杂面（解放碑店）吃小面，上午磁器口古镇走侧巷买陈麻花（只买一家试吃够）。中午轻轨去观音桥步行街，下午返程前买火锅底料当伴手礼（超市比景区便宜一半）。',
      expenses: [
        { item: '豌杂面 + 冰粉', amount: '18' },
        { item: '伴手礼火锅底料', amount: '45' },
        { item: '返程高铁', amount: '245' },
        { item: '轻轨', amount: '6' },
      ],
      tips: '磁器口周末人挤，工作日上午去\n火锅底料选小块装，托运方便',
    },
  ],
  snailInsights: {
    regrets:
      '洪崖洞里面像商场，真正好看的是外面夜景。网红「天空之镜」拍照点要排队付费，大桥免费更好。打车从江北到南岸高峰期堵到怀疑人生。',
    recommendations:
      '宝藏点：花市豌杂面、下浩老街、洞子火锅。千厮门大桥靠江北一侧拍洪崖洞最正。小面要干溜豌杂，别点汤面。',
  },
};

const HANGZHOU_DRAFT: GuidePublishEditorDraft = {
  title: '杭州三天慢游：西湖骑行 + 灵隐早香',
  destination: '杭州',
  days: '3',
  budgetLabel: '人均 ¥1000–2000',
  interests: '自然、美食、文化',
  costBreakdown: {
    transportation: {
      amount: '312',
      savingTips:
        '高铁到杭州东站，地铁 1 号线进城；西湖景区靠共享单车 + 公交\n灵隐专线公交 ¥2，比打车进景区省心',
    },
    accommodation: {
      amount: '360',
      savingTips:
        '住龙翔桥/定安路地铁口青旅 ¥110–130/晚\n连住 3 晚可谈价，别住景区内民宿（价高且难打车）',
    },
    food: {
      amount: '385',
      savingTips:
        '早餐吃葱包烩+豆浆（¥8），正餐选外婆家/新白鹿排队但人均可控\n河坊街主街别吃，钻南宋御街小巷',
    },
    entertainment: {
      amount: '168',
      savingTips:
        '西湖大部分免费；灵隐寺+飞来峰联票 ¥75\n雷峰塔可外观不登塔，苏堤白堤步行零成本',
    },
    total: '1225',
  },
  dailyJournal: [
    {
      day: 1,
      narrative:
        '抵达后地铁到龙翔桥，步行西湖音乐喷泉方向。傍晚沿白堤走到断桥，看日落。晚餐在湖滨银泰附近吃新白鹿（蛋黄鸡翅招牌，人均 ¥55）。',
      expenses: [
        { item: '高铁参考', amount: '260' },
        { item: '地铁', amount: '6' },
        { item: '新白鹿晚餐', amount: '58' },
      ],
      tips: '音乐喷泉 19:30 一场，提前 20 分钟占位\n断桥日落人多，孤山后山更安静',
    },
    {
      day: 2,
      narrative:
        '早起 7:00 进灵隐寺（香客少、空气好），飞来峰石窟顺路看。中午灵隐路吃素面（¥25）。下午杨公堤骑行（共享单车 ¥1.5/半小时），经茅家埠到乌龟潭，人少景美。',
      expenses: [
        { item: '灵隐飞来峰门票', amount: '75' },
        { item: '素面午餐', amount: '28' },
        { item: '共享单车', amount: '6' },
        { item: '公交', amount: '4' },
      ],
      tips: '灵隐早 7 点开门，8 点后旅游团涌入\n杨公堤比苏堤安静，适合骑行',
    },
    {
      day: 3,
      narrative:
        '上午河坊街逛南宋御街（免费），买知味观糕点当伴手礼。中午吃片儿川（奎元馆或街边老店 ¥18）。下午西湖博物馆（免费预约）或坐公交去西溪湿地外围散步，傍晚高铁返程。',
      expenses: [
        { item: '片儿川 + 小笼', amount: '22' },
        { item: '伴手礼糕点', amount: '48' },
        { item: '返程高铁', amount: '260' },
        { item: '公交地铁', amount: '8' },
      ],
      tips: '西湖博物馆空调足，雨天备选\n河坊街采芝斋薄荷糖适合当手信',
    },
  ],
  snailInsights: {
    regrets:
      '周末西湖断桥人比景多。雷峰塔登塔性价比一般，外观即可。河坊街主街小吃又贵又普通，南宋御街两侧小店更好逛。',
    recommendations:
      '宝藏点：茅家埠、乌龟潭、灵隐路素斋。早餐找小区门口的葱包烩摊。新白鹿提前手机取号，别傻等。',
  },
};

const DALI_DRAFT: GuidePublishEditorDraft = {
  title: '大理四天蹭风版：洱海骑行 + 古城北门早市',
  destination: '大理',
  days: '4',
  budgetLabel: '人均 ¥1000–2000',
  interests: '自然、摄影、预算',
  costBreakdown: {
    transportation: {
      amount: '486',
      savingTips:
        '飞昆明再高铁到大理（¥145）比直飞大理便宜；环洱海租电瓶车 ¥40–60/天\n古城内步行，去喜洲/双廊拼顺风车 ¥15–25/人',
    },
    accommodation: {
      amount: '400',
      savingTips:
        '住古城南门/北门青旅床位 ¥80–110/晚\n双廊海景房贵，日环海当天往返即可',
    },
    food: {
      amount: '328',
      savingTips:
        '北门菜市场早市吃饵丝、稀豆粉（¥10）\n正餐野生菌火锅淡季便宜，别在人民路主街吃',
    },
    entertainment: {
      amount: '286',
      savingTips:
        '洱海生态廊道骑行免费；喜洲古镇免费，严家大院 ¥25 可选\n苍山洗马潭索道贵（¥280），本攻略改走感通索道或徒步',
    },
    total: '1500',
  },
  dailyJournal: [
    {
      day: 1,
      narrative:
        '昆明高铁到大理站，公交 8 路到古城南门。傍晚逛人民路（只逛不买），晚餐吃再回首凉鸡米线（古城店 ¥15）。夜逛洋人街听街头民谣，酒吧消费可跳过。',
      expenses: [
        { item: '昆明—大理高铁', amount: '145' },
        { item: '公交', amount: '3' },
        { item: '凉鸡米线 + 烤乳扇', amount: '28' },
      ],
      tips: '南门进古城免费，别买「景区套票」\n烤乳扇甜口，不爱甜可跳过',
    },
    {
      day: 2,
      narrative:
        '早起北门菜市场吃饵丝+稀豆粉。租电瓶车环海西：才村湿地—S 弯—喜洲古镇（约 40 公里，分两次充）。喜洲吃喜洲粑粑（¥5），逛转角楼拍照。傍晚还车，古城吃野生菌火锅（人均 ¥65）。',
      expenses: [
        { item: '电瓶车租金 + 充电', amount: '55' },
        { item: '喜洲粑粑 + 午餐', amount: '22' },
        { item: '野生菌火锅', amount: '68' },
      ],
      tips: '环海防晒必须涂够，高原紫外线狠\nS 弯上午顺光，下午逆光难拍',
    },
    {
      day: 3,
      narrative:
        '拼车去双廊（¥20），逛玉几岛、南诏风情岛外观（上岛门票可省）。中午双廊吃酸辣鱼。下午返回古城，走博爱路—红龙井安静巷子。晚上苍山门广场看广场舞，买扎染小物（讲价到 ¥30 内）。',
      expenses: [
        { item: '拼车往返双廊', amount: '40' },
        { item: '酸辣鱼午餐', amount: '45' },
        { item: '扎染小物', amount: '28' },
      ],
      tips: '双廊主街商业化重，玉几岛小巷更舒服\n7–8 月雨季路滑，电瓶车慢骑',
    },
    {
      day: 4,
      narrative:
        '上午感通寺徒步（免费，约 2 小时上山），或古城睡懒觉逛书店。中午吃杨记砂锅米线。下午高铁回昆明转机/返程，买玫瑰鲜花饼当伴手礼（嘉华超市装 ¥35）。',
      expenses: [
        { item: '砂锅米线', amount: '16' },
        { item: '鲜花饼伴手礼', amount: '38' },
        { item: '大理—昆明高铁', amount: '145' },
        { item: '公交', amount: '4' },
      ],
      tips: '感通寺台阶陡，穿运动鞋\n鲜花饼别买景区礼盒装，超市同款便宜',
    },
  ],
  snailInsights: {
    regrets:
      '人民路酒吧拉客烦人，别被「免费听歌」忽悠进店消费。环海东路部分路段修，提前看地图绕开。苍山洗马潭索道天气不好常停，别专程为它改行程。',
    recommendations:
      '宝藏点：北门早市、才村湿地、喜洲转角楼、博爱路巷子。环海选电瓶车比自行车省力。野生菌火锅 7–9 月最鲜。',
  },
};

const CHANGSHA_DRAFT: GuidePublishEditorDraft = {
  title: '长沙三天辣爽游：橘子洲烟花 + 文和友平替',
  destination: '长沙',
  days: '3',
  budgetLabel: '人均 ¥1000–2000',
  interests: '美食、文化、夜景',
  costBreakdown: {
    transportation: {
      amount: '276',
      savingTips:
        '地铁覆盖五一广场、橘子洲；机场磁浮转地铁 ¥20\n市区景点集中，步行 + 地铁日花费 ¥10 内',
    },
    accommodation: {
      amount: '330',
      savingTips:
        '住五一广场/芙蓉广场地铁口青旅 ¥100–120/晚\n周末涨价猛，尽量工作日去',
    },
    food: {
      amount: '468',
      savingTips:
        '茶颜悦色路边店排队比商场短\n臭豆腐选黑色经典路边摊，文和友拍照即可不必久吃',
    },
    entertainment: {
      amount: '156',
      savingTips:
        '橘子洲景区免费，小火车 ¥40 可选\n湖南省博提前 7 天预约免费，马王堆必看',
    },
    total: '1230',
  },
  dailyJournal: [
    {
      day: 1,
      narrative:
        '抵达长沙南站，地铁到五一广场。下午太平街—坡子街逛吃（臭豆腐、糖油粑粑），茶颜悦色幽兰拿铁（¥16）。傍晚步行杜甫江阁看湘江，若周六可看橘子洲烟花（提前查公告）。',
      expenses: [
        { item: '高铁参考', amount: '228' },
        { item: '地铁', amount: '6' },
        { item: '小吃 + 茶颜', amount: '42' },
      ],
      tips: '烟花只有重大节假日/周六部分场次\n杜甫江阁登阁要门票，江边免费也能看',
    },
    {
      day: 2,
      narrative:
        '早起湖南省博物馆（预约 9:00 场），看辛追夫人。中午博物馆对面吃炊烟小炒黄牛肉（人均 ¥55）。下午岳麓山南门上，爱晚亭打卡，下山逛湖南大学红墙。晚餐超级文和友（取号拍照，浅吃小龙虾）。',
      expenses: [
        { item: '省博免费（讲解可选）', amount: '0' },
        { item: '小炒黄牛肉', amount: '58' },
        { item: '文和友小吃', amount: '48' },
        { item: '地铁公交', amount: '8' },
      ],
      tips: '省博周一闭馆，预约放票早抢\n岳麓山索道排队长，步行上山 40 分钟',
    },
    {
      day: 3,
      narrative:
        '上午橘子洲头看毛泽东青年雕像（地铁 2 号线橘子洲站），步行或坐小火车。中午米粉街吃常德米粉（¥15）。下午买酱板鸭、辣条伴手礼（约 ¥50），高铁返程。',
      expenses: [
        { item: '橘子洲小火车', amount: '40' },
        { item: '常德米粉', amount: '16' },
        { item: '伴手礼', amount: '52' },
        { item: '返程高铁', amount: '228' },
      ],
      tips: '橘子洲周末人巨多，工作日早上去\n酱板鸭品牌多，先试吃再买',
    },
  ],
  snailInsights: {
    regrets:
      '文和友排队 2 小时只为拍照不值，里面菜价偏贵。五一广场周末像春运。茶颜悦色每家都排队，路边小店一样好喝。',
    recommendations:
      '宝藏点：湖南大学红墙、米粉街、黑色经典臭豆腐。省博马王堆展厅留足 1.5 小时。夜宵去天宝兄弟（预算够再冲）。',
  },
};

const QINGDAO_DRAFT: GuidePublishEditorDraft = {
  title: '青岛三天海啤版：栈桥日出 + 啤酒博物馆',
  destination: '青岛',
  days: '3',
  budgetLabel: '人均 ¥1000–2000',
  interests: '海岛、美食、摄影',
  costBreakdown: {
    transportation: {
      amount: '318',
      savingTips:
        '高铁到青岛站最方便（近栈桥）；市区地铁 2/3 号线覆盖主要景点\n去崂山可坐旅游专线，别跟黑车',
    },
    accommodation: {
      amount: '360',
      savingTips:
        '住中山路/火车站附近青旅 ¥110–130/晚\n海景房不必，清晨去栈桥免费看海',
    },
    food: {
      amount: '398',
      savingTips:
        '海鲜去团岛农贸市场自买，旁边小店加工（加工费 ¥15/斤）\n啤酒喝原浆，超市袋装比景区便宜',
    },
    entertainment: {
      amount: '224',
      savingTips:
        '栈桥、八大关、小鱼山免费；啤酒博物馆 ¥60 含两杯啤酒\n崂山巨峰门票 ¥120，本攻略市区为主',
    },
    total: '1300',
  },
  dailyJournal: [
    {
      day: 1,
      narrative:
        '抵达青岛站，步行栈桥看海鸥（冬季多，夏天少）。下午逛中山路商业街，晚餐劈柴院吃海鲜水饺+蛤蜊（人均 ¥45）。夜逛五四广场看灯光秀（20:00 一场，免费）。',
      expenses: [
        { item: '高铁参考', amount: '268' },
        { item: '地铁公交', amount: '6' },
        { item: '海鲜水饺晚餐', amount: '48' },
      ],
      tips: '栈桥早晨 7 点前人少海鸥多\n五四广场灯光秀周一可能无，查官方公告',
    },
    {
      day: 2,
      narrative:
        '上午啤酒博物馆（预约上午场，喝原浆+花生，¥60）。中午登州路啤酒街吃辣炒蛤蜊。下午八大关逛万国建筑（免费），花石楼外观即可。傍晚小鱼山公园看老城全景（¥10，比信号山人少）。',
      expenses: [
        { item: '啤酒博物馆', amount: '60' },
        { item: '辣炒蛤蜊 + 烧烤', amount: '55' },
        { item: '小鱼山门票', amount: '10' },
        { item: '公交', amount: '6' },
      ],
      tips: '啤酒博物馆原浆别贪杯，后劲大\n八大关秋天银杏最美，夏天绿荫也好',
    },
    {
      day: 3,
      narrative:
        '早起团岛早市买蛤蜊、扇贝，找代加工店（约 ¥40 海鲜 + ¥20 加工）。下午江苏路基督教堂外观（进堂 ¥10 可选），买青食钙奶饼干、崂山绿茶伴手礼。傍晚高铁返程。',
      expenses: [
        { item: '海鲜采购 + 加工', amount: '62' },
        { item: '伴手礼', amount: '45' },
        { item: '返程高铁', amount: '268' },
        { item: '地铁', amount: '4' },
      ],
      tips: '团岛早市 6:00 开，去晚海鲜少\n教堂进堂要门票，外观拍照够用',
    },
  ],
  snailInsights: {
    regrets:
      '栈桥白天人挤人，日出或傍晚去。劈柴院游客多价偏高，团岛自买海鲜更划算。崂山一日游跟团常有购物点，自由行更自在。',
    recommendations:
      '宝藏点：小鱼山全景、八大关宁武关路、团岛早市。原浆啤酒配蛤蜊是正确打开方式。钙奶饼干当手信便宜又有特色。',
  },
};

const NANJING_DRAFT: GuidePublishEditorDraft = {
  title: '南京三天硬壳游：博物院免费 + 明城墙日落',
  destination: '南京',
  days: '3',
  budgetLabel: '人均 ¥1000–2000',
  interests: '文化、美食、历史',
  costBreakdown: {
    transportation: {
      amount: '298',
      savingTips:
        '高铁到南京南站，地铁 1/3 号线进城；景点间地铁 ¥2–4/次\n明城墙段建议步行 + 公交，别在夫子庙打车',
    },
    accommodation: {
      amount: '330',
      savingTips:
        '住新街口/大行宫地铁口青旅 ¥100–120/晚\n连住 3 晚可谈价，避开节假日夫子庙周边',
    },
    food: {
      amount: '352',
      savingTips:
        '鸭血粉丝汤选科巷/红庙小区店（¥15–20）\n盐水鸭买章云板鸭真空装，比景区礼盒便宜',
    },
    entertainment: {
      amount: '200',
      savingTips:
        '中山陵、博物院、玄武湖均免费（需预约）\n总统府 ¥35，明城墙中华门段 ¥50 可选',
    },
    total: '1180',
  },
  dailyJournal: [
    {
      day: 1,
      narrative:
        '中午南京南站抵达，地铁到大行宫放行李。下午南京博物院（提前 7 天预约，历史馆+民国馆必看）。傍晚步行到科巷吃鸭血粉丝汤+牛肉锅贴（¥22）。夜逛老门东（免费），比夫子庙人少更有烟火气。',
      expenses: [
        { item: '高铁参考', amount: '245' },
        { item: '地铁', amount: '8' },
        { item: '鸭血粉丝 + 锅贴', amount: '24' },
      ],
      tips: '南博周一闭馆，预约放票早抢\n老门东适合拍夜景，主街小吃比夫子庙便宜',
    },
    {
      day: 2,
      narrative:
        '早起中山陵（免费预约，8:00 前到停车场人少）。顺路音乐台看鸽子（门票含在中山陵景区）。中午美龄宫附近简餐。下午明孝陵神道（联票可选，只走免费段也够）。傍晚登明城墙中华门段看日落（¥50）。',
      expenses: [
        { item: '中山陵景区交通车', amount: '20' },
        { item: '午餐', amount: '28' },
        { item: '明城墙门票', amount: '50' },
        { item: '地铁公交', amount: '10' },
      ],
      tips: '中山陵台阶多，穿舒适鞋\n城墙日落 18:00 前后，提前 30 分钟上墙',
    },
    {
      day: 3,
      narrative:
        '上午总统府（¥35，早去排队短）。中午红庙小区吃皮肚面（¥14）。下午玄武湖环湖步行（免费，约 2 小时）。买盐水鸭、雨花石当伴手礼（约 ¥55），傍晚南京站高铁返程。',
      expenses: [
        { item: '总统府门票', amount: '35' },
        { item: '皮肚面', amount: '16' },
        { item: '伴手礼', amount: '58' },
        { item: '返程高铁', amount: '245' },
        { item: '地铁', amount: '6' },
      ],
      tips: '总统府周一闭馆\n玄武湖十里长堤适合傍晚，上午风大也舒服',
    },
  ],
  snailInsights: {
    regrets:
      '夫子庙秦淮河主街又挤又贵，夜景去老门东更好。中山陵周末停车难，地铁+景区车更省心。景区门口「正宗盐水鸭」礼盒价虚高。',
    recommendations:
      '宝藏点：科巷、红庙小区、老门东侧巷。南博民国馆拍照出片。鸭血粉丝汤加辣油，皮肚面要宽汤。',
  },
};

/** 精选真实向黏液轨迹 — 首次启动时写入攻略库 */
export const CURATED_SEED_PUBLISHED_GUIDES: PublishedGuideRecord[] = [
  buildSeedRecord(XIAN_DRAFT, {
    id: SEED_PUBLISHED_GUIDE_IDS[0],
    authorId: DEMO_CURRENT_USER_ID,
    publishedAt: daysAgoIso(2),
  }),
  buildSeedRecord(CHENGDU_DRAFT, {
    id: SEED_PUBLISHED_GUIDE_IDS[1],
    authorId: 'user-nomad',
    publishedAt: daysAgoIso(5),
  }),
  buildSeedRecord(XIAMEN_DRAFT, {
    id: SEED_PUBLISHED_GUIDE_IDS[2],
    authorId: 'user-maple',
    publishedAt: daysAgoIso(8),
  }),
  buildSeedRecord(CHONGQING_DRAFT, {
    id: SEED_PUBLISHED_GUIDE_IDS[3],
    authorId: 'user-nomad',
    publishedAt: daysAgoIso(11),
  }),
  buildSeedRecord(HANGZHOU_DRAFT, {
    id: SEED_PUBLISHED_GUIDE_IDS[4],
    authorId: DEMO_CURRENT_USER_ID,
    publishedAt: daysAgoIso(4),
  }),
  buildSeedRecord(DALI_DRAFT, {
    id: SEED_PUBLISHED_GUIDE_IDS[5],
    authorId: 'user-maple',
    publishedAt: daysAgoIso(14),
  }),
  buildSeedRecord(CHANGSHA_DRAFT, {
    id: SEED_PUBLISHED_GUIDE_IDS[6],
    authorId: 'user-nomad',
    publishedAt: daysAgoIso(17),
  }),
  buildSeedRecord(QINGDAO_DRAFT, {
    id: SEED_PUBLISHED_GUIDE_IDS[7],
    authorId: DEMO_CURRENT_USER_ID,
    publishedAt: daysAgoIso(20),
  }),
  buildSeedRecord(NANJING_DRAFT, {
    id: SEED_PUBLISHED_GUIDE_IDS[8],
    authorId: 'user-maple',
    publishedAt: daysAgoIso(1),
  }),
];

export function mergeCuratedSeedPublishedGuides(
  existing: PublishedGuideRecord[],
): { items: PublishedGuideRecord[]; added: PublishedGuideRecord[] } {
  const existingIds = new Set(existing.map((item) => item.id));
  const added = CURATED_SEED_PUBLISHED_GUIDES.filter((seed) => !existingIds.has(seed.id));
  if (added.length === 0) {
    return { items: existing, added: [] };
  }
  const merged = [...added, ...existing.filter((item) => !added.some((a) => a.id === item.id))];
  return { items: merged, added };
}
