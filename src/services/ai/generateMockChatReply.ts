import type { AiChatContext, AiChatMessage } from '@/types/domain/aiChat';
import { TRAVEL_INTEREST_OPTIONS, TRAVEL_PACE_OPTIONS } from '@/types/domain/aiTravelParams';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function pickContextLine(context?: AiChatContext): string | null {
  if (!context) {
    return null;
  }
  const parts: string[] = [];
  if (context.dream?.trim()) {
    parts.push(`你的想法：${context.dream.trim()}`);
  }
  if (context.destination?.trim()) {
    parts.push(`目的地：${context.destination.trim()}`);
  }
  if (context.days != null) {
    parts.push(`约 ${context.days} 天`);
  }
  if (context.travelParams) {
    const { budgetMin, budgetMax, interests, pace } = context.travelParams;
    parts.push(`预算 ${budgetMin}–${budgetMax} 元`);
    if (interests.length > 0) {
      const labels = interests
        .map((id) => TRAVEL_INTEREST_OPTIONS.find((o) => o.id === id)?.label)
        .filter(Boolean);
      parts.push(`兴趣：${labels.join('、')}`);
    }
    const paceLabel = TRAVEL_PACE_OPTIONS.find((o) => o.id === pace)?.label;
    if (paceLabel) {
      parts.push(`节奏：${paceLabel}`);
    }
  } else if (context.budget?.trim()) {
    parts.push(`预算约 ¥${context.budget.trim()}`);
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

/** 按关键词分桶返回模板化 Markdown，无模型时也能演示「顾问」体验 */
function buildReply(userText: string, context?: AiChatContext): string {
  const text = userText.trim();
  const lower = text.toLowerCase();
  const contextLine = pickContextLine(context);

  if (/预算|多少钱|花费|省钱/.test(text)) {
    const header = contextLine ? `> ${contextLine}\n\n` : '';
    return `${header}### 预算拆分建议

| 科目 | 建议占比 | 说明 |
|------|----------|------|
| 交通 | 35% | 大交通 + 市内公交/地铁 |
| 住宿 | 25% | 青旅 / 地铁沿线连锁 |
| 餐饮 | 30% | 本地小吃为主 |
| 体验 | 10% | 门票或 1 项付费活动 |

\`\`\`text
机动金 = 总预算 × 10%（应急与临时加价）
\`\`\`

穷游优先 **公交 + 步行环线**；需要的话我可以按你的天数生成「每日花费上限」表。`;
  }

  if (/美食|吃|小吃|餐厅/.test(text)) {
    return [
      '美食线可以这样排：上午景点 → 午市小吃集中区 → 傍晚夜景/步行街。',
      '优先选本地人排队的小店；景区门口套餐通常性价比低。',
      context?.destination
        ? `若去${context.destination}，我可以结合攻略库帮你筛「高性价比」美食标签路线。`
        : '告诉我目的地，我能匹配站内已有的美食向攻略。',
    ].join('\n\n');
  }

  if (/交通|怎么去|地铁|公交|机票|火车/.test(text)) {
    return [
      '交通优先级：高铁/动车到站 → 地铁或机场快线进城 → 市内地铁/公交日票。',
      '跨区景点用「同一方向」串点，避免折返；晚间回酒店路线提前看好末班车时间。',
      '你若有具体出发城市，我可以帮你写一版到达+市内动线顺序。',
    ].join('\n\n');
  }

  if (/攻略|推荐|景点|行程|规划|路线/.test(text) || lower.includes('plan')) {
    const dest = context?.destination?.trim() ?? '目的地';
    const header = contextLine ? `> ${contextLine}\n\n` : '';
    return `${header}### ${dest} · 穷游行程草案

1. **上午** — 免费/低价地标（1–2 个）
2. **午后** — 美食或拍照街区
3. **傍晚** — 夜景 / 市集轻松收尾

\`\`\`text
Day 1: 抵达 → 放行李 → 老城步行
Day 2: 公交环线串点 → 本地小吃
Day 3: 轻松补点 → 返程
\`\`\`

点击下方 **匹配攻略** 在站内继续筛选；完整 AI 行程引擎即将接入。`;
  }

  return [
    contextLine,
    `收到：「${text.slice(0, 120)}${text.length > 120 ? '…' : ''}」`,
    '我是 Hello Roamly 旅行顾问（演示模式）。你可以继续问：预算怎么拆、交通怎么省、或让我推荐同风格目的地。',
    '也可以直接说「帮我规划 X 城 Y 天 Z 元」。',
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** 模拟 AI 回复（后续可替换为真实 API） */
// TODO: 与 generateTravelPlan 一致，未配置 Key 时 UI 提示即可，考虑移除模板回复路径
export async function generateMockChatReply(
  messages: AiChatMessage[],
  context?: AiChatContext,
): Promise<string> {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const userText = lastUser?.content ?? '';
  // 模拟网络+推理耗时，长问题略慢，避免「秒回」破坏真实感
  await delay(600 + Math.min(userText.length * 8, 900));
  return buildReply(userText, context);
}
