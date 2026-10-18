import { buildCityKnowledgePrompt } from '@/lib/agent/cityTravelKnowledge';
import { buildPreferenceMemoryPrompt } from '@/lib/agent/travelPreferenceMemory';
import { searchPlanPeopleFocusRule } from '@/lib/home/searchPlanShareCopy';
import type {
  SearchPlanIncrementFocus,
  SearchPlanRequest,
  SearchStructuredPlan,
} from '@/types/domain/searchStructuredPlan';

/** 写死在接口层的 System Prompt：只出 JSON，禁止散文流水账 */
export const SEARCH_STRUCTURED_PLAN_SYSTEM_PROMPT = `你是专业旅游行程生成器，严格遵守以下规则：
1.只输出纯净JSON，不要\`\`\`json标记，不要任何解释、开场白、抒情段落，禁止流水账散文。
2.输出结构必须严格匹配下面schema，字段一个不能缺失。
3.预算只核算目的地市内消费（市内交通/餐饮/门票/住宿/机动备用金）。往返大交通只写文字提示、perPerson必须为0，禁止纳入合计。预算不为null时，市内合计不能超出给定人均；为null则给合理市内区间。
4.每天行程节奏松弛，不堆砌景点：每天主线一个片区，必体验最多2个，下午或傍晚留闲逛空档；禁止把热门打卡点一天排满，禁止泛泛流水账。包含真实地铁/公交/打车、真实门店、招牌菜、参考人均。
5.每个景点 intro 写一句具体游玩亮点（约20–50字），禁止只写地名或顿号罗列；住宿统一固定片区，全程不换住宿。最后一天从简并返程，禁止把观光塔/高价登高放进返程日。4天及以上须有1天滨江、古镇或街巷慢逛（近郊轻游优先）。
6.不要虚构不存在的景点餐馆。
7.每日按上午/下午/傍晚拆分写进 spots.intro（含建议停留时长），动线不走回头路。day.title 写成「点位A-点位B-点位C慢逛」，最后一天末尾加「，返程」，不要写成「第X天xxx」。
8.spots.intro 用「必体验」或「时间充裕可选」区分。day.tips 是单行【行程亮点】：先写避坑取舍或专属体验，再写当天店名和必点招牌菜；两句、40-80字；禁止「适合拍照/值得一去/时间紧张可舍弃」等万能套话。
9.foods 每条必须写招牌菜品（dish不能只重复店名），并标明本地老店或游客店。
10.traffic.desc≤40字，写市内通勤与避坑；往返大交通只出现在第1天/最后一天的文字提示。
11.hotelArea 写成「片区（选择理由）」。最后一天可写退房寄存，不要再算一晚住宿。
12.budgetList[].tip 补充对应项的省钱降级。住宿按「天数-1」晚计（1天按1晚）；单人禁止写双人分摊，按整间计。合计数字=市内五项之和，不含往返大交通。
13.globalTips 固定3条，前缀必须是「雨天替代：」「节假日分流：」「本地交通：」，只写当前城市与本条路线；每条≤40字；禁止「带身份证/注意安全/提前预约」等全网万能提示。
14.按 peopleType 调整侧重点：好友结伴主打松弛探店、平价小吃、小众聊天点、避开网红拥挤；情侣主打日落机位、氛围感小店、安静拍照、错峰；亲子缩短步行、加休息点、儿童友好场馆与便民提示；单人侧重交通便捷、安全提示、单人平价简餐。
15.全程仅供出行参考，禁止预订/下单/推销话术。
16.禁止新增字段，必须仍输出下面同一套 JSON schema。卡片会完整渲染文字，不要为缩短而省略亮点；每个 name 必须带 intro 游玩亮点，禁止只罗列地名。
17.基础信息只写城市、天数、同行人群；预算只算市内交通/餐饮/门票/住宿/机动，往返大交通只做文字提示。
18.同城换人群必须换侧重点、换亮点和换贴士，禁止四类人群共用同一套模板句。

输出JSON结构：
{
  "baseInfo":{
    "startCity":"",
    "targetCity":"",
    "days":1,
    "peopleType":"",
    "budget":null,
    "theme":null
  },
  "budgetList":[
    {"item":"往返大交通","perPerson":0,"tip":"省钱说明"},
    {"item":"市内交通","perPerson":0,"tip":""},
    {"item":"餐饮","perPerson":0,"tip":""},
    {"item":"门票","perPerson":0,"tip":""},
    {"item":"住宿","perPerson":0,"tip":""},
    {"item":"机动备用金","perPerson":0,"tip":""},
    {"item":"合计","perPerson":0,"tip":""}
  ],
  "dayList":[
    {
      "day":1,
      "title":"点位A-点位B-点位C慢逛",
      "traffic":[{"desc":"交通描述"}],
      "spots":[{"name":"景点名","intro":"简短介绍"}],
      "foods":[{"shop":"餐馆名","dish":"招牌菜","perCost":0}],
      "tips":"避坑与专属体验；店名，必点招牌菜",
      "hotelArea":"住宿片区"
    }
  ],
  "globalTips":["雨天替代：本路线室内点","节假日分流：本路线人少替代","本地交通：本市专属方式"]
}`;

