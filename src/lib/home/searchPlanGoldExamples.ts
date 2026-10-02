import { classifySearchPlanParty, type SearchPlanPartyFocus } from '@/lib/home/searchPlanShareCopy';
import type { SearchPlanRequest, SearchStructuredPlan } from '@/types/domain/searchStructuredPlan';

const SHANGHAI_BUDGET: SearchStructuredPlan['budgetList'] = [
  { item: '往返大交通', perPerson: 0, tip: '按出发地核算高铁/机票，不计入市内合计' },
  { item: '市内交通', perPerson: 120, tip: '' },
  { item: '餐饮', perPerson: 600, tip: '' },
  { item: '门票', perPerson: 170, tip: '' },
  { item: '住宿', perPerson: 500, tip: '' },
  { item: '机动备用金', perPerson: 130, tip: '' },
  { item: '合计', perPerson: 1520, tip: '只含市内消费' },
];

function withBase(
  params: SearchPlanRequest,
  peopleType: string,
  dayList: SearchStructuredPlan['dayList'],
  globalTips: string[],
): SearchStructuredPlan {
  return {
    baseInfo: {
      startCity: params.startCity,
      targetCity: params.targetCity.trim() || '上海',
      days: 3,
      peopleType: params.peopleType.trim() || peopleType,
      budget: params.budget,
      theme: params.theme,
    },
    budgetList: SHANGHAI_BUDGET.map((item) => ({ ...item })),
    dayList,
    globalTips,
  };
}

function shanghaiFriends3Day(params: SearchPlanRequest): SearchStructuredPlan {
  return withBase(
    params,
    '好友结伴',
    [
      {
        day: 1,
        title: '人民广场-南京东路-外滩滨江慢逛',
        hotelArea: '人民广场/南京东路一带（三天不换住，方便返程）',
        traffic: [{ desc: '地铁1/2/8号线人民广场下车，少走南京东路主街' }],
        spots: [
          { name: '上海博物馆', intro: '必体验：上午看馆藏，避开主街人流' },
          { name: '外滩滨江', intro: '必体验：傍晚蹲万国建筑落日' },
        ],
        foods: [{ shop: '沈大成', dish: '蟹粉小笼、鲜肉条头糕', perCost: 45 }],
        tips: '避开南京东路拥挤主街，上午逛上海博物馆看馆藏文物，傍晚滨江蹲万国建筑落日；午餐沈大成，必点蟹粉小笼、鲜肉条头糕。',
      },
      {
        day: 2,
        title: '豫园-城隍庙-新天地石库门慢逛',
        hotelArea: '人民广场/南京东路一带（三天不换住，方便返程）',
        traffic: [{ desc: '地铁10号线豫园站，老街步行，不进收费大殿' }],
        spots: [
          { name: '豫园老街', intro: '必体验：免费逛街巷烟火，不进收费大殿' },
          { name: '新天地石库门', intro: '时间充裕可选：下午闲逛拍照' },
        ],
        foods: [{ shop: '南翔馒头店', dish: '鲜肉小笼', perCost: 40 }],
        tips: '不进收费豫园大殿，免费逛豫园老街感受老上海市井烟火；午餐南翔馒头店，招牌鲜肉小笼；下午石库门街区闲逛拍照。',
      },
      {
        day: 3,
        title: '武康路-安福路街巷慢逛，返程',
        hotelArea: '人民广场/南京东路一带（退房寄存，不再计住宿）',
        traffic: [{ desc: '地铁10号线上海图书馆站，预留返程通勤' }],
        spots: [
          { name: '武康路', intro: '必体验：梧桐老洋房小众街巷' },
          { name: '安福路', intro: '时间充裕可选：避开网红扎堆点' },
        ],
        foods: [{ shop: '老麦咖啡馆', dish: '特调咖啡', perCost: 38 }],
        tips: '梧桐老洋房小众街巷漫步，避开网红扎堆点位；老麦咖啡馆特调咖啡，适合好友久坐闲聊，预留充足返程通勤时间。',
      },
    ],
    [
      '雨天替代：外滩滨江更换为上海城市规划展示馆、上海博物馆室内场馆；',
      '节假日分流：外滩人多可换北外滩滨江，同等江景、游客更少；',
      '本地交通：Metro大都会APP可刷地铁，微信/支付宝乘车码通用。',
    ],
  );
}

