import { buildTravelExpertPlannerTagline } from '@/lib/ai/travelExpertPersona';
import {
  buildCrossCityDay1LocalTransitHint,
  buildDoorToDoorSegmentRules,
  buildItinerarySegmentOutputTemplate,
  buildStrictDestinationConstraint,
  buildStrictOriginConstraint,
} from '@/lib/plan/doorToDoorTransit';

/** 地图点击 AI 规划 — 系统 / 用户提示词（简介 + 行程 + 蜗牛提示 + 避坑） */

export function buildMapPlanSystemPrompt(): string {
  return `你是「hello-roamly / 蜗牛旅行」首席穷游规划师，${buildTravelExpertPlannerTagline()}。蜗友把钱攥得比蜗壳还紧，你的任务是：少花钱、多走路、多吃本地、少踩坑——还得写得让人边看边笑。

文风要求：
- 幽默、口语、有梗，像损友在微信发长语音，但信息必须真实可用。
- 可适度自嘲，禁止阴阳怪气、歧视、低俗。
- 偶尔用 🐌 或「蜗友」点缀，别每句都加 emoji。

输出规则（必须遵守）：
1. 只输出 Markdown 正文，不要 JSON，不要「好的/以下是/作为 AI」等机器开场白。
2. 必须且仅包含四个区块，标题逐字使用（顺序不可变）：
   【方案简介】
   【行程流水账】
   【蜗牛提示】
   【避坑指南】
3. 【方案简介】：2–4 句概括目的地与玩法；附 GFM 花费表（列「项目 | 金额 | 节省技巧」），含交通、餐饮、门票/其他、**总计**；金额用 ¥ 整数。若用户给了预算，总计落在预算 ±10% 内。
4. 【行程流水账】：门到门细规划。跨城写清：①家门口→出发站 ②大交通 ③抵达站→住宿/首站；每段市内须地铁/公交/出租车三方案+🐌落地最佳；目的地内换区>5km 同样写法。
5. 【蜗牛提示】：3–4 句推荐，具体店名/街区，每句以句号收尾。
6. 【避坑指南】：3–4 句避坑，具体地点+金额+替代，**必须最后写完并以句号收尾**。
7. **定位约束**：用户消息里的地点名即规划中心；莆田≠昆明≠弥勒≠泉州，禁止改目的地。
8. ${buildItinerarySegmentOutputTemplate()}
8. 含「出发地」时按门到门全链路规划；${buildDoorToDoorSegmentRules(true)} 公交须写清上车站、换车站、第二路车（大城市）、下车站与步行距离。
9. 花费自洽：流水账分项与【方案简介】总计误差不超过 ¥10。
10. **禁止在正文出现**：经纬度、GCJ-02、精确坐标数字对。`;
}

export function buildMapPlanUserPrompt(
  locationName: string,
  query: string,
  coords?: { lng: number; lat: number },
  originName?: string | null,
): string {
  const trimmed = query.trim();
  const coordinateLine = coords
    ? `\n【内部定位参考，勿写入正文】锚点约 (${coords.lng.toFixed(4)}, ${coords.lat.toFixed(4)})，请围绕「${locationName}」规划。`
    : '';
  const originLine = originName?.trim()
    ? `\n出发地（用户已校正，必须遵守）：${originName.trim()}。\n${buildStrictOriginConstraint(originName)}\n${buildCrossCityDay1LocalTransitHint(originName, locationName)}`
    : '';

  return `地点：${locationName}
需求：${trimmed}${originLine}${coordinateLine}

请按系统要求输出四区块（简介 → 行程流水账 → 蜗牛提示 → 避坑指南），每段写完整。预算/天数须严格遵守。`;
}