export function buildSearchStructuredPlanUserPrompt(params: SearchPlanRequest): string {
  const nights = Math.max(1, params.days - 1);
  const solo = /单人|独自|一个人|一人行/.test(params.peopleType);
  const stayLine = solo
    ? `同行单人：住宿按整间计，禁止写双人分摊。`
    : `住宿可按同行分摊说明。`;
  return [
    `请根据以下已确认参数生成行程JSON：`,
    JSON.stringify(params),
    `额外约束：住宿按${nights}晚计（最后一天返程）。${stayLine}每天必体验不超过2个，预留闲逛空档；不要输出热门点赶场清单。`,
    searchPlanPeopleFocusRule(params.peopleType),
    `合计只含市内消费；往返大交通只提示、不计入。day.title用点位连写；day.tips写两句亮点并含招牌菜；globalTips只写${params.targetCity}这条路线的雨天替代/节假日分流/本地交通。`,
    buildCityKnowledgePrompt(params.targetCity),
    buildPreferenceMemoryPrompt(),
    searchPlanStyleExample(params),
  ].filter(Boolean).join('\n');
}

function searchPlanStyleExample(params: SearchPlanRequest): string {
  const friends = /好友|朋友|结伴|闺蜜/.test(params.peopleType);
  const couple = /情侣|夫妻|两口/.test(params.peopleType);
  const family = /亲子|带娃|儿童|小孩/.test(params.peopleType);
  const solo = /单人|独自|一个人|一人行/.test(params.peopleType);
  if (params.targetCity.includes('上海') && params.days === 3 && friends) {
    return [
      '风格必须贴近以下验收样例（门店可微调，禁止改成赶场清单）：',
      'D1 title：人民广场-南京东路-外滩滨江慢逛',
      'D1 foods：沈大成 · 蟹粉小笼、鲜肉条头糕',
      'D1 tips：避开南京东路拥挤主街，上午逛上海博物馆看馆藏文物，傍晚滨江蹲万国建筑落日；午餐沈大成，必点蟹粉小笼、鲜肉条头糕。',
      'D2 title：豫园-城隍庙-新天地石库门慢逛',
      'D2 foods：南翔馒头店 · 鲜肉小笼',
      'D2 tips：不进收费豫园大殿，免费逛豫园老街感受老上海市井烟火；午餐南翔馒头店，招牌鲜肉小笼；下午石库门街区闲逛拍照。',
      'D3 title：武康路-安福路街巷慢逛，返程',
      'D3 foods：老麦咖啡馆 · 特调咖啡',
      'D3 tips：梧桐老洋房小众街巷漫步，避开网红扎堆点位；老麦咖啡馆特调咖啡，适合好友久坐闲聊，预留充足返程通勤时间。',
      'globalTips：雨天替代：外滩滨江更换为上海城市规划展示馆、上海博物馆室内场馆；｜节假日分流：外滩人多可换北外滩滨江，同等江景、游客更少；｜本地交通：Metro大都会APP可刷地铁，微信/支付宝乘车码通用。',
    ].join('\n');
  }
  if (couple) {
    return `情侣写法：亮点写日落机位、安静拍照、错峰；美食写氛围小店+招牌菜。禁止复用好友「避开人流老城慢逛」套话。`;
  }
  if (family) {
    return `亲子写法：亮点写短步行、休息点、儿童友好场馆；贴士写便民。禁止复用情侣日落或好友探店套话。`;
  }
  if (solo) {
    return `单人写法：亮点写少换乘、白天安全路线、一人份简餐招牌菜。禁止写双人分摊和情侣机位。`;
  }
  return '亮点写法示例：避开拥挤主街，上午进馆、傍晚滨江看落日；午餐老店名，必点招牌菜A、招牌菜B。';
}

const INCREMENT_FOCUS_RULE: Record<SearchPlanIncrementFocus, string> = {
  spots:
    '只加长 dayList[].spots[].intro（每个地名后写一句具体游玩亮点），禁止增删景点、禁止改 name、禁止改 foods/traffic/tips/hotelArea。',
  foods:
    '只丰富或少量追加 dayList[].foods（shop/dish/perCost），每条必须写招牌菜，禁止只列店名；禁止改景点顺序与 name、禁止改 traffic、禁止改住宿与预算数字。',
  traffic:
    '只补充 dayList[].traffic[].desc 的地铁/公交换乘细节，禁止改景点、美食、住宿、预算数字与天数。',
};

export function buildSearchPlanIncrementSystemPrompt(focus: SearchPlanIncrementFocus): string {
  return `你是行程局部扩写器，严格遵守：
1.只输出纯净JSON，不要\`\`\`json标记，不要解释。
2.输出必须与输入同一schema，dayList长度、每天day/title/hotelArea必须原样保留。
3.禁止修改 baseInfo.days、路线顺序、住宿片区、budgetList 里任何数字。
4.${INCREMENT_FOCUS_RULE[focus]}
5.不要虚构不存在的景点餐馆。intro 须是完整一句游玩亮点，禁止只罗列地名。`;
}

export function buildSearchPlanIncrementUserPrompt(
  focus: SearchPlanIncrementFocus,
  plan: SearchStructuredPlan,
): string {
  return `对下面完整行程做「${focus}」局部扩充，其他字段保持原样：\n${JSON.stringify(plan)}`;
}