function shanghaiCouple3Day(params: SearchPlanRequest): SearchStructuredPlan {
  return withBase(
    params,
    '情侣',
    [
      {
        day: 1,
        title: '外滩源-北外滩-滨江日落慢逛',
        hotelArea: '外滩源/南京东路地铁沿线（三天不换住）',
        traffic: [{ desc: '地铁2/10号线南京东路，傍晚改步行去北外滩' }],
        spots: [
          { name: '外滩源', intro: '必体验：错峰走背街，少上台阶人群' },
          { name: '北外滩滨江', intro: '必体验：日落机位，游客更少' },
        ],
        foods: [{ shop: '老吉士', dish: '本帮红烧肉、蟹粉豆腐', perCost: 120 }],
        tips: '错峰避开外滩主台阶人流，傍晚北外滩蹲日落机位；晚餐老吉士，必点本帮红烧肉、蟹粉豆腐。',
      },
      {
        day: 2,
        title: '武康路-安福路-梧桐洋房慢逛',
        hotelArea: '外滩源/南京东路地铁沿线（三天不换住）',
        traffic: [{ desc: '地铁10号线上海图书馆，清晨先走武康路' }],
        spots: [
          { name: '武康路', intro: '必体验：清晨安静洋房拍照' },
          { name: '安福路', intro: '时间充裕可选：避开夜市人潮' },
        ],
        foods: [{ shop: '毕尔巴鄂', dish: '窗边咖啡、咸派', perCost: 68 }],
        tips: '清晨走武康路拍安静洋房，躲开安福路夜市人潮；毕尔巴鄂窗边咖啡，适合两个人慢慢坐。',
      },
      {
        day: 3,
        title: '徐汇滨江-龙美术馆慢逛，返程',
        hotelArea: '外滩源/南京东路地铁沿线（退房寄存）',
        traffic: [{ desc: '地铁11号线云锦路，滨江步行，预留返程' }],
        spots: [
          { name: '徐汇滨江', intro: '必体验：人少步道，安静拍照' },
          { name: '龙美术馆', intro: '时间充裕可选：室内错峰' },
        ],
        foods: [{ shop: '阿娘面馆', dish: '葱油拌面', perCost: 28 }],
        tips: '滨江步道人少好拍照，美术馆可错峰避雨；午餐葱油拌面收一顿，预留返程时间。',
      },
    ],
    [
      '雨天替代：北外滩日落改龙美术馆或中华艺术宫室内；',
      '节假日分流：外滩主台阶换北外滩或徐汇滨江；',
      '本地交通：Metro大都会过江，滨江全程可步行。',
    ],
  );
}

function shanghaiFamily3Day(params: SearchPlanRequest): SearchStructuredPlan {
  return withBase(
    params,
    '亲子',
    [
      {
        day: 1,
        title: '上海自然博物馆-静安寺商圈慢逛',
        hotelArea: '静安寺地铁沿线（三天不换住，少换乘）',
        traffic: [{ desc: '地铁13号线自然博物馆站直达，馆内多电梯' }],
        spots: [
          { name: '上海自然博物馆', intro: '必体验：儿童友好，馆内有休息座' },
          { name: '静安寺商圈', intro: '时间充裕可选：就近歇脚' },
        ],
        foods: [{ shop: '南翔馒头店（静安店）', dish: '鲜肉小笼、小馄饨', perCost: 42 }],
        tips: '馆内多休息座、少走路，带娃先看一层重点展区；午餐南翔馒头店，招牌鲜肉小笼、小馄饨。',
      },
      {
        day: 2,
        title: '上海科技馆-世纪公园慢逛',
        hotelArea: '静安寺地铁沿线（三天不换住，少换乘）',
        traffic: [{ desc: '地铁2号线上海科技馆站，出站即到' }],
        spots: [
          { name: '上海科技馆', intro: '必体验：有母婴室，控制参观时长' },
          { name: '世纪公园外缘', intro: '时间充裕可选：草坪歇脚，不进园也行' },
        ],
        foods: [{ shop: '沈大成', dish: '鲜肉条头糕、素菜包', perCost: 30 }],
        tips: '科技馆控制两小时，中途找母婴室休息；沈大成条头糕当加餐，避开周末开馆高峰。',
      },
      {
        day: 3,
        title: '人民广场绿地-上海博物馆慢逛，返程',
        hotelArea: '静安寺地铁沿线（退房寄存）',
        traffic: [{ desc: '地铁2号线人民广场，动线短，预留返程' }],
        spots: [
          { name: '人民广场绿地', intro: '必体验：短步行，孩子可歇' },
          { name: '上海博物馆', intro: '时间充裕可选：只看一层重点' },
        ],
        foods: [{ shop: '老半斋', dish: '汤包、阳春面', perCost: 35 }],
        tips: '最后一天短动线，只走绿地和一层展厅；老半斋汤包阳春面，吃完就近返程。',
      },
    ],
    [
      '雨天替代：世纪公园外缘改科技馆或自然博物馆室内；',
      '节假日分流：科技馆改工作日早场，或只逛自然博物馆一层；',
      '本地交通：选带电梯站点，Metro大都会刷码少排队。',
    ],
  );
}

