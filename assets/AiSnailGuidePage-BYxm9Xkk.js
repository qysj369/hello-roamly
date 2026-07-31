var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { A as AI_API, b as AI_SNAIL_BUDGET_OPTIONS, e as AI_SNAIL_PREFERENCE_OPTIONS, P as DeepSeekApiError, aP as aiSnailGuideToEditorDraft, eA as toErrorMessage, an as SNAIL_UI_COPY, f1 as useReducedMotion, dG as motion, a as AI_SNAIL_ASSISTANT_NAME, aD as User, bl as cn, i as AiChatMarkdown, _ as LoaderCircle, d as AI_SNAIL_DAY_OPTIONS, ag as RotateCcw, k as AsyncFeedback, eX as usePageSeo, eU as useLocation, Z as Link, dS as paths, B as BRAND_FUNCTION_DESC, aO as aiSnailGuidePageSeo } from "./index-DwV1qlqh.js";
import { S as SlimeTrailPublisher } from "./SlimeTrailPublisher-K_GzDCcr.js";
import { a as assertAiServiceReady, g as getAiProvider, i as isDeepSeekConfigured, b as getAiProviderDisplay, c as getAiProviderDisplayLabel } from "./ai-CeNlrO9U.js";
import { i as isProductionAppMode } from "./appMode-mvxqt0jz.js";
import { i as hasMapService } from "./provider-CMJI8edA.js";
import { c as createDeepSeekChatCompletion } from "./chat-D9gp93Tu.js";
import { a as MotionPage, M as MotionBlock } from "./MotionPage-Bc8Pg75O.js";
import "./vendor-three-Blpl5Qyv.js";
import "./StructuredGuideViewer-CtSg4CrD.js";
import "./SnailSlangTerm-Dp9sc9n7.js";
import "./check-fuogZiuU.js";
import "./slimeTrail-CE9U9eJw.js";
import "./plus-CkCpxI1f.js";
import "./trash-2-DMzHlprq.js";
import "./circle-check-DVB7QD2m.js";
import "./pencil-BlnFE1Bo.js";
import "./credentials-BlGlDwm4.js";
class GenerateGuideApiError extends Error {
  constructor(message, options) {
    super(message);
    __publicField(this, "status");
    __publicField(this, "code");
    this.name = "GenerateGuideApiError";
    this.status = options == null ? void 0 : options.status;
    this.code = options == null ? void 0 : options.code;
  }
}
async function fetchAiSnailGuideFromApi(params) {
  const response = await fetch(AI_API.generateGuide, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(params)
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && "error" in payload && payload.error ? payload.error : `生成攻略失败（HTTP ${response.status}）`;
    throw new GenerateGuideApiError(message, {
      status: response.status,
      code: payload && "code" in payload ? payload.code : void 0
    });
  }
  if (!payload || !("guide" in payload) || !payload.guide) {
    throw new GenerateGuideApiError("API 返回格式无效", { status: response.status });
  }
  return payload.guide;
}
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
function buildAiSnailSystemPrompt() {
  return `你是「AI蜗牛」，蜗牛旅行 App 专为生成结构化穷游攻略而设计的 AI 助手。品牌理念：最真实的穷游攻略库，每一分花费都有出处。

根据用户提供的「目的地、总天数、人均总预算范围、旅行偏好」，输出完整穷游攻略 JSON。攻略须包含以下三大板块（映射到 JSON 字段）：

## 【花费清单】→ costBreakdown
估算并列出分项，每项须提供具体金额（amount）和节省技巧（savingTips 数组）：
- 交通（transportation）
- 住宿（accommodation）
- 餐饮（food）
- 门票/娱乐（entertainment）
- 总计 total：四项之和，**必须落在用户预算区间内**

## 【行程流水账】→ dailyJournal
按天详细叙述（dailyJournal 数组长度必须等于用户天数）：
- narrative：亲切口吻，像朋友分享；写明每天具体地点、活动、时间安排
- expenses：当天开销明细（项目 + 金额）
- tips：实用贴士（交通方式、耗时、省钱窍门）

## 【蜗牛启示】→ snailInsights
- regrets：最后悔的事 / 避坑指南（避坑雷达）
- recommendations：最推荐的事 / 宝藏发现（宝藏点）

## 蜗牛社区语气
- 用户互称「蜗友」；结构化攻略称为「黏液轨迹」
- 总预算可隐喻为「蜗壳」，省钱技巧体现「硬壳穷游」精神
- 语气亲切务实，像蜗友分享经历；不浮夸、不带货、不编造虚假优惠

## 核心要求
1. 所有信息必须具体、真实、可操作；重点突出省钱方法和避坑建议
2. 优先免费/低价景点、公共交通、本地平价小吃、经济型住宿
3. 不要编造无法在目的地实现的虚假 POI
4. 不要输出 JSON 以外的任何文字

${JSON_SCHEMA_HINT}`;
}
function preferenceLabels(preferences) {
  return preferences.map((id) => {
    var _a;
    return (_a = AI_SNAIL_PREFERENCE_OPTIONS.find((option) => option.id === id)) == null ? void 0 : _a.label;
  }).filter((label) => Boolean(label));
}
function buildAiSnailUserPrompt(params) {
  var _a;
  const budgetLabel = ((_a = AI_SNAIL_BUDGET_OPTIONS.find((option) => option.id === params.budgetRange)) == null ? void 0 : _a.label) ?? params.budgetRange;
  const prefs = preferenceLabels(params.preferences);
  return [
    "请生成完整穷游攻略 JSON，包含【花费清单】【行程流水账】【蜗牛启示】三大板块。",
    "",
    "要求：所有信息必须具体、真实、可操作。重点突出省钱方法和避坑建议。",
    `目的地：${params.destination.trim()}`,
    `天数：${params.days}（dailyJournal 必须恰好 ${params.days} 天）`,
    `预算：${budgetLabel}（costBreakdown.total 须在此区间内）`,
    `兴趣：${prefs.join("、")}`
  ].join("\n");
}
function getAiSnailBudgetLabel(params) {
  var _a;
  return ((_a = AI_SNAIL_BUDGET_OPTIONS.find((option) => option.id === params.budgetRange)) == null ? void 0 : _a.label) ?? params.budgetRange;
}
function getAiSnailInterestLabels(params) {
  return preferenceLabels(params.preferences);
}
function generateMockAiSnailGuide(params) {
  const destination = params.destination.trim();
  const budgetLabel = getAiSnailBudgetLabel(params);
  const interests = getAiSnailInterestLabels(params);
  const budgetOption = params.budgetRange === "under500" ? { total: 450, transport: 60, stay: 150, food: 180, fun: 60 } : params.budgetRange === "500-1000" ? { total: 780, transport: 120, stay: 280, food: 300, fun: 80 } : params.budgetRange === "1000-2000" ? { total: 1500, transport: 200, stay: 550, food: 600, fun: 150 } : { total: 2800, transport: 400, stay: 1e3, food: 1100, fun: 300 };
  const dailyJournal = Array.from({ length: params.days }, (_, index) => {
    const day = index + 1;
    return {
      day,
      narrative: `第 ${day} 天早上从市区出发，先逛${destination}的老城区免费街巷，中午找本地人常去的小馆吃碗面（约 ¥15）。下午按你的「${interests[0] ?? "打卡"}」偏好，去一处口碑景点慢慢逛，傍晚坐公交回住处——节奏不紧，像跟朋友闲聊一样把一天晃过去。`,
      expenses: [
        { item: "公交/地铁", amount: Math.round(budgetOption.transport / params.days) },
        { item: "餐饮", amount: Math.round(budgetOption.food / params.days) },
        { item: day === 1 ? "门票" : "小吃", amount: day === 1 ? 40 : 20 }
      ],
      tips: [
        "早出门避开人流，很多免费街区上午最好拍",
        "用地图查公交换乘，比打车省不少",
        "景区门口特产店先别买，城里超市同款更便宜"
      ]
    };
  });
  return {
    id: `snail-mock-${Date.now()}`,
    title: `${destination} ${params.days} 天穷游攻略（演示）`,
    destination,
    days: params.days,
    budgetLabel,
    interests,
    costBreakdown: {
      transportation: {
        amount: budgetOption.transport,
        savingTips: ["优先地铁+公交日票", "景点间距离不远可步行串联"]
      },
      accommodation: {
        amount: budgetOption.stay,
        savingTips: ["选地铁沿线的青旅或连锁经济酒店", "提前 3 天订往往比当天便宜"]
      },
      food: {
        amount: budgetOption.food,
        savingTips: ["午餐吃本地小吃，晚餐简餐", "避开景区主街餐厅"]
      },
      entertainment: {
        amount: budgetOption.fun,
        savingTips: ["优先免费展馆与公园", "学生证/预约票能省一半"]
      },
      total: budgetOption.total
    },
    dailyJournal,
    snailInsights: {
      regrets: `别在${destination}火车站门口坐「黑车」——看着近其实绕路。热门打卡点周末下午人挤人，想省钱省心就工作日早去。`,
      recommendations: `${destination}的早市或老城早段最有烟火气，花很少钱就能吃到地道早餐；傍晚找一处高处看日落，往往免费又惊艳。`
    },
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function extractJsonString(raw) {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch == null ? void 0 : fenceMatch[1]) {
    return fenceMatch[1].trim();
  }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return trimmed;
}
function parseTipList(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item) => typeof item === "string" && item.trim().length > 0).map((item) => item.trim());
}
function parseCostItem(value) {
  if (!value || typeof value !== "object") {
    return { amount: 0, savingTips: [] };
  }
  const record = value;
  const amount = typeof record.amount === "number" && Number.isFinite(record.amount) ? record.amount : 0;
  return {
    amount,
    savingTips: parseTipList(record.savingTips ?? record.tips)
  };
}
function parseCostBreakdown(value) {
  if (!value || typeof value !== "object") {
    throw new DeepSeekApiError("花费清单格式无效", { code: "parse_error" });
  }
  const record = value;
  const transportation = parseCostItem(record.transportation ?? record.transport);
  const accommodation = parseCostItem(record.accommodation ?? record.stay);
  const food = parseCostItem(record.food ?? record.dining);
  const entertainment = parseCostItem(record.entertainment ?? record.tickets);
  const computedTotal = transportation.amount + accommodation.amount + food.amount + entertainment.amount;
  const total = typeof record.total === "number" && Number.isFinite(record.total) ? record.total : computedTotal;
  return {
    transportation,
    accommodation,
    food,
    entertainment,
    total
  };
}
function parseDailyExpense(value) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const record = value;
  const item = typeof record.item === "string" ? record.item.trim() : typeof record.name === "string" ? record.name.trim() : "";
  const amount = typeof record.amount === "number" && Number.isFinite(record.amount) ? record.amount : 0;
  if (!item) {
    return null;
  }
  return { item, amount };
}
function parseDailyJournal(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const entries = [];
  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const record = item;
    const day = typeof record.day === "number" ? record.day : entries.length + 1;
    const narrative = typeof record.narrative === "string" ? record.narrative.trim() : typeof record.content === "string" ? record.content.trim() : "";
    if (!narrative) {
      continue;
    }
    const expenses = Array.isArray(record.expenses) ? record.expenses.map(parseDailyExpense).filter((expense) => expense != null) : [];
    entries.push({
      day,
      narrative,
      expenses,
      tips: parseTipList(record.tips)
    });
  }
  return entries.sort((a, b) => a.day - b.day);
}
function parseSnailInsights(value) {
  if (!value || typeof value !== "object") {
    return { regrets: "", recommendations: "" };
  }
  const record = value;
  return {
    regrets: typeof record.regrets === "string" ? record.regrets.trim() : typeof record.pitfalls === "string" ? record.pitfalls.trim() : "",
    recommendations: typeof record.recommendations === "string" ? record.recommendations.trim() : typeof record.treasures === "string" ? record.treasures.trim() : ""
  };
}
function parseAiSnailGuideFromAiResponse(raw, meta) {
  let parsed;
  try {
    parsed = JSON.parse(extractJsonString(raw));
  } catch {
    throw new DeepSeekApiError("AI 返回的攻略不是有效 JSON", { code: "parse_error" });
  }
  if (!parsed || typeof parsed !== "object") {
    throw new DeepSeekApiError("攻略 JSON 结构无效", { code: "parse_error" });
  }
  const record = parsed;
  const title = typeof record.title === "string" && record.title.trim() ? record.title.trim() : `${meta.destination} ${meta.days} 天穷游攻略`;
  const costBreakdown = parseCostBreakdown(record.costBreakdown ?? record.costs);
  const dailyJournal = parseDailyJournal(record.dailyJournal ?? record.dailyPlans);
  const snailInsights = parseSnailInsights(record.snailInsights ?? record.insights);
  if (dailyJournal.length === 0) {
    throw new DeepSeekApiError("行程流水账为空，请重试", { code: "parse_error" });
  }
  return {
    id: meta.id ?? `snail-guide-${Date.now()}`,
    title,
    destination: meta.destination,
    days: meta.days,
    budgetLabel: meta.budgetLabel,
    interests: meta.interests,
    costBreakdown,
    dailyJournal,
    snailInsights,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function validateParams(params) {
  if (!params.destination.trim()) {
    throw new Error("请填写目的地");
  }
  if (!Number.isFinite(params.days) || params.days < 1) {
    throw new Error("请填写有效的旅行天数");
  }
  if (params.preferences.length === 0) {
    throw new Error("请至少选择一项旅行偏好");
  }
}
async function runAiSnailGuideGeneration(params, complete, options) {
  validateParams(params);
  const destination = params.destination.trim();
  const meta = {
    destination,
    days: params.days,
    budgetLabel: getAiSnailBudgetLabel(params),
    interests: getAiSnailInterestLabels(params),
    id: `snail-${Date.now()}`
  };
  if ((options == null ? void 0 : options.forceMock) || !complete) {
    return generateMockAiSnailGuide(params);
  }
  const raw = await complete({
    messages: [
      { role: "system", content: buildAiSnailSystemPrompt() },
      { role: "user", content: buildAiSnailUserPrompt(params) }
    ],
    temperature: 0.45,
    maxTokens: 3200,
    jsonMode: true
  });
  return parseAiSnailGuideFromAiResponse(raw, meta);
}
async function completeViaDeepSeek(input) {
  return createDeepSeekChatCompletion({
    messages: input.messages,
    temperature: input.temperature,
    maxTokens: input.maxTokens,
    jsonMode: input.jsonMode
  });
}
async function generateViaClientFallback(params) {
  if (isProductionAppMode()) {
    assertAiServiceReady();
  } else if (getAiProvider() === "mock") {
    return runAiSnailGuideGeneration(params, null, { forceMock: true });
  }
  return runAiSnailGuideGeneration(params, completeViaDeepSeek);
}
async function generateAiSnailGuide(params) {
  try {
    return await fetchAiSnailGuideFromApi(params);
  } catch (error) {
    const shouldFallback = error instanceof GenerateGuideApiError && (error.status === 404 || error.status === 502 || error.status === 503);
    if (!shouldFallback && error instanceof GenerateGuideApiError && error.status && error.status < 500) {
      throw error;
    }
    return generateViaClientFallback(params);
  }
}
function createMessage(role, content) {
  return {
    id: `snail-${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
const WELCOME_MESSAGE = SNAIL_UI_COPY.aiWelcome;
const STEP_PROMPTS = {
  days: "好的！**第二步：计划玩几天？**\n点击下方天数，或输入自定义天数。",
  budget: "收到。**第三步：人均总预算大概是多少？**\n请选择以下预算档位（全程人均）。",
  preferences: "明白。**第四步：这次旅行更在意什么？**\n可多选，选好后点「开始生成攻略」。"
};
function formatPreferences(preferences) {
  return preferences.map((id) => {
    var _a;
    return (_a = AI_SNAIL_PREFERENCE_OPTIONS.find((option) => option.id === id)) == null ? void 0 : _a.label;
  }).filter(Boolean).join("、");
}
function useAISnailGuideWizard(options = {}) {
  const { onGuideGenerated } = options;
  const [step, setStep] = reactExports.useState("destination");
  const [messages, setMessages] = reactExports.useState(() => [
    createMessage("assistant", WELCOME_MESSAGE)
  ]);
  const [destination, setDestination] = reactExports.useState("");
  const [days, setDays] = reactExports.useState(null);
  const [budgetRange, setBudgetRange] = reactExports.useState(null);
  const [preferences, setPreferences] = reactExports.useState([]);
  const [isGenerating, setIsGenerating] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [lastGuide, setLastGuide] = reactExports.useState(null);
  const [editorDraft, setEditorDraft] = reactExports.useState(null);
  const [publishedGuideId, setPublishedGuideId] = reactExports.useState(null);
  const requestIdRef = reactExports.useRef(0);
  const scrollTickRef = reactExports.useRef(0);
  const params = reactExports.useMemo(() => {
    if (!destination.trim() || days == null || budgetRange == null || preferences.length === 0) {
      return null;
    }
    return {
      destination: destination.trim(),
      days,
      budgetRange,
      preferences
    };
  }, [budgetRange, days, destination, preferences]);
  const appendMessages = reactExports.useCallback((...next) => {
    setMessages((current) => [...current, ...next]);
    scrollTickRef.current += 1;
  }, []);
  const submitDestination = reactExports.useCallback(
    (value) => {
      const trimmed = value.trim();
      if (!trimmed || step !== "destination") {
        return;
      }
      setDestination(trimmed);
      appendMessages(
        createMessage("user", trimmed),
        createMessage("assistant", STEP_PROMPTS.days)
      );
      setStep("days");
      setError(null);
    },
    [appendMessages, step]
  );
  const submitDays = reactExports.useCallback(
    (value) => {
      if (!Number.isFinite(value) || value < 1 || value > 30 || step !== "days") {
        return;
      }
      setDays(value);
      appendMessages(
        createMessage("user", `${value} 天`),
        createMessage("assistant", STEP_PROMPTS.budget)
      );
      setStep("budget");
      setError(null);
    },
    [appendMessages, step]
  );
  const submitBudget = reactExports.useCallback(
    (value) => {
      var _a;
      if (step !== "budget") {
        return;
      }
      const label = ((_a = AI_SNAIL_BUDGET_OPTIONS.find((option) => option.id === value)) == null ? void 0 : _a.label) ?? value;
      setBudgetRange(value);
      appendMessages(
        createMessage("user", label),
        createMessage("assistant", STEP_PROMPTS.preferences)
      );
      setStep("preferences");
      setError(null);
    },
    [appendMessages, step]
  );
  const togglePreference = reactExports.useCallback((id) => {
    setPreferences(
      (current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }, []);
  const generateGuide = reactExports.useCallback(
    async (selectedPreferences) => {
      if (step !== "preferences" || selectedPreferences.length === 0) {
        setError("请至少选择一项旅行偏好");
        return null;
      }
      const nextParams = {
        destination: destination.trim(),
        days,
        budgetRange,
        preferences: selectedPreferences
      };
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setPreferences(selectedPreferences);
      setStep("generating");
      setIsGenerating(true);
      setError(null);
      appendMessages(
        createMessage("user", formatPreferences(selectedPreferences)),
        createMessage(
          "assistant",
          "信息已收齐，正在生成结构化穷游攻略…\n文字会边生成边出现，请稍候。"
        )
      );
      try {
        const guide = await generateAiSnailGuide(nextParams);
        if (requestIdRef.current !== requestId) {
          return null;
        }
        const draft = aiSnailGuideToEditorDraft(guide);
        setLastGuide(guide);
        setEditorDraft(draft);
        setPublishedGuideId(null);
        setStep("editor");
        onGuideGenerated == null ? void 0 : onGuideGenerated({ guide, editorDraft: draft });
        appendMessages(
          createMessage(
            "assistant",
            `攻略草稿已生成：**${guide.title}**

人均约 ¥${guide.costBreakdown.total} · ${nextParams.days} 天 · ${nextParams.destination}

内容已填入下方**留下黏液轨迹**发布器，请审核微调后发布。`
          )
        );
        return guide;
      } catch (err) {
        if (requestIdRef.current !== requestId) {
          return null;
        }
        const message = toErrorMessage(err, "生成攻略失败，请稍后再试");
        setError(message);
        setStep("preferences");
        appendMessages(createMessage("assistant", `生成时遇到问题：${message}

请调整偏好后重试。`));
        return null;
      } finally {
        if (requestIdRef.current === requestId) {
          setIsGenerating(false);
        }
      }
    },
    [appendMessages, budgetRange, days, destination, onGuideGenerated, step]
  );
  const reset = reactExports.useCallback(() => {
    requestIdRef.current += 1;
    setStep("destination");
    setMessages([createMessage("assistant", WELCOME_MESSAGE)]);
    setDestination("");
    setDays(null);
    setBudgetRange(null);
    setPreferences([]);
    setIsGenerating(false);
    setError(null);
    setLastGuide(null);
    setEditorDraft(null);
    setPublishedGuideId(null);
  }, []);
  const openEditor = reactExports.useCallback(() => {
    if (editorDraft) {
      setStep("editor");
    }
  }, [editorDraft]);
  const markPublished = reactExports.useCallback(
    (guideId) => {
      setPublishedGuideId(guideId);
      setStep("published");
      appendMessages(
        createMessage("assistant", "攻略已发布！可在「攻略」列表中查看，或继续生成下一份。")
      );
    },
    [appendMessages]
  );
  const clearError = reactExports.useCallback(() => {
    setError(null);
  }, []);
  return {
    step,
    messages,
    destination,
    days,
    budgetRange,
    preferences,
    params,
    isGenerating,
    error,
    lastGuide,
    editorDraft,
    publishedGuideId,
    scrollTick: scrollTickRef.current,
    submitDestination,
    submitDays,
    submitBudget,
    togglePreference,
    generateGuide,
    reset,
    openEditor,
    markPublished,
    clearError
  };
}
function useAiSnailScrollToBottom(scrollRef, tick) {
  reactExports.useEffect(() => {
    const node = scrollRef.current;
    if (!node) {
      return;
    }
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [scrollRef, tick]);
}
function AiSnailGuideMessage({ message }) {
  const reduceMotion = useReducedMotion();
  const isUser = message.role === "user";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.article,
    {
      className: cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row"),
      initial: reduceMotion ? false : { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: reduceMotion ? 0 : 0.22 },
      "aria-label": isUser ? "你的消息" : `${AI_SNAIL_ASSISTANT_NAME} 回复`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: cn(
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ring-2 ring-white",
              isUser ? "bg-slate-700 text-white shadow-sm" : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25"
            ),
            "aria-hidden": true,
            children: isUser ? /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }) : "🐌"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex min-w-0 max-w-[min(100%,28rem)] flex-col", isUser && "items-end"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn(
                "mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider",
                isUser ? "text-slate-400" : "text-emerald-700"
              ),
              children: isUser ? "你" : AI_SNAIL_ASSISTANT_NAME
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cn(
                "w-full rounded-2xl px-3.5 py-2.5 shadow-sm",
                isUser ? "rounded-tr-md bg-gradient-to-br from-emerald-600 to-teal-700 text-white" : "rounded-tl-md border border-slate-200/90 bg-white text-slate-800 ring-1 ring-slate-100 border-l-[3px] border-l-emerald-400"
              ),
              children: isUser ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap text-sm leading-relaxed", children: message.content }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AiChatMarkdown, { content: message.content, className: "text-sm leading-relaxed" })
            }
          )
        ] })
      ]
    }
  );
}
const AiSnailGuideMessage$1 = reactExports.memo(AiSnailGuideMessage);
function AiSnailGuidePublishSection({
  initialDraft,
  aiGeneratedContent,
  sourceGuideId,
  publishedGuideId,
  isPublished,
  onPublished
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    SlimeTrailPublisher,
    {
      initialDraft,
      aiGeneratedContent,
      sourceGuideId,
      publishedGuideId,
      isPublished,
      onPublished: (record) => onPublished(record.id),
      className: "space-y-3"
    }
  );
}
function OptionButton({
  children,
  selected,
  onClick,
  disabled
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      disabled,
      onClick,
      className: cn(
        "rounded-xl border px-3 py-2 text-sm font-medium transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50"
      ),
      children
    }
  );
}
function AiSnailGuideStepPanel({
  step,
  preferences,
  isGenerating,
  onSubmitDestination,
  onSubmitDays,
  onSubmitBudget,
  onTogglePreference,
  onGenerate,
  onOpenEditor,
  hasDraft
}) {
  const [destinationDraft, setDestinationDraft] = reactExports.useState("");
  const [customDays, setCustomDays] = reactExports.useState("");
  function handleDestinationSubmit(event) {
    event.preventDefault();
    onSubmitDestination(destinationDraft);
    setDestinationDraft("");
  }
  function handleCustomDaysSubmit(event) {
    event.preventDefault();
    const value = Number(customDays);
    if (Number.isFinite(value)) {
      onSubmitDays(value);
      setCustomDays("");
    }
  }
  if (step === "generating") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 border-t border-slate-200/80 bg-white px-4 py-5 text-sm text-slate-600", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin text-emerald-600", "aria-hidden": true }),
      "AI蜗牛正在生成结构化穷游攻略…"
    ] });
  }
  if (step === "editor" || step === "published") {
    return null;
  }
  if (hasDraft && onOpenEditor) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-slate-200/80 bg-white px-4 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: onOpenEditor,
        className: "w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105",
        children: "打开攻略发布编辑器"
      }
    ) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-slate-200/80 bg-white px-4 py-4", children: [
    step === "destination" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleDestinationSubmit, className: "flex flex-col gap-3 sm:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: destinationDraft,
          onChange: (event) => setDestinationDraft(event.target.value),
          placeholder: "例如：济南、大理、厦门",
          "aria-label": "目的地",
          className: "min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: !destinationDraft.trim(),
          className: "rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-50",
          children: "下一步"
        }
      )
    ] }),
    step === "days" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: AI_SNAIL_DAY_OPTIONS.map((day) => /* @__PURE__ */ jsxRuntimeExports.jsxs(OptionButton, { onClick: () => onSubmitDays(day), children: [
        day,
        " 天"
      ] }, day)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCustomDaysSubmit, className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            min: 1,
            max: 30,
            value: customDays,
            onChange: (event) => setCustomDays(event.target.value),
            placeholder: "自定义天数",
            "aria-label": "自定义天数",
            className: "min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: !customDays,
            className: "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 disabled:opacity-50",
            children: "确定"
          }
        )
      ] })
    ] }),
    step === "budget" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-4", children: AI_SNAIL_BUDGET_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(OptionButton, { onClick: () => onSubmitBudget(option.id), children: option.label }, option.id)) }),
    step === "preferences" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: AI_SNAIL_PREFERENCE_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        OptionButton,
        {
          selected: preferences.includes(option.id),
          onClick: () => onTogglePreference(option.id),
          disabled: isGenerating,
          children: option.label
        },
        option.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          disabled: preferences.length === 0 || isGenerating,
          onClick: () => onGenerate(preferences),
          className: "w-full rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 py-3.5 text-sm font-bold text-white shadow-[0_6px_20px_rgba(16,185,129,0.35)] transition hover:brightness-105 disabled:opacity-50",
          children: "开始生成攻略"
        }
      )
    ] })
  ] });
}
function ProductionModeNotice({ className }) {
  if (!isProductionAppMode()) {
    return null;
  }
  const aiReady = isDeepSeekConfigured();
  const mapReady = hasMapService();
  const allReady = aiReady && mapReady;
  if (allReady) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "p",
      {
        className: cn(
          "rounded-lg border border-emerald-200/90 bg-emerald-50/90 px-3 py-2 text-xs leading-relaxed text-emerald-900",
          className
        ),
        role: "status",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-semibold", children: "上线模式" }),
          "：已启用 DeepSeek 对话/行程生成",
          mapReady ? "与高德地图" : "",
          "。演示地图与 Mock 行程已关闭。"
        ]
      }
    );
  }
  const missing = [];
  if (!aiReady) {
    missing.push("VITE_DEEPSEEK_API_KEY");
  }
  if (!mapReady) {
    missing.push("VITE_AMAP_KEY + VITE_AMAP_SECURITY_CODE");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "p",
    {
      className: cn(
        "rounded-lg border border-amber-200/90 bg-amber-50/90 px-3 py-2 text-xs leading-relaxed text-amber-950",
        className
      ),
      role: "alert",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-semibold", children: "上线模式" }),
        "（",
        getAiProviderDisplay() === "unconfigured" ? "AI 未配置" : "配置不完整",
        "）：请在本机 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-white/80 px-1", children: ".env.local" }),
        " 填写",
        " ",
        missing.join("、"),
        "，保存后 ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-semibold", children: "重启 pnpm dev" }),
        "。 未配置前无法生成真实 AI 行程。"
      ]
    }
  );
}
function AISnailGuideWizard({
  className,
  initialDestination,
  onGuideGenerated
}) {
  var _a;
  const scrollRef = reactExports.useRef(null);
  const wizard = useAISnailGuideWizard({ onGuideGenerated });
  const aiProvider = getAiProviderDisplay();
  const seededRef = reactExports.useRef(false);
  const { submitDestination, step } = wizard;
  const inEditorPhase = step === "editor" || step === "published";
  useAiSnailScrollToBottom(scrollRef, wizard.scrollTick);
  reactExports.useEffect(() => {
    const destination = initialDestination == null ? void 0 : initialDestination.trim();
    if (!destination || seededRef.current || step !== "destination") {
      return;
    }
    seededRef.current = true;
    submitDestination(destination);
  }, [initialDestination, step, submitDestination]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("space-y-4", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/50 shadow-sm",
          inEditorPhase ? "max-h-[14rem]" : "h-[min(36rem,calc(100dvh-10rem))] max-h-[calc(100dvh-10rem)]"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "flex items-center gap-2 text-sm font-bold text-slate-900", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, children: "🐌" }),
                AI_SNAIL_ASSISTANT_NAME,
                inEditorPhase && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800", children: "草稿已生成" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-slate-500", children: aiProvider === "deepseek" ? "已连接 DeepSeek · 经 /api/ai/generate-guide 生成" : aiProvider === "unconfigured" ? `上线模式 · ${getAiProviderDisplayLabel(aiProvider)}` : isProductionAppMode() ? "请配置 DEEPSEEK_API_KEY 或 VITE_DEEPSEEK_API_KEY" : "演示模式 · 配置 API Key 后启用真实生成" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: wizard.reset,
                disabled: wizard.isGenerating,
                className: "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5", "aria-hidden": true }),
                  "重新开始"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProductionModeNotice, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              ref: scrollRef,
              className: "min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3",
              role: "log",
              "aria-live": "polite",
              children: [
                wizard.messages.map((message) => /* @__PURE__ */ jsxRuntimeExports.jsx(AiSnailGuideMessage$1, { message }, message.id)),
                wizard.isGenerating && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pl-10 text-xs text-slate-500", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin text-emerald-600", "aria-hidden": true }),
                  "正在通过 API 生成攻略…"
                ] })
              ]
            }
          ),
          !inEditorPhase && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 px-3 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              AsyncFeedback,
              {
                error: wizard.error,
                onDismissError: wizard.clearError,
                onRetry: () => wizard.generateGuide(wizard.preferences),
                retryLabel: "重新生成"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AiSnailGuideStepPanel,
              {
                step: wizard.step,
                preferences: wizard.preferences,
                isGenerating: wizard.isGenerating,
                onSubmitDestination: wizard.submitDestination,
                onSubmitDays: wizard.submitDays,
                onSubmitBudget: wizard.submitBudget,
                onTogglePreference: wizard.togglePreference,
                onGenerate: wizard.generateGuide,
                onReset: wizard.reset,
                onOpenEditor: wizard.openEditor,
                hasDraft: Boolean(wizard.editorDraft)
              }
            )
          ] })
        ]
      }
    ),
    wizard.editorDraft && inEditorPhase && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AiSnailGuidePublishSection,
      {
        initialDraft: wizard.editorDraft,
        aiGeneratedContent: wizard.lastGuide,
        sourceGuideId: (_a = wizard.lastGuide) == null ? void 0 : _a.id,
        publishedGuideId: wizard.publishedGuideId,
        isPublished: step === "published",
        onPublished: wizard.markPublished
      }
    )
  ] });
}
function AiSnailGuidePage() {
  var _a;
  usePageSeo(aiSnailGuidePageSeo());
  const location = useLocation();
  const routeState = location.state;
  const initialDestination = (_a = routeState == null ? void 0 : routeState.destination) == null ? void 0 : _a.trim();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MotionPage, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MotionBlock, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "mb-3 flex items-center gap-2 text-xs text-slate-500", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: paths.home, className: "font-medium text-brand-600 hover:text-brand-700", children: "首页" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, children: "/" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-700", children: "AI生成攻略" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-slate-900 sm:text-2xl", children: "AI生成攻略" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-slate-600", children: [
        BRAND_FUNCTION_DESC,
        " · 由 AI蜗牛 分步引导，生成可执行的穷游行程。"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AISnailGuideWizard, { initialDestination })
  ] }) });
}
export {
  AiSnailGuidePage as default
};
