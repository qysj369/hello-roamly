import type { AiSnailGuideParams, AiSnailGuideResult } from '@/types/domain/aiSnailGuide';
import {
  getAiSnailBudgetLabel,
  getAiSnailInterestLabels,
} from '@/services/ai/prompts/aiSnailGuide';

/** 未配置 API 时的本地演示攻略 */
export function generateMockAiSnailGuide(params: AiSnailGuideParams): AiSnailGuideResult {
  const destination = params.destination.trim();
  const budgetLabel = getAiSnailBudgetLabel(params);
  const interests = getAiSnailInterestLabels(params);
  const budgetOption =
    params.budgetRange === 'under500'
      ? { total: 450, transport: 60, stay: 150, food: 180, fun: 60 }
      : params.budgetRange === '500-1000'
        ? { total: 780, transport: 120, stay: 280, food: 300, fun: 80 }
        : params.budgetRange === '1000-2000'
          ? { total: 1500, transport: 200, stay: 550, food: 600, fun: 150 }
          : { total: 2800, transport: 400, stay: 1000, food: 1100, fun: 300 };

  const dailyJournal = Array.from({ length: params.days }, (_, index) => {
    const day = index + 1;
    return {
      day,
      narrative: `第 ${day} 天早上从市区出发，先逛${destination}的老城区免费街巷，中午找本地人常去的小馆吃碗面（约 ¥15）。下午按你的「${interests[0] ?? '打卡'}」偏好，去一处口碑景点慢慢逛，傍晚坐公交回住处——节奏不紧，像跟朋友闲聊一样把一天晃过去。`,
      expenses: [
        { item: '公交/地铁', amount: Math.round(budgetOption.transport / params.days) },
        { item: '餐饮', amount: Math.round(budgetOption.food / params.days) },
        { item: day === 1 ? '门票' : '小吃', amount: day === 1 ? 40 : 20 },
      ],
      tips: [
        '早出门避开人流，很多免费街区上午最好拍',
        '用地图查公交换乘，比打车省不少',
        '景区门口特产店先别买，城里超市同款更便宜',
      ],
    };
  });

  return {
    id: `snail-mock-${Date.now()}`,
    title: `${destination} ${params.days} 天漫行攻略（演示）`,
    destination,
    days: params.days,
    budgetLabel,
    interests,
    costBreakdown: {
      transportation: {
        amount: budgetOption.transport,
        savingTips: ['优先地铁+公交日票', '景点间距离不远可步行串联'],
      },
      accommodation: {
        amount: budgetOption.stay,
        savingTips: ['选地铁沿线的青旅或连锁经济酒店', '提前 3 天订往往比当天便宜'],
      },
      food: {
        amount: budgetOption.food,
        savingTips: ['午餐吃本地小吃，晚餐简餐', '避开景区主街餐厅'],
      },
      entertainment: {
        amount: budgetOption.fun,
        savingTips: ['优先免费展馆与公园', '学生证/预约票能省一半'],
      },
      total: budgetOption.total,
    },
    dailyJournal,
    snailInsights: {
      regrets: `别在${destination}火车站门口坐「黑车」——看着近其实绕路。热门打卡点周末下午人挤人，想省钱省心就工作日早去。`,
      recommendations: `${destination}的早市或老城早段最有烟火气，花很少钱就能吃到地道早餐；傍晚找一处高处看日落，往往免费又惊艳。`,
    },
    generatedAt: new Date().toISOString(),
  };
}
