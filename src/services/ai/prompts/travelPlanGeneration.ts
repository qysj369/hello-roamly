import { TRAVEL_INTEREST_OPTIONS, TRAVEL_PACE_OPTIONS } from '@/types/domain/aiTravelParams';
import type { TravelOptions } from '@/types/domain/travelOptions';
import {
  DEFAULT_TRAVEL_OPTIONS,
  resolveTravelOptionsBudget,
} from '@/types/domain/travelOptions';
import { AI_SLOW_TRAVEL_PROMPT_CONSTRAINTS } from '@/lib/config/productPositioning';

const JSON_SCHEMA_HINT = `请只输出一个 JSON 对象（不要 Markdown 代码块），字段如下：
{
  "title": "string，计划标题",
  "summary": "string，1 句概述",
  "dailyPlans": [
    {
      "day": 1,
      "title": "string，当天主题",
      "activities": [
        {
          "time": "09:00",
          "description": "string，活动内容（12–22字）",
          "location": "string，具体地点",
          "cost": 0
        }
      ]
    }
  ],
  "totalCost": 1500,
  "tags": ["string", "2 个标签"],
  "suitableAudience": "string，如 慢行党",
  "practicalInfo": {
    "accommodationTips": ["string，1 条住宿建议"],
    "transportationTips": ["string，1 条交通提示"],
    "precautions": ["string，1 条注意事项"]
  }
}`;

/** 产品底线：基础 AI 漫行攻略与预算测算永久免费（见 productPositioning）。 */
export function buildTravelPlanSystemPrompt(): string {
  return `你是蜗牛旅行的漫行规划引擎，根据用户需求生成松弛慢游向的行程 JSON。
${AI_SLOW_TRAVEL_PROMPT_CONSTRAINTS}
要求：
- 预算敏感、每日 activities 时间合理（09:00–21:00）、totalCost 与各项 cost 大致匹配
- 每一天恰好 3 个 activities；其中至少 1 个是闲逛/喝茶/散步类松弛空档；description 短句（怎么去/玩什么/花多少）
- location 写真实 POI、老街或街区名；弱化流水线网红打卡点
- practicalInfo 每类仅 1 条；禁止特惠/抢购/预订/下单等电商词
- 必须一次输出完整可用 JSON；禁止解释、禁止冗长
${JSON_SCHEMA_HINT}`;
}

export function buildTravelPlanUserPrompt(prompt: string, options: TravelOptions): string {
  const lines = [`用户需求：${prompt.trim()}`];

  if (options.destination?.trim()) {
    lines.push(`指定目的地：${options.destination.trim()}`);
  }

  const days = options.days ?? DEFAULT_TRAVEL_OPTIONS.days;
  const { min, max } = resolveTravelOptionsBudget(options);
  const interests = options.interests ?? DEFAULT_TRAVEL_OPTIONS.interests;
  const pace = options.pace ?? DEFAULT_TRAVEL_OPTIONS.pace;

  lines.push(`天数：${days} 天（dailyPlans 需包含 ${days} 天）`);
  lines.push(`预算范围：¥${min}–${max}（totalCost 落在此区间附近）`);

  const interestLabels = interests
    .map((id) => TRAVEL_INTEREST_OPTIONS.find((o) => o.id === id)?.label)
    .filter(Boolean);
  if (interestLabels.length > 0) {
    lines.push(`兴趣：${interestLabels.join('、')}`);
  }

  const paceLabel = TRAVEL_PACE_OPTIONS.find((o) => o.id === pace)?.label;
  if (paceLabel) {
    lines.push(`节奏：${paceLabel}`);
  }

  return lines.join('\n');
}
