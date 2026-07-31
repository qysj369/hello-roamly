import { TRAVEL_INTEREST_OPTIONS, TRAVEL_PACE_OPTIONS } from '@/types/domain/aiTravelParams';
import type { TravelOptions } from '@/types/domain/travelOptions';
import {
  DEFAULT_TRAVEL_OPTIONS,
  resolveTravelOptionsBudget,
} from '@/types/domain/travelOptions';

const JSON_SCHEMA_HINT = `请只输出一个 JSON 对象（不要 Markdown 代码块），字段如下：
{
  "title": "string，计划标题",
  "summary": "string，1–3 句整体概述",
  "dailyPlans": [
    {
      "day": 1,
      "title": "string，当天主题",
      "activities": [
        {
          "time": "09:00",
          "description": "string，活动内容（20–40字）",
          "location": "string，可选具体地点",
          "cost": 0
        }
      ]
    }
  ],
  "totalCost": 1500,
  "tags": ["string", "2–3 个标签"],
  "suitableAudience": "string，如 穷游党、周末出行",
  "practicalInfo": {
    "accommodationTips": ["string，2 条住宿建议"],
    "transportationTips": ["string，2 条交通提示"],
    "precautions": ["string，2 条注意事项"]
  }
}`;

export function buildTravelPlanSystemPrompt(): string {
  return `你是蜗牛旅行的旅行规划引擎，根据用户需求生成穷游向的行程 JSON。
要求：
- 预算敏感、每日 activities 时间合理（09:00–21:00）、totalCost 与各项 cost 大致匹配
- 每一天 3 个 activities 即可，description 简洁具体（怎么去、玩什么、花多少钱）
- location 写真实 POI 或街区名，便于地图标注
- practicalInfo 每类 2 条，可执行即可
- 优先输出完整 JSON，控制篇幅，避免冗长
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