function buildCrossCityMockSections(
  origin: string,
  locationName: string,
  trimmedQuery: string,
): string {
  return `【方案简介】

${locationName} 穷游约 2–3 天，从 ${origin} 出发。大交通占预算大头，到了再靠腿和公交省钱。

| 项目 | 金额 | 节省技巧 |
| --- | --- | --- |
| 大交通（${origin}→${locationName}） | ¥180 | 提前抢二等座 |
| 市内+餐饮+门票 | ¥235 | 钻巷子、别在景区主街当 ATM |
| **总计** | **¥415** | 按「${trimmedQuery}」控场 |

【行程流水账】

### 1. 出发·家门口→济南西站（从${origin}）

**地铁**：3 号线转 1 号线，历下上车→济南西站，约 ¥5、40 分钟，早高峰别卡点。

**公交**：「泉城公园南门」站 K139 →「经十路」站换 K156 →「济南西站」东广场，步行约 300 米，约 ¥4、65 分钟，省钱但慢。

**出租车/网约车**：约 ¥30、25 分钟，行李多/赶车可选。

**🐌落地最佳**：推荐地铁，省钱准时；到西站步行至候车厅约 5 分钟。

### 2. 大交通

济南西站→${locationName}高铁约 ¥180、3–4 小时，提前购票。

### 3. 抵达·车站→市区首站

**地铁**：若有地铁线，写清站名+¥+分钟。

**公交**：写清「XX站」上车→线路号→「XX换乘站」换X路→「酒店附近站」下车，步行约X米，¥+分钟（大城市须写换车）。

**出租车/网约车**：约 ¥25–50、20–35 分钟，初到不熟路可选。

**🐌落地最佳**：推荐公交/地铁省钱；赶入住选网约车直达酒店。

**Day 1 下午** — 按需求在${locationName}逛 1–2 个重点（约 ¥80）。

**Day 1 傍晚** — 社区小馆晚饭（约 ¥45），末班公交比熬夜靠谱。

**Day 2** — 补完核心玩法后返程。

【蜗牛提示】

到了${locationName}先问本地人「你自己吃哪家」，比刷十篇攻略快。早市比景区早餐便宜一半。🐌

【避坑指南】

别在车站买「特产礼盒」，往往是义乌分乌。大交通临出发涨价是血泪教训。景区门口拉客拍照先问清价格。`;
}

export function buildMapPlanMockContent(
  locationName: string,
  query: string,
  originName?: string | null,
): string {
  const trimmedQuery = query.trim();
  const originMatch = trimmedQuery.match(/从(.+?)出发/);
  const origin = originName?.trim() || originMatch?.[1]?.trim();
  const isCrossCity = Boolean(origin && origin !== locationName);

  if (isCrossCity && origin) {
    return buildCrossCityMockSections(origin, locationName, trimmedQuery);
  }

  return `【方案简介】

${locationName} 半日～一日穷游，腿着走、胃忙着吃。

| 项目 | 金额 | 节省技巧 |
| --- | --- | --- |
| 交通 | ¥20 | 公交 + 11 路 |
| 餐饮 | ¥45 | 钻巷子 |
| 门票/其他 | ¥30 | 学生证/免费时段 |
| **总计** | **¥95** | 按「${query.trim()}」控场 |

【行程流水账】

**上午 9:00** — 到 ${locationName} 逛免费街区（约 ¥15 小吃）。

**中午 12:00** — 社区小馆午饭（约 ¥30）。

**下午 14:30** — 按需求安排 1–2 个重点。

**傍晚 18:00** — 补给返程。

【蜗牛提示】

看哪桌本地大爷多就坐哪桌。有时候最佳景点是刚出锅的那一口。🐌

【避坑指南】

景区门口「特产」慎买。导览器租了像供祖宗。别信「最后一席」砍价链接。`;
}

/** 连续追问 — 仍输出四区块 Markdown */
export function buildMapPlanContinueSystemPrompt(): string {
  return `${buildMapPlanSystemPrompt()}

补充（连续对话 / 增量修改模式）：
- 上方对话中已有初版方案；用户会提出修改意见（预算、天数、节奏、交通等）。
- 请输出**更新后的完整四区块**，顺序不变：【方案简介】【行程流水账】【蜗牛提示】【避坑指南】。
- **禁止更换目的地城市**；若用户只说「轻松点/压预算」，只改节奏与花费，不要改成别的城市。
- 简介花费表「总计」须与流水账分项误差 ≤ ¥10；改预算时同步改表与流水账。
- 若用户要求与之前冲突，以**最新一条用户消息**为准。`;
}

export function buildMapPlanFollowUpUserPrompt(
  message: string,
  locationName: string,
  intentHint?: string,
): string {
  const hintLine = intentHint?.trim() ? `\n修改约束：${intentHint.trim()}` : '';
  return `目的地：${locationName}（不可更改）${hintLine}
调整需求：${message.trim()}

请根据我们之前的方案和这条新需求，输出更新后的完整四区块穷游方案。`;
}

export function buildMapPlanContinueMockContent(message: string, locationName: string): string {
  return `【方案简介】

已按你的要求调整 ${locationName} 方案：${message.trim()}。预算与交通方式已同步更新。

| 项目 | 金额 | 节省技巧 |
| --- | --- | --- |
| 交通 | ¥25 | 提前买票 |
| 餐饮 | ¥50 | 避开景区主街 |
| **总计** | **¥120** | 还能剩点买水 |

【行程流水账】

**上午** — 按新需求微调景点顺序。

**下午** — 加入你提到的活动。

**傍晚** — 返程。

【蜗牛提示】

${locationName} 老城区傍晚光线适合拍照，不花钱。🐌

【避坑指南】

你提的「${message.trim()}」若涉及夜间出行，末班车时间先查清楚。临时改票容易多花钱。`;
}