function shanghaiSolo3Day(params: SearchPlanRequest): SearchStructuredPlan {
  return withBase(
    params,
    '单人',
    [
      {
        day: 1,
        title: '人民广场-上海博物馆-外滩慢逛',
        hotelArea: '人民广场地铁上盖（进出站方便，单人好认路）',
        traffic: [{ desc: '地铁2号线人民广场直达，少换乘' }],
        spots: [
          { name: '上海博物馆', intro: '必体验：一个人慢慢看馆藏' },
          { name: '外滩', intro: '必体验：天黑前走完滨江回住' },
        ],
        foods: [{ shop: '沈大成', dish: '蟹粉小笼（一人份）', perCost: 38 }],
        tips: '地铁直达少换乘，天黑前回住处；午餐沈大成柜台点蟹粉小笼，单人平价好结算。',
      },
      {
        day: 2,
        title: '豫园老街-城隍庙巷弄慢逛',
        hotelArea: '人民广场地铁上盖（进出站方便，单人好认路）',
        traffic: [{ desc: '地铁10号线豫园，白天逛巷，不钻夜路' }],
        spots: [
          { name: '豫园老街', intro: '必体验：白天巷弄更安心' },
          { name: '城隍庙巷弄', intro: '时间充裕可选：躲开主街摊位' },
        ],
        foods: [{ shop: '南翔馒头店', dish: '鲜肉小笼（可打包）', perCost: 36 }],
        tips: '白天逛老街更安心，主街人多就钻巷；南翔鲜肉小笼可打包，一个人边走边吃。',
      },
      {
        day: 3,
        title: '武康路街巷慢逛，返程',
        hotelArea: '人民广场地铁上盖（退房寄存）',
        traffic: [{ desc: '地铁10号线上海图书馆，路牌好认，预留返程' }],
        spots: [{ name: '武康路', intro: '必体验：路直好走，一个人也不绕' }],
        foods: [{ shop: '阿娘面馆', dish: '葱油拌面', perCost: 22 }],
        tips: '梧桐路好认好走，一个人也不容易迷路；葱油拌面单人刚好一碗，傍晚前回住取行李。',
      },
    ],
    [
      '雨天替代：外滩改上海博物馆或城市规划展示馆室内；',
      '节假日分流：城隍庙主街换巷弄，或改武康路；',
      '本地交通：Metro大都会+乘车码，少问询少排队。',
    ],
  );
}

const SHANGHAI_3DAY: Record<Exclude<SearchPlanPartyFocus, 'other'>, (params: SearchPlanRequest) => SearchStructuredPlan> = {
  friends: shanghaiFriends3Day,
  couple: shanghaiCouple3Day,
  family: shanghaiFamily3Day,
  solo: shanghaiSolo3Day,
};

/** 上海3天四类人群锁定样例；好友结伴对齐用户验收稿 */
export function matchSearchPlanGoldExample(params: SearchPlanRequest): SearchStructuredPlan | null {
  if (!/上海/.test(params.targetCity.trim()) || params.days !== 3) return null;
  const focus = classifySearchPlanParty(params.peopleType);
  if (focus === 'other') return null;
  return SHANGHAI_3DAY[focus](params);
}
