import { describe, expect, it } from 'vitest';

import { parseTravelPlanFromAiResponse } from '@/services/ai/parseTravelPlan';

const validPlan = {
  title: '青岛五日穷游',
  summary: '海边慢游，控制预算。',
  dailyPlans: [
    {
      day: 1,
      title: '抵达与栈桥',
      activities: [
        { time: '09:00', description: '栈桥散步', location: '栈桥', cost: 0 },
        { time: '12:00', description: '海鲜市场午餐', location: '团岛', cost: 60 },
        { time: '15:00', description: '八大关', location: '八大关', cost: 0 },
        { time: '19:00', description: '啤酒屋晚餐', location: '台东', cost: 80 },
      ],
    },
  ],
  totalCost: 1500,
  tags: ['穷游', '海边'],
};

describe('parseTravelPlanFromAiResponse', () => {
  it('parses fenced JSON', () => {
    const raw = `\`\`\`json\n${JSON.stringify(validPlan)}\n\`\`\``;
    const parsed = parseTravelPlanFromAiResponse(raw);
    expect(parsed.title).toBe('青岛五日穷游');
  });

  it('tolerates trailing commas and smart quotes', () => {
    const raw = `{ “title”: “青岛五日穷游”, “summary”: “海边慢游”, “dailyPlans”: [{ “day”: 1, “title”: “第一天”, “activities”: [{ “time”: “09:00”, “description”: “栈桥”, “cost”: 0, }, { “time”: “12:00”, “description”: “午餐”, “cost”: 60, }, { “time”: “15:00”, “description”: “八大关”, “cost”: 0, }, { “time”: “19:00”, “description”: “晚餐”, “cost”: 80, }, ], },], “totalCost”: 1500, “tags”: [“穷游”], }`;
    const parsed = parseTravelPlanFromAiResponse(raw);
    expect(parsed.dailyPlans).toHaveLength(1);
  });

  it('repairs truncated JSON when dailyPlans is complete enough', () => {
    const truncated = `${JSON.stringify(validPlan).slice(0, -20)}, "tags": ["穷游"`;
    const parsed = parseTravelPlanFromAiResponse(truncated);
    expect(parsed.summary).toContain('海边');
  });
});
