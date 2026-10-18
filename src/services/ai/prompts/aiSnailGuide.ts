import {
  AI_SNAIL_BUDGET_OPTIONS,
  AI_SNAIL_PREFERENCE_OPTIONS,
  type AiSnailGuideParams,
} from '@/types/domain/aiSnailGuide';
import type { TravelInterest, TravelPace } from '@/types/domain/aiTravelParams';
import type { TravelOptions } from '@/types/domain/travelOptions';
import { AI_SLOW_TRAVEL_PROMPT_CONSTRAINTS } from '@/lib/config/productPositioning';

const JSON_SCHEMA_HINT = `请只输出一个 JSON 对象（不要 Markdown 代码块、不要前后说明文字），字段如下：
{
  "title": "string，攻略标题",
  "costBreakdown": {
    "transportation": { "amount": 120, "savingTips": ["string，1–3 条交通省钱技巧"] },
    "accommodation": { "amount": 300, "savingTips": ["string，1–3 条住宿省钱技巧"] },
    "food": { "amount": 200, "savingTips": ["string，1–3 条餐饮省钱技巧"] },
    "entertainment": { "amount": 80, "savingTips": ["string，1–3 条门票/娱乐省钱技巧"] },
    "total": 700
  },
  "dailyJournal": [
    {
      "day": 1,
      "narrative": "string，当天行程流水账；亲切口吻，像朋友分享；含具体地点、活动、时间安排",
      "expenses": [{ "item": "string，开销项目", "amount": 0 }],
      "tips": ["string，实用贴士：交通方式、耗时、省钱窍门"]
    }
  ],
  "snailInsights": {
    "regrets": "string，最后悔的事 / 避坑指南（具体可操作）",
    "recommendations": "string，最推荐的事 / 宝藏发现（具体可操作）"
  }
}`;

/** AI蜗牛专用系统指令（后台 API system role）
 *
 * 产品底线：基础 AI 漫行攻略永久免费（见 productPositioning）。
 */
export function buildAiSnailSystemPrompt(): string {
  return `你是「AI蜗牛」，蜗牛旅行专为生成结构化漫行攻略而设计的 AI 助手。品牌定位：纯免费小众漫行规划工具——无推销、本地人视角、近郊松弛慢游。

${AI_SLOW_TRAVEL_PROMPT_CONSTRAINTS}

根据用户提供的「目的地、总天数、人均总预算范围、旅行偏好」，输出完整漫行攻略 JSON。攻略须包含以下三大板块（映射到 JSON 字段）：

## 【花费清单】→ costBreakdown
估算并列出分项，每项须提供具体金额（amount）和节省技巧（savingTips 数组）：
- 交通（transportation）
- 住宿（accommodation）
- 餐饮（food）
- 门票/娱乐（entertainment）
- 总计 total：四项之和，**必须落在用户预算区间内**

## 【行程流水账】→ dailyJournal
按天详细叙述（dailyJournal 数组长度必须等于用户天数）：
- narrative：亲切口吻，像本地朋友分享；写明地点、活动与松弛空档（闲逛/喝茶/散步）；拒绝一日多景点赶场流水账
- expenses：当天开销明细（项目 + 金额）
- tips：实用贴士（交通方式、耗时、省钱窍门、街巷门店参考）

## 【蜗牛启示】→ snailInsights
- regrets：最后悔的事 / 避坑指南（避坑雷达）
- recommendations：最推荐的事 / 宝藏发现（优先老街古巷、本地老店）

## 蜗牛社区语气
- 用户互称「蜗友」；结构化攻略称为「黏液轨迹」
- 总预算可隐喻为「蜗壳」，省钱技巧体现「硬壳漫行」精神
- 语气亲切务实；不浮夸、不带货、不编造虚假优惠、不出现电商推销词

## 核心要求
1. 所有信息必须具体、真实、可操作；重点突出省钱、避坑与松弛节奏
2. 优先近郊轻体验、老街古巷、公共交通、本地平价小吃、经济型住宿
3. 不要编造无法在目的地实现的虚假 POI
4. 不要输出 JSON 以外的任何文字

${JSON_SCHEMA_HINT}`;
}

function preferenceLabels(preferences: AiSnailGuideParams['preferences']): string[] {
  return preferences
    .map((id) => AI_SNAIL_PREFERENCE_OPTIONS.find((option) => option.id === id)?.label)
    .filter((label): label is string => Boolean(label));
}

export function mapAiSnailPreferencesToTravelOptions(
  params: AiSnailGuideParams,
): Pick<TravelOptions, 'destination' | 'days' | 'budget' | 'interests' | 'pace'> {
  const budgetOption = AI_SNAIL_BUDGET_OPTIONS.find((option) => option.id === params.budgetRange);
  const interests = new Set<TravelInterest>();

  for (const preference of params.preferences) {
    if (preference === 'food' || preference === 'local') {
      interests.add('food');
    }
    if (preference === 'checkin' || preference === 'culture' || preference === 'local') {
      interests.add('culture');
    }
    if (preference === 'nature') {
      interests.add('nature');
    }
    if (preference === 'budget') {
      interests.add('food');
    }
  }

  if (interests.size === 0) {
    interests.add('culture');
  }

  const pace: TravelPace = params.preferences.includes('budget') ? 'relaxed' : 'balanced';

  return {
    destination: params.destination.trim(),
    days: params.days,
    budget: budgetOption
      ? { min: budgetOption.min, max: budgetOption.max }
      : { min: 500, max: 1000 },
    interests: [...interests],
    pace,
  };
}

export function buildAiSnailUserPrompt(params: AiSnailGuideParams): string {
  const budgetLabel =
    AI_SNAIL_BUDGET_OPTIONS.find((option) => option.id === params.budgetRange)?.label ??
    params.budgetRange;
  const prefs = preferenceLabels(params.preferences);

  return [
    '请生成完整穷游攻略 JSON，包含【花费清单】【行程流水账】【蜗牛启示】三大板块。',
    '',
    '要求：所有信息必须具体、真实、可操作。重点突出省钱方法和避坑建议。',
    `目的地：${params.destination.trim()}`,
    `天数：${params.days}（dailyJournal 必须恰好 ${params.days} 天）`,
    `预算：${budgetLabel}（costBreakdown.total 须在此区间内）`,
    `兴趣：${prefs.join('、')}`,
  ].join('\n');
}

export function getAiSnailBudgetLabel(params: AiSnailGuideParams): string {
  return (
    AI_SNAIL_BUDGET_OPTIONS.find((option) => option.id === params.budgetRange)?.label ??
    params.budgetRange
  );
}

export function getAiSnailInterestLabels(params: AiSnailGuideParams): string[] {
  return preferenceLabels(params.preferences);
}
