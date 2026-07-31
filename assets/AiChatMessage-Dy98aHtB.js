var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { bw as createLucideIcon, aw as TRAVEL_INTEREST_OPTIONS, ay as TRAVEL_PACE_OPTIONS, A as AI_API, dP as parseSseStream, o as BRAND_NAME, eA as toErrorMessage, F as ContentModerationRejectedError, p as BUDGET_RANGE_LIMITS, y as ChevronDown, bl as cn, di as isAdvisorReplySpeechActive, eu as stripAdvisorReplyForSpeech, er as stopAdvisorReplySpeech, eo as splitAdvisorReplySpeechDelta, bG as enqueueAdvisorReplySpeech, c3 as getAdvisorReplySpeechQueue, cV as getSpeechRecognitionCtor, dn as isEmbeddedMicBlockedContext, bF as embeddedMicBlockedHint, fa as warmupAdvisorSpeechModel, dj as isBlockedAdvisorSpeechHallucination, aM as advisorSpeechFailureHint, dD as measurePeakAmplitude, eD as transcribePcmSamples, dm as isChromeBrowser, h as AdvisorPcmRecorder, bY as formatMicrophoneStartError, eK as useAdvisorVoiceDialog, l as AudioLines, _ as LoaderCircle, a4 as Mic, ap as Send, bX as formatInputLevelPercent, aL as advisorSpeechBrowserHint, at as Sparkles, a1 as MapPin, r as Bookmark, aq as Share2, f1 as useReducedMotion, dG as motion, aD as User, i as AiChatMarkdown } from "./index-DwV1qlqh.js";
import { a as reactExports, j as jsxRuntimeExports } from "./vendor-react-DtfH6MSw.js";
import { a as assertContentAllowed } from "./moderate-B_EMCIaW.js";
import { a as assertAiServiceReady, g as getAiProvider, b as getAiProviderDisplay } from "./ai-CeNlrO9U.js";
import { i as isProductionAppMode } from "./appMode-mvxqt0jz.js";
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M10 5H3", key: "1qgfaw" }],
  ["path", { d: "M12 19H3", key: "yhmn1j" }],
  ["path", { d: "M14 3v4", key: "1sua03" }],
  ["path", { d: "M16 17v4", key: "1q0r14" }],
  ["path", { d: "M21 12h-9", key: "1o4lsq" }],
  ["path", { d: "M21 19h-5", key: "1rlt1p" }],
  ["path", { d: "M21 5h-7", key: "1oszz2" }],
  ["path", { d: "M8 10v4", key: "tgpxqk" }],
  ["path", { d: "M8 12H3", key: "a7s4jb" }]
];
const SlidersHorizontal = createLucideIcon("sliders-horizontal", __iconNode$1);
/**
 * @license lucide-react v1.16.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
];
const Square = createLucideIcon("square", __iconNode);
function delay$1(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
function pickContextLine(context) {
  var _a, _b, _c, _d;
  if (!context) {
    return null;
  }
  const parts = [];
  if ((_a = context.dream) == null ? void 0 : _a.trim()) {
    parts.push(`你的想法：${context.dream.trim()}`);
  }
  if ((_b = context.destination) == null ? void 0 : _b.trim()) {
    parts.push(`目的地：${context.destination.trim()}`);
  }
  if (context.days != null) {
    parts.push(`约 ${context.days} 天`);
  }
  if (context.travelParams) {
    const { budgetMin, budgetMax, interests, pace } = context.travelParams;
    parts.push(`预算 ${budgetMin}–${budgetMax} 元`);
    if (interests.length > 0) {
      const labels = interests.map((id) => {
        var _a2;
        return (_a2 = TRAVEL_INTEREST_OPTIONS.find((o) => o.id === id)) == null ? void 0 : _a2.label;
      }).filter(Boolean);
      parts.push(`兴趣：${labels.join("、")}`);
    }
    const paceLabel = (_c = TRAVEL_PACE_OPTIONS.find((o) => o.id === pace)) == null ? void 0 : _c.label;
    if (paceLabel) {
      parts.push(`节奏：${paceLabel}`);
    }
  } else if ((_d = context.budget) == null ? void 0 : _d.trim()) {
    parts.push(`预算约 ¥${context.budget.trim()}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}
function buildReply(userText, context) {
  var _a;
  const text = userText.trim();
  const lower = text.toLowerCase();
  const contextLine = pickContextLine(context);
  if (/预算|多少钱|花费|省钱/.test(text)) {
    const header = contextLine ? `> ${contextLine}

` : "";
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
      "美食线可以这样排：上午景点 → 午市小吃集中区 → 傍晚夜景/步行街。",
      "优先选本地人排队的小店；景区门口套餐通常性价比低。",
      (context == null ? void 0 : context.destination) ? `若去${context.destination}，我可以结合攻略库帮你筛「高性价比」美食标签路线。` : "告诉我目的地，我能匹配站内已有的美食向攻略。"
    ].join("\n\n");
  }
  if (/交通|怎么去|地铁|公交|机票|火车/.test(text)) {
    return [
      "交通优先级：高铁/动车到站 → 地铁或机场快线进城 → 市内地铁/公交日票。",
      "跨区景点用「同一方向」串点，避免折返；晚间回酒店路线提前看好末班车时间。",
      "你若有具体出发城市，我可以帮你写一版到达+市内动线顺序。"
    ].join("\n\n");
  }
  if (/攻略|推荐|景点|行程|规划|路线/.test(text) || lower.includes("plan")) {
    const dest = ((_a = context == null ? void 0 : context.destination) == null ? void 0 : _a.trim()) ?? "目的地";
    const header = contextLine ? `> ${contextLine}

` : "";
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
    `收到：「${text.slice(0, 120)}${text.length > 120 ? "…" : ""}」`,
    "我是 Hello Roamly 旅行顾问（演示模式）。你可以继续问：预算怎么拆、交通怎么省、或让我推荐同风格目的地。",
    "也可以直接说「帮我规划 X 城 Y 天 Z 元」。"
  ].filter(Boolean).join("\n\n");
}
async function generateMockChatReply(messages, context) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const userText = (lastUser == null ? void 0 : lastUser.content) ?? "";
  await delay$1(600 + Math.min(userText.length * 8, 900));
  return buildReply(userText, context);
}
class AiChatStreamError extends Error {
  constructor(message, code) {
    super(message);
    __publicField(this, "code");
    this.name = "AiChatStreamError";
    this.code = code;
  }
}
async function streamChatFromApi({
  request,
  signal,
  onDelta
}) {
  const response = await fetch(AI_API.chatStream, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream"
    },
    body: JSON.stringify(request),
    signal
  });
  const contentType = response.headers.get("Content-Type") ?? "";
  if (response.status === 503 || response.status === 501) {
    return "unconfigured";
  }
  if (!response.ok && !contentType.includes("text/event-stream")) {
    let message = `流式对话失败 (${response.status})`;
    try {
      const json = await response.json();
      if (json.error) {
        message = json.error;
      }
    } catch {
    }
    throw new AiChatStreamError(message, "http_error");
  }
  if (!response.body) {
    throw new AiChatStreamError("未收到流式响应", "no_body");
  }
  let finished = false;
  let unconfigured = false;
  await parseSseStream(
    response.body,
    {
      onEvent: (event, data) => {
        if (event === "delta") {
          const payload = data;
          if (payload.text) {
            onDelta(payload.text);
          }
          return;
        }
        if (event === "done") {
          finished = true;
          return;
        }
        if (event === "error") {
          const payload = data;
          if (payload.code === "deepseek_unconfigured") {
            unconfigured = true;
            return;
          }
          throw new AiChatStreamError(payload.message ?? "流式回复失败", payload.code);
        }
      }
    },
    signal
  );
  if (unconfigured) {
    return "unconfigured";
  }
  if (!finished && !(signal == null ? void 0 : signal.aborted)) {
    throw new AiChatStreamError("流式连接意外结束", "incomplete");
  }
  return "done";
}
function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
async function mockStreamChatReply(messages, context, options) {
  var _a;
  const full = await generateMockChatReply(messages, context);
  const chunkSize = 3;
  const pauseMs = 28;
  for (let i = 0; i < full.length; i += chunkSize) {
    if ((_a = options.signal) == null ? void 0 : _a.aborted) {
      return;
    }
    options.onDelta(full.slice(i, i + chunkSize));
    await delay(pauseMs);
  }
}
function toStreamTurns(messages) {
  return messages.filter(
    (message) => (message.role === "user" || message.role === "assistant") && message.content.trim().length > 0
  ).map((message) => ({
    role: message.role,
    content: message.content.trim()
  }));
}
async function streamChatReply({
  messages,
  context,
  signal,
  onDelta
}) {
  const turns = toStreamTurns(messages);
  if (turns.length === 0) {
    throw new AiChatStreamError("没有可发送的对话内容", "empty_messages");
  }
  try {
    const result = await streamChatFromApi({
      request: { messages: turns, context },
      signal,
      onDelta
    });
    if (result === "done") {
      return;
    }
  } catch (error) {
    if (signal == null ? void 0 : signal.aborted) {
      return;
    }
    if (error instanceof AiChatStreamError && error.code !== "deepseek_unconfigured") {
      throw error;
    }
    if (!(error instanceof AiChatStreamError)) {
      const message = error instanceof Error ? error.message : "流式对话失败";
      if (!/fetch|network|Failed to fetch/i.test(message)) {
        throw error;
      }
    }
  }
  if (isProductionAppMode()) {
    assertAiServiceReady();
    throw new AiChatStreamError(
      "上线模式需要配置服务端 DeepSeek Key（DEEPSEEK_API_KEY）",
      "deepseek_unconfigured"
    );
  }
  if (getAiProvider() === "mock") {
    await mockStreamChatReply(messages, context, { signal, onDelta });
    return;
  }
  throw new AiChatStreamError("流式对话不可用，请检查服务端 API 配置", "unavailable");
}
const AI_CHAT_WELCOME_MESSAGE_ID = "welcome-seed";
const SEED_ASSISTANT = `你好，我是 **${BRAND_NAME} 旅行顾问**。在下方输入框直接说目的地、天数和预算即可；也可点底部快捷问题一键提问。`;
function createMessage(role, content, status = "complete", id) {
  return {
    id: id ?? `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    status
  };
}
function useAiChat({
  context,
  seedAssistant,
  initialMessages,
  onConversationUpdate
} = {}) {
  const reactId = reactExports.useId();
  const resolvedSeed = seedAssistant === void 0 ? SEED_ASSISTANT : seedAssistant;
  const [messages, setMessages] = reactExports.useState(() => {
    if (initialMessages && initialMessages.length > 0) {
      return initialMessages;
    }
    if (!resolvedSeed.trim()) {
      return [];
    }
    return [createMessage("assistant", resolvedSeed, "complete", AI_CHAT_WELCOME_MESSAGE_ID)];
  });
  const messagesRef = reactExports.useRef(messages);
  messagesRef.current = messages;
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [isStreaming, setIsStreaming] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const requestIdRef = reactExports.useRef(0);
  const abortRef = reactExports.useRef(null);
  const patchAssistant = reactExports.useCallback((assistantId, patch) => {
    setMessages((prev) => {
      const next = prev.map(
        (message) => message.id === assistantId ? { ...message, ...patch } : message
      );
      messagesRef.current = next;
      return next;
    });
  }, []);
  const removeMessage = reactExports.useCallback((messageId) => {
    setMessages((prev) => {
      const next = prev.filter((message) => message.id !== messageId);
      messagesRef.current = next;
      return next;
    });
  }, []);
  const runStream = reactExports.useCallback(
    async (history, requestId, assistantId) => {
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);
      try {
        await streamChatReply({
          messages: history,
          context,
          signal: controller.signal,
          onDelta: (chunk) => {
            if (requestIdRef.current !== requestId) {
              return;
            }
            setMessages((prev) => {
              const next = prev.map(
                (message) => message.id === assistantId ? { ...message, content: message.content + chunk } : message
              );
              messagesRef.current = next;
              return next;
            });
          }
        });
        if (requestIdRef.current !== requestId) {
          return;
        }
        patchAssistant(assistantId, { status: "complete" });
        onConversationUpdate == null ? void 0 : onConversationUpdate(messagesRef.current);
      } catch (err) {
        if (requestIdRef.current !== requestId) {
          return;
        }
        if (controller.signal.aborted) {
          const partial = messagesRef.current.find((message) => message.id === assistantId);
          if (!(partial == null ? void 0 : partial.content.trim())) {
            removeMessage(assistantId);
          } else {
            patchAssistant(assistantId, { status: "complete" });
          }
          return;
        }
        removeMessage(assistantId);
        if (err instanceof AiChatStreamError) {
          setError(err.message);
        } else {
          setError(toErrorMessage(err, "回复失败，请稍后重试", "chat"));
        }
      } finally {
        if (requestIdRef.current === requestId) {
          abortRef.current = null;
          setIsStreaming(false);
          setIsLoading(false);
        }
      }
    },
    [context, onConversationUpdate, patchAssistant, removeMessage]
  );
  const sendMessage = reactExports.useCallback(
    async (rawText, options) => {
      const text = rawText.trim();
      if (!text || isLoading) {
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        await assertContentAllowed({ scene: "ai_chat", text });
      } catch (err) {
        setIsLoading(false);
        if (err instanceof ContentModerationRejectedError) {
          setError(err.message);
          return;
        }
        setError(toErrorMessage(err, "内容审核失败", "chat"));
        return;
      }
      const userMessage = createMessage("user", text);
      if (options == null ? void 0 : options.hideUserBubble) {
        userMessage.hidden = true;
      }
      const assistantPlaceholder = createMessage("assistant", "", "streaming");
      const nextMessages = [...messagesRef.current, userMessage, assistantPlaceholder];
      messagesRef.current = nextMessages;
      setMessages(nextMessages);
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      await runStream(nextMessages, requestId, assistantPlaceholder.id);
    },
    [isLoading, runStream]
  );
  const retryLastMessage = reactExports.useCallback(async () => {
    if (isLoading) {
      return;
    }
    let currentMessages = messagesRef.current;
    const last = currentMessages[currentMessages.length - 1];
    if (!last) {
      return;
    }
    if (last.role === "assistant") {
      currentMessages = currentMessages.slice(0, -1);
      messagesRef.current = currentMessages;
      setMessages(currentMessages);
    }
    const lastUser = currentMessages[currentMessages.length - 1];
    if (!lastUser || lastUser.role !== "user") {
      return;
    }
    setIsLoading(true);
    setError(null);
    const assistantPlaceholder = createMessage("assistant", "", "streaming");
    const withAssistant = [...currentMessages, assistantPlaceholder];
    messagesRef.current = withAssistant;
    setMessages(withAssistant);
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    await runStream(withAssistant, requestId, assistantPlaceholder.id);
  }, [isLoading, runStream]);
  const abortStream = reactExports.useCallback(() => {
    var _a;
    (_a = abortRef.current) == null ? void 0 : _a.abort();
  }, []);
  const clearError = reactExports.useCallback(() => {
    setError(null);
  }, []);
  const resetChat = reactExports.useCallback(() => {
    var _a;
    (_a = abortRef.current) == null ? void 0 : _a.abort();
    requestIdRef.current += 1;
    const seed = resolvedSeed.trim() ? [createMessage("assistant", resolvedSeed, "complete", AI_CHAT_WELCOME_MESSAGE_ID)] : [];
    messagesRef.current = seed;
    setMessages(seed);
    setIsLoading(false);
    setIsStreaming(false);
    setError(null);
  }, [resolvedSeed]);
  const provider = getAiProviderDisplay();
  return {
    messages,
    isLoading,
    isStreaming,
    error,
    provider,
    sendMessage,
    retryLastMessage,
    abortStream,
    clearError,
    resetChat,
    composerId: `ai-chat-input-${reactId}`
  };
}
function parseBudgetHint(budget) {
  const parsed = Number.parseInt(budget ?? "", 10);
  if (Number.isNaN(parsed)) {
    return { budgetMin: 1500, budgetMax: 3500 };
  }
  const max = Math.min(BUDGET_RANGE_LIMITS.max, Math.max(BUDGET_RANGE_LIMITS.min, parsed));
  const min = Math.max(BUDGET_RANGE_LIMITS.min, Math.floor(max * 0.6));
  return { budgetMin: min, budgetMax: max };
}
function createDefaultTravelParams(context) {
  const budget = parseBudgetHint(context == null ? void 0 : context.budget);
  return {
    ...budget,
    days: (context == null ? void 0 : context.days) ?? 3,
    interests: ["food", "culture"],
    pace: "balanced"
  };
}
function useAiTravelParams({ initialContext } = {}) {
  const [params, setParams] = reactExports.useState(() => createDefaultTravelParams(initialContext));
  const setBudgetMin = reactExports.useCallback((budgetMin) => {
    setParams((prev) => {
      const nextMin = Math.min(budgetMin, prev.budgetMax - BUDGET_RANGE_LIMITS.step);
      return { ...prev, budgetMin: Math.max(BUDGET_RANGE_LIMITS.min, nextMin) };
    });
  }, []);
  const setBudgetMax = reactExports.useCallback((budgetMax) => {
    setParams((prev) => {
      const nextMax = Math.max(budgetMax, prev.budgetMin + BUDGET_RANGE_LIMITS.step);
      return { ...prev, budgetMax: Math.min(BUDGET_RANGE_LIMITS.max, nextMax) };
    });
  }, []);
  const setDays = reactExports.useCallback((days) => {
    setParams((prev) => ({ ...prev, days }));
  }, []);
  const setPace = reactExports.useCallback((pace) => {
    setParams((prev) => ({ ...prev, pace }));
  }, []);
  const toggleInterest = reactExports.useCallback((interest) => {
    setParams((prev) => {
      const exists = prev.interests.includes(interest);
      const interests = exists ? prev.interests.filter((item) => item !== interest) : [...prev.interests, interest];
      return { ...prev, interests };
    });
  }, []);
  const resetParams = reactExports.useCallback(() => {
    setParams(createDefaultTravelParams(initialContext));
  }, [initialContext]);
  const chatContext = reactExports.useMemo(
    () => ({
      ...initialContext,
      days: params.days,
      budget: String(params.budgetMax),
      travelParams: params
    }),
    [initialContext, params]
  );
  return {
    params,
    chatContext,
    setBudgetMin,
    setBudgetMax,
    setDays,
    setPace,
    toggleInterest,
    resetParams
  };
}
const AI_CHAT_FEATURED_CITIES = [
  { id: "beijing", name: "北京" },
  { id: "shanghai", name: "上海" },
  { id: "xian", name: "西安" },
  { id: "chengdu", name: "成都" },
  { id: "chongqing", name: "重庆" },
  { id: "hangzhou", name: "杭州" },
  { id: "qingdao", name: "青岛" }
];
const AI_CHAT_MORE_CITIES = [
  { id: "nanjing", name: "南京" },
  { id: "suzhou", name: "苏州" },
  { id: "xiamen", name: "厦门" },
  { id: "dali", name: "大理" },
  { id: "jinan", name: "济南" },
  { id: "yangzhou", name: "扬州" },
  { id: "changsha", name: "长沙" },
  // 华北东北
  { id: "tianjin", name: "天津" },
  { id: "qinhuangdao", name: "秦皇岛" },
  { id: "chengde", name: "承德" },
  { id: "datong", name: "大同" },
  { id: "pingyao", name: "平遥" },
  { id: "taiyuan", name: "太原" },
  { id: "hohhot", name: "呼和浩特" },
  { id: "harbin", name: "哈尔滨" },
  { id: "changchun", name: "长春" },
  { id: "shenyang", name: "沈阳" },
  { id: "dalian", name: "大连" },
  { id: "dandong", name: "丹东" },
  // 华东
  { id: "wuxi", name: "无锡" },
  { id: "ningbo", name: "宁波" },
  { id: "wenzhou", name: "温州" },
  { id: "jiaxing", name: "嘉兴" },
  { id: "shaoxing", name: "绍兴" },
  { id: "wuyuan", name: "婺源" },
  { id: "huangshan", name: "黄山" },
  { id: "mount-lu", name: "庐山" },
  { id: "fuzhou", name: "福州" },
  { id: "xiamen-gulangyu", name: "鼓浪屿" },
  { id: "quanzhou", name: "泉州" },
  { id: "wuyishan", name: "武夷山" },
  { id: "weihai", name: "威海" },
  { id: "yantai", name: "烟台" },
  { id: "taishan", name: "泰山" },
  { id: "qufu", name: "曲阜" },
  { id: "luoyang", name: "洛阳" },
  { id: "kaifeng", name: "开封" },
  { id: "zhengzhou", name: "郑州" },
  // 华中华南
  { id: "wuhan", name: "武汉" },
  { id: "yichang", name: "宜昌" },
  { id: "zhangjiajie", name: "张家界" },
  { id: "fenghuang", name: "凤凰" },
  { id: "changde", name: "常德" },
  { id: "nanchang", name: "南昌" },
  { id: "jingdezhen", name: "景德镇" },
  { id: "guangzhou", name: "广州" },
  { id: "shenzhen", name: "深圳" },
  { id: "zhuhai", name: "珠海" },
  { id: "shantou", name: "汕头" },
  { id: "chaozhou", name: "潮州" },
  { id: "guilin", name: "桂林" },
  { id: "yangshuo", name: "阳朔" },
  { id: "beihai", name: "北海" },
  { id: "sanya", name: "三亚" },
  { id: "haikou", name: "海口" },
  // 西南西北
  { id: "chengdu-leshan", name: "乐山" },
  { id: "emei", name: "峨眉山" },
  { id: "jiuzhaigou", name: "九寨沟" },
  { id: "kunming", name: "昆明" },
  { id: "tengchong", name: "腾冲" },
  { id: "lijiang", name: "丽江" },
  { id: "shangrila", name: "香格里拉" },
  { id: "xishuangbanna", name: "西双版纳" },
  { id: "guiyang", name: "贵阳" },
  { id: "zunyi", name: "遵义" },
  { id: "chongqing-wulong", name: "武隆" },
  { id: "lanzhou", name: "兰州" },
  { id: "dunhuang", name: "敦煌" },
  { id: "zhangye", name: "张掖" },
  { id: "xining", name: "西宁" },
  { id: "lhasa", name: "拉萨" },
  { id: "urumqi", name: "乌鲁木齐" },
  { id: "kashgar", name: "喀什" },
  { id: "yining", name: "伊犁" }
];
[
  ...AI_CHAT_FEATURED_CITIES,
  ...AI_CHAT_MORE_CITIES.filter(
    (city) => !AI_CHAT_FEATURED_CITIES.some((featured) => featured.name === city.name)
  )
];
function buildHotCityPlanPrompt(cityName, params) {
  const trimmed = cityName.trim();
  return `帮我规划${trimmed}${params.days}天的穷游行程，预算${params.budgetMin}–${params.budgetMax}元，含交通、住宿和花费清单`;
}
function CityChip({
  city,
  disabled,
  variant = "default",
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      disabled,
      "aria-label": `快捷规划：${city.name}`,
      onClick,
      className: cn(
        "shrink-0 rounded-full border px-2.5 py-1.5 text-[10px] font-medium transition",
        variant === "capsule" ? "border-cyan-500/35 bg-cyan-500/8 text-cyan-100/88 hover:border-cyan-400/55 hover:bg-cyan-400/12 hover:text-cyan-50" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700",
        "disabled:pointer-events-none disabled:opacity-50"
      ),
      children: city.name
    }
  );
}
function AIChatHotCityPicker({
  travelParams,
  disabled = false,
  variant = "default",
  onSelectCity
}) {
  const [moreOpen, setMoreOpen] = reactExports.useState(false);
  const sendCity = reactExports.useMemo(
    () => (cityName) => {
      onSelectCity(buildHotCityPlanPrompt(cityName, travelParams));
    },
    [onSelectCity, travelParams]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2", role: "region", "aria-label": "热门城市快捷规划", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-nowrap items-center gap-1.5 overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: [
      AI_CHAT_FEATURED_CITIES.map((city) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        CityChip,
        {
          city,
          variant,
          disabled,
          onClick: () => sendCity(city.name)
        },
        city.id
      )),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          disabled,
          "aria-expanded": moreOpen,
          "aria-label": moreOpen ? "收起更多城市" : "展开更多城市",
          onClick: () => setMoreOpen((open) => !open),
          className: cn(
            "inline-flex shrink-0 items-center gap-0.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold",
            variant === "capsule" ? moreOpen ? "border-cyan-400/55 bg-cyan-400/12 text-cyan-50" : "border-cyan-500/40 bg-cyan-500/8 text-cyan-100/88 hover:border-cyan-400/55 hover:bg-cyan-400/12" : moreOpen ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-300 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700",
            "disabled:pointer-events-none disabled:opacity-50"
          ),
          children: [
            moreOpen ? "收起" : `更多 ${AI_CHAT_MORE_CITIES.length}`,
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ChevronDown,
              {
                className: cn("h-3 w-3 transition-transform", moreOpen && "rotate-180"),
                "aria-hidden": true
              }
            )
          ]
        }
      )
    ] }),
    moreOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: cn(
          "mt-2 max-h-36 overflow-y-auto rounded-xl border p-2 [-webkit-overflow-scrolling:touch]",
          variant === "capsule" ? "border-cyan-500/25 bg-cyan-500/6" : "border-slate-200/90 bg-slate-50/80"
        ),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: AI_CHAT_MORE_CITIES.map((city) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          CityChip,
          {
            city,
            variant,
            disabled,
            onClick: () => sendCity(city.name)
          },
          city.id
        )) })
      }
    ) : null
  ] });
}
function useAdvisorReplySpeech({
  active,
  isReplying,
  assistantReplyText,
  onSpeakingChange,
  onSpeakError
}) {
  const [isSpeaking, setIsSpeaking] = reactExports.useState(false);
  const spokenLengthRef = reactExports.useRef(0);
  const activeRef = reactExports.useRef(active);
  const isReplyingRef = reactExports.useRef(isReplying);
  const onSpeakErrorRef = reactExports.useRef(onSpeakError);
  const onSpeakingChangeRef = reactExports.useRef(onSpeakingChange);
  activeRef.current = active;
  isReplyingRef.current = isReplying;
  onSpeakErrorRef.current = onSpeakError;
  onSpeakingChangeRef.current = onSpeakingChange;
  const syncSpeaking = (next) => {
    var _a;
    setIsSpeaking(next);
    (_a = onSpeakingChangeRef.current) == null ? void 0 : _a.call(onSpeakingChangeRef, next);
  };
  reactExports.useEffect(() => {
    const queue = getAdvisorReplySpeechQueue();
    queue.setOnIdle(() => {
      if (!activeRef.current) {
        syncSpeaking(false);
        return;
      }
      syncSpeaking(isAdvisorReplySpeechActive());
    });
    return () => {
      queue.setOnIdle(null);
    };
  }, []);
  reactExports.useEffect(() => {
    var _a, _b;
    if (active) {
      spokenLengthRef.current = stripAdvisorReplyForSpeech(assistantReplyText ?? "").length;
      (_a = onSpeakErrorRef.current) == null ? void 0 : _a.call(onSpeakErrorRef, null);
      return;
    }
    stopAdvisorReplySpeech();
    spokenLengthRef.current = 0;
    syncSpeaking(false);
    (_b = onSpeakErrorRef.current) == null ? void 0 : _b.call(onSpeakErrorRef, null);
  }, [active]);
  reactExports.useEffect(() => {
    const wasReplying = isReplyingRef.current;
    isReplyingRef.current = isReplying;
    if (!wasReplying && isReplying) {
      spokenLengthRef.current = 0;
      stopAdvisorReplySpeech();
      syncSpeaking(false);
    }
  }, [isReplying]);
  reactExports.useEffect(() => {
    var _a;
    if (!active) {
      return;
    }
    const plain = stripAdvisorReplyForSpeech(assistantReplyText ?? "");
    const { chunks, nextSpokenLength } = splitAdvisorReplySpeechDelta(
      plain,
      spokenLengthRef.current,
      !isReplying
    );
    if (chunks.length === 0) {
      if (!isReplying && plain.length > 0 && spokenLengthRef.current >= plain.length) {
        syncSpeaking(isAdvisorReplySpeechActive());
      }
      return;
    }
    spokenLengthRef.current = nextSpokenLength;
    syncSpeaking(true);
    (_a = onSpeakErrorRef.current) == null ? void 0 : _a.call(onSpeakErrorRef, null);
    for (const chunk of chunks) {
      enqueueAdvisorReplySpeech(chunk);
    }
  }, [active, isReplying, assistantReplyText]);
  reactExports.useEffect(() => {
    if (!isSpeaking) {
      return;
    }
    const timer = window.setTimeout(() => {
      if (!isAdvisorReplySpeechActive()) {
        syncSpeaking(false);
      }
    }, 12e3);
    return () => {
      window.clearTimeout(timer);
    };
  }, [isSpeaking]);
  reactExports.useEffect(
    () => () => {
      stopAdvisorReplySpeech();
    },
    []
  );
  return { isSpeaking };
}
const BROWSER_STOP_WAIT_MS = 2500;
class AdvisorEdgeSpeechSession {
  constructor() {
    __publicField(this, "recognition", null);
    __publicField(this, "transcript", "");
    __publicField(this, "active", false);
    __publicField(this, "stopResolve", null);
  }
  static isSupported() {
    return getSpeechRecognitionCtor() != null;
  }
  abortSync() {
    this.active = false;
    this.stopResolve = null;
    const recognition = this.recognition;
    this.recognition = null;
    if (recognition) {
      try {
        recognition.abort();
      } catch {
        try {
          recognition.stop();
        } catch {
        }
      }
    }
  }
  start() {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      return;
    }
    this.abortSync();
    this.transcript = "";
    this.active = true;
    const recognition = new Ctor();
    recognition.lang = "zh-CN";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      var _a, _b;
      let finalText = "";
      let interimText = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const piece = (_b = (_a = result == null ? void 0 : result[0]) == null ? void 0 : _a.transcript) == null ? void 0 : _b.trim();
        if (!piece) {
          continue;
        }
        if (result.isFinal) {
          finalText += piece;
        } else {
          interimText += piece;
        }
      }
      const combined = (finalText || interimText).trim();
      if (combined) {
        this.transcript = combined;
      }
    };
    recognition.onerror = () => {
    };
    recognition.onend = () => {
      this.active = false;
      this.recognition = null;
      const text = this.transcript.trim();
      const resolve = this.stopResolve;
      this.stopResolve = null;
      resolve == null ? void 0 : resolve(text);
    };
    this.recognition = recognition;
    try {
      recognition.start();
    } catch {
      this.active = false;
      this.recognition = null;
    }
  }
  /** 等待 onend 后再返回，避免松开时 transcript 尚未就绪 */
  stop() {
    this.active = false;
    const recognition = this.recognition;
    if (!recognition) {
      return Promise.resolve(this.transcript.trim());
    }
    return new Promise((resolve) => {
      let settled = false;
      const finish = (text) => {
        if (settled) {
          return;
        }
        settled = true;
        this.stopResolve = null;
        this.recognition = null;
        resolve(text);
      };
      const timeoutId = window.setTimeout(() => {
        finish(this.transcript.trim());
      }, BROWSER_STOP_WAIT_MS);
      this.stopResolve = (text) => {
        window.clearTimeout(timeoutId);
        finish(text);
      };
      try {
        recognition.stop();
      } catch {
        window.clearTimeout(timeoutId);
        finish(this.transcript.trim());
      }
    });
  }
}
const MAX_RECORD_MS = 12e3;
const MIN_RECORD_MS = 2e3;
const MIN_PEAK = 2e-3;
function useAdvisorSpeechInput({ onResult }) {
  const [supported, setSupported] = reactExports.useState(false);
  const [listening, setListening] = reactExports.useState(false);
  const [transcribing, setTranscribing] = reactExports.useState(false);
  const [status, setStatus] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  const recorderRef = reactExports.useRef(null);
  const browserOnlyRef = reactExports.useRef(false);
  const edgeSpeechRef = reactExports.useRef(null);
  const recordStartedAtRef = reactExports.useRef(0);
  const autoStopTimerRef = reactExports.useRef(null);
  const holdActiveRef = reactExports.useRef(false);
  const sessionIdRef = reactExports.useRef(0);
  reactExports.useEffect(() => {
    var _a;
    if (isEmbeddedMicBlockedContext()) {
      setSupported(false);
      setError(embeddedMicBlockedHint());
      return;
    }
    setSupported(Boolean((_a = navigator.mediaDevices) == null ? void 0 : _a.getUserMedia));
    warmupAdvisorSpeechModel();
  }, []);
  const clearAutoStop = reactExports.useCallback(() => {
    if (autoStopTimerRef.current != null) {
      window.clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
  }, []);
  const resetIdle = reactExports.useCallback(() => {
    setListening(false);
    setTranscribing(false);
    setStatus(null);
  }, []);
  const acceptSpeechText = reactExports.useCallback(
    (text) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return false;
      }
      if (isBlockedAdvisorSpeechHallucination(trimmed)) {
        setError(advisorSpeechFailureHint());
        return false;
      }
      setError(null);
      onResult(trimmed);
      return true;
    },
    [onResult]
  );
  const finishTranscribe = reactExports.useCallback(
    async (samples, edgeText) => {
      try {
        if (edgeText && acceptSpeechText(edgeText)) {
          return;
        }
        const peak = measurePeakAmplitude(samples);
        if (peak < MIN_PEAK) {
          setError("没录到声音：请检查系统麦克风是否静音，或靠近麦克风重试");
          return;
        }
        setTranscribing(true);
        setStatus("正在识别语音…");
        const text = await transcribePcmSamples(samples, (message) => setStatus(message));
        if (!acceptSpeechText(text)) {
          setError((current) => current ?? advisorSpeechFailureHint());
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : advisorSpeechFailureHint();
        const peak = measurePeakAmplitude(samples);
        if (/没听清/i.test(message) && peak < 0.01) {
          setError("没录到声音：请检查系统麦克风是否静音，或靠近麦克风重试");
          return;
        }
        setError(isChromeBrowser() ? advisorSpeechFailureHint() : message);
      } finally {
        setTranscribing(false);
        setStatus(null);
      }
    },
    [acceptSpeechText]
  );
  const endHold = reactExports.useCallback(() => {
    sessionIdRef.current += 1;
    holdActiveRef.current = false;
    const recorder = recorderRef.current;
    const edgeSession = edgeSpeechRef.current;
    edgeSpeechRef.current = null;
    clearAutoStop();
    const browserOnly = browserOnlyRef.current;
    browserOnlyRef.current = false;
    if (!recorder && !listening) {
      void (edgeSession == null ? void 0 : edgeSession.stop());
      resetIdle();
      return;
    }
    const elapsed = Date.now() - recordStartedAtRef.current;
    recorderRef.current = null;
    setListening(false);
    if (elapsed < MIN_RECORD_MS) {
      setError("按住时间太短，请按住说满 2 秒再松开");
      setStatus(null);
      void (edgeSession == null ? void 0 : edgeSession.stop());
      if (recorder) {
        void recorder.stop().catch(() => {
        });
      }
      return;
    }
    setStatus("正在处理录音…");
    void (async () => {
      try {
        if (browserOnly) {
          const edgeText = await (edgeSession == null ? void 0 : edgeSession.stop()) ?? "";
          if (!edgeText.trim()) {
            setError(
              "浏览器未识别到语音：请 Win+I → 系统 → 声音 → 输入，选「麦克风阵列 Realtek」，对着麦克风大声说满 2 秒"
            );
            return;
          }
          if (!acceptSpeechText(edgeText)) {
            setError(advisorSpeechFailureHint());
          }
          return;
        }
        if (!recorder) {
          setError(advisorSpeechFailureHint());
          return;
        }
        const samples = await recorder.stop();
        await finishTranscribe(samples, "");
      } catch (err) {
        const message = err instanceof Error ? err.message : "录音处理失败";
        setError(message);
      } finally {
        setTranscribing(false);
        setStatus(null);
      }
    })();
  }, [acceptSpeechText, clearAutoStop, finishTranscribe, listening, resetIdle]);
  const beginHold = reactExports.useCallback(async () => {
    var _a;
    if (holdActiveRef.current || listening || transcribing) {
      return;
    }
    const sessionId = sessionIdRef.current + 1;
    sessionIdRef.current = sessionId;
    holdActiveRef.current = true;
    setError(null);
    setStatus("正在启动麦克风…");
    const startBrowserOnly = () => {
      if (!AdvisorEdgeSpeechSession.isSupported()) {
        return false;
      }
      const edge = new AdvisorEdgeSpeechSession();
      edge.start();
      edgeSpeechRef.current = edge;
      browserOnlyRef.current = true;
      recordStartedAtRef.current = Date.now();
      setListening(true);
      setStatus("按住说话中…（浏览器原生识别）");
      autoStopTimerRef.current = window.setTimeout(() => {
        endHold();
      }, MAX_RECORD_MS);
      return true;
    };
    try {
      const recorder = new AdvisorPcmRecorder();
      await recorder.start();
      if (!holdActiveRef.current || sessionId !== sessionIdRef.current) {
        await recorder.stop();
        resetIdle();
        return;
      }
      recorderRef.current = recorder;
      browserOnlyRef.current = false;
      setStatus("按住说话中…松开结束");
      recordStartedAtRef.current = Date.now();
      setListening(true);
      autoStopTimerRef.current = window.setTimeout(() => {
        endHold();
      }, MAX_RECORD_MS);
    } catch (err) {
      if (startBrowserOnly()) {
        return;
      }
      holdActiveRef.current = false;
      recorderRef.current = null;
      browserOnlyRef.current = false;
      void ((_a = edgeSpeechRef.current) == null ? void 0 : _a.stop());
      edgeSpeechRef.current = null;
      resetIdle();
      setError(formatMicrophoneStartError(err));
    }
  }, [endHold, listening, resetIdle, transcribing]);
  const stopAll = reactExports.useCallback(() => {
    var _a;
    sessionIdRef.current += 1;
    holdActiveRef.current = false;
    browserOnlyRef.current = false;
    clearAutoStop();
    void ((_a = edgeSpeechRef.current) == null ? void 0 : _a.stop());
    edgeSpeechRef.current = null;
    if (listening || recorderRef.current) {
      endHold();
      return;
    }
    resetIdle();
  }, [clearAutoStop, endHold, listening, resetIdle]);
  reactExports.useEffect(() => {
    if (!listening) {
      return;
    }
    const releaseOnGlobalPointerEnd = () => {
      if (holdActiveRef.current || listening) {
        endHold();
      }
    };
    window.addEventListener("pointerup", releaseOnGlobalPointerEnd);
    window.addEventListener("pointercancel", releaseOnGlobalPointerEnd);
    return () => {
      window.removeEventListener("pointerup", releaseOnGlobalPointerEnd);
      window.removeEventListener("pointercancel", releaseOnGlobalPointerEnd);
    };
  }, [endHold, listening]);
  reactExports.useEffect(
    () => () => {
      var _a;
      sessionIdRef.current += 1;
      holdActiveRef.current = false;
      clearAutoStop();
      void ((_a = edgeSpeechRef.current) == null ? void 0 : _a.stop());
      edgeSpeechRef.current = null;
      const recorder = recorderRef.current;
      recorderRef.current = null;
      if (recorder) {
        void recorder.stop().catch(() => {
        });
      }
    },
    [clearAutoStop]
  );
  return {
    supported,
    listening,
    transcribing,
    status,
    error,
    beginHold,
    endHold,
    stop: stopAll
  };
}
const AIChatMessageInput = reactExports.forwardRef(
  function AIChatMessageInput2({
    composerId,
    isLoading,
    isStreaming = false,
    isBusy = false,
    onSend,
    onAbortStream,
    assistantReplyText = null,
    placeholder = "输入目的地、预算或任何旅行问题…",
    travelParams,
    context,
    showHotCityPicker = true,
    variant = "default"
  }, ref) {
    const resolvedTravelParams = travelParams ?? createDefaultTravelParams(context);
    const [draft, setDraft] = reactExports.useState("");
    const textareaRef = reactExports.useRef(null);
    const speech = useAdvisorSpeechInput({
      onResult: (text) => {
        setDraft((current) => current.trim() ? `${current.trim()} ${text}` : text);
        window.requestAnimationFrame(() => {
          var _a;
          return (_a = textareaRef.current) == null ? void 0 : _a.focus();
        });
      }
    });
    const isReplying = isLoading || isStreaming;
    const [replySpeakError, setReplySpeakError] = reactExports.useState(null);
    const voiceDialog = useAdvisorVoiceDialog({
      onSend,
      isPaused: isLoading || isStreaming || isBusy
    });
    const replySpeech = useAdvisorReplySpeech({
      active: voiceDialog.active,
      isReplying,
      assistantReplyText,
      onSpeakingChange: void 0,
      onSpeakError: setReplySpeakError
    });
    const inputDisabled = isLoading || isBusy || speech.transcribing;
    const hintLine = voiceDialog.error || replySpeakError || (voiceDialog.processing ? voiceDialog.status || voiceDialog.preview : null) || voiceDialog.preview || (replySpeech.isSpeaking ? "顾问正在朗读回复…" : voiceDialog.status) || speech.error || speech.status || null;
    reactExports.useImperativeHandle(ref, () => ({
      fillDraft: (text) => {
        setDraft(text.trim());
        window.requestAnimationFrame(() => {
          var _a;
          return (_a = textareaRef.current) == null ? void 0 : _a.focus();
        });
      },
      focus: () => {
        var _a;
        (_a = textareaRef.current) == null ? void 0 : _a.focus();
      }
    }));
    function submit(text) {
      const trimmed = text.trim();
      if (!trimmed || inputDisabled) {
        return;
      }
      onSend(trimmed);
      setDraft("");
    }
    function handleSubmit(event) {
      event.preventDefault();
      submit(draft);
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "footer",
      {
        className: cn(
          "shrink-0 border-t px-3 py-3",
          variant === "capsule" ? "capsule-ai-composer border-[rgba(0,255,255,0.2)] bg-[#141E30]/82" : "border-slate-200/90 bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.04)] backdrop-blur-md"
        ),
        style: { minHeight: "var(--ai-chat-composer-min-h, 7.5rem)" },
        role: "region",
        "aria-label": "消息输入",
        children: [
          showHotCityPicker ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            AIChatHotCityPicker,
            {
              travelParams: resolvedTravelParams,
              disabled: inputDisabled,
              variant,
              onSelectCity: submit
            }
          ) : null,
          voiceDialog.active && voiceDialog.requiresManualFinish ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-20 mb-2 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              disabled: voiceDialog.processing,
              onPointerDown: (event) => {
                event.preventDefault();
                event.stopPropagation();
                voiceDialog.finishUtterance();
              },
              className: cn(
                "pointer-events-auto rounded-full border px-6 py-2.5 text-sm font-semibold shadow-md transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                "disabled:cursor-wait disabled:opacity-80",
                voiceDialog.processing ? "border-slate-300 bg-slate-100 text-slate-600" : "border-brand-500 bg-brand-500 text-white hover:bg-brand-600 active:scale-95"
              ),
              children: voiceDialog.processing ? "识别中…" : "说完了"
            }
          ) }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex items-end gap-2", children: [
            voiceDialog.supported ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                disabled: inputDisabled && !voiceDialog.active,
                onClick: () => voiceDialog.toggle(),
                className: cn(
                  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm",
                  variant === "capsule" ? voiceDialog.active ? "border-emerald-400/45 bg-emerald-500/12 text-emerald-300 ring-2 ring-emerald-400/35" : "border-cyan-500/35 bg-cyan-500/8 text-cyan-100/90 hover:border-cyan-400/50" : voiceDialog.active ? "border-emerald-300 bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-60"
                ),
                "aria-label": voiceDialog.active ? "关闭语音对话" : "开启语音对话",
                "aria-pressed": voiceDialog.active,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(AudioLines, { className: "h-4 w-4", "aria-hidden": true })
              }
            ) : null,
            speech.supported && !voiceDialog.active ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                disabled: inputDisabled,
                className: cn(
                  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm select-none touch-none",
                  variant === "capsule" ? speech.listening ? "border-rose-400/45 bg-rose-500/12 text-rose-300 ring-2 ring-rose-400/35" : "border-cyan-500/35 bg-cyan-500/8 text-cyan-100/90 hover:border-cyan-400/50" : speech.listening ? "border-rose-300 bg-rose-100 text-rose-700 ring-2 ring-rose-300" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-60"
                ),
                "aria-label": speech.transcribing ? "正在识别语音" : speech.listening ? "松开结束录音" : "按住说话",
                onPointerDown: (event) => {
                  event.preventDefault();
                  if (inputDisabled || speech.listening || speech.transcribing) {
                    return;
                  }
                  void speech.beginHold();
                },
                onPointerUp: (event) => {
                  event.preventDefault();
                  speech.endHold();
                },
                onPointerCancel: (event) => {
                  event.preventDefault();
                  speech.endHold();
                },
                children: speech.transcribing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin", "aria-hidden": true }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-4 w-4", "aria-hidden": true })
              }
            ) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                ref: textareaRef,
                id: composerId,
                rows: 2,
                value: draft,
                disabled: inputDisabled,
                placeholder,
                "aria-label": "消息文本输入",
                onChange: (event) => setDraft(event.target.value),
                onKeyDown: (event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submit(draft);
                  }
                },
                className: cn(
                  "h-16 flex-1 resize-none overflow-y-auto rounded-xl border px-3 py-2.5",
                  "text-sm leading-relaxed",
                  "scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                  variant === "capsule" ? "border-cyan-500/28 bg-cyan-500/6 text-cyan-50 placeholder:text-cyan-200/35 focus:border-cyan-400/45 focus:outline-none focus:ring-2 focus:ring-cyan-400/20" : "border-slate-200 bg-slate-50/90 text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/25",
                  "disabled:cursor-not-allowed disabled:opacity-60"
                )
              }
            ),
            isStreaming && onAbortStream ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onAbortStream,
                className: cn(
                  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  "border border-rose-200 bg-rose-50 text-rose-700 shadow-sm",
                  "transition hover:bg-rose-100",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                ),
                "aria-label": "停止生成",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-4 w-4 fill-current", "aria-hidden": true })
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "submit",
                disabled: inputDisabled || !draft.trim(),
                className: cn(
                  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm",
                  variant === "capsule" ? "border border-emerald-400/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/22" : "bg-gradient-to-br from-brand-500 to-violet-600 text-white",
                  "transition hover:brightness-110 disabled:opacity-50",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                ),
                "aria-label": inputDisabled ? "正在处理" : "发送消息",
                children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin", "aria-hidden": true }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4", "aria-hidden": true })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("mt-1 shrink-0", voiceDialog.active ? "h-[4.5rem]" : "h-9"), children: [
            voiceDialog.active && voiceDialog.voiceBackend === "iflytek" ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-center text-[10px] text-brand-600", children: "讯飞识别：大声说话，停顿约 2 秒自动发送" }) : null,
            voiceDialog.active && voiceDialog.voiceBackend === "whisper" ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-center text-[10px] text-brand-600", children: "本地识别：大声说完后，点上方「说完了」按钮" }) : null,
            voiceDialog.active && voiceDialog.voiceBackend === "edge" ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-center text-[10px] text-brand-600", children: "Edge 识别：大声说话，停顿约 2 秒自动发送" }) : null,
            voiceDialog.active && replySpeech.isSpeaking ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-1 text-center text-[10px] text-emerald-700", children: "语音对话：顾问正在朗读，听完可继续说" }) : null,
            voiceDialog.active && voiceDialog.microphoneDevices.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center justify-center gap-2 px-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: voiceDialog.microphoneDeviceId ?? "",
                  onChange: (event) => {
                    voiceDialog.selectMicrophoneDevice(event.target.value);
                  },
                  className: "max-w-[50%] truncate rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600",
                  "aria-label": "选择麦克风设备",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "系统默认麦克风" }),
                    voiceDialog.microphoneDevices.map((device) => {
                      const probe = voiceDialog.microphoneProbes.find(
                        (item) => item.deviceId === device.deviceId
                      );
                      const weakUsb = /philips|spa3609|通信/i.test(device.label);
                      const suffix = probe ? ` · ${formatInputLevelPercent(probe.peak)}` : weakUsb ? " · 信号弱" : "";
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: device.deviceId, children: [
                        device.label,
                        suffix
                      ] }, device.deviceId);
                    })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    void voiceDialog.probeMicrophones();
                  },
                  className: "rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50",
                  children: "重新检测"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "h-2 w-20 overflow-hidden rounded-full bg-slate-200",
                  "aria-hidden": true,
                  title: `输入音量 ${formatInputLevelPercent(voiceDialog.inputLevel)}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: cn(
                        "h-full rounded-full transition-[width] duration-75",
                        voiceDialog.inputLevel >= 1e-3 ? "bg-emerald-500" : "bg-amber-400"
                      ),
                      style: { width: `${Math.min(100, Math.round(voiceDialog.inputLevel * 100))}%` }
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-slate-500", children: formatInputLevelPercent(voiceDialog.inputLevel) })
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "p",
              {
                className: cn(
                  "text-center text-[10px] leading-4",
                  variant === "capsule" ? "text-cyan-200/42" : "text-slate-400"
                ),
                children: [
                  "Enter 发送",
                  speech.supported ? ` · ${advisorSpeechBrowserHint()}` : ""
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                className: cn(
                  "mt-0.5 line-clamp-1 text-center text-[10px] leading-4",
                  variant === "capsule" ? voiceDialog.error || speech.error ? "text-amber-300/88" : voiceDialog.active || hintLine ? "text-cyan-200/72" : "text-transparent" : voiceDialog.error || speech.error ? "text-amber-700" : voiceDialog.active || hintLine ? "text-brand-600" : "text-transparent"
                ),
                role: "status",
                "aria-live": "polite",
                children: hintLine ?? "占位"
              }
            )
          ] })
        ]
      }
    );
  }
);
AIChatMessageInput.displayName = "AIChatMessageInput";
function ActionChip({
  label,
  icon: Icon,
  onClick,
  disabled,
  active,
  variant = "secondary"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      disabled,
      onClick: (event) => {
        event.stopPropagation();
        if (!disabled) {
          onClick();
        }
      },
      className: cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition",
        variant === "primary" ? active ? "border-brand-400 bg-brand-600 text-white" : "border-brand-500 bg-brand-600 text-white hover:bg-brand-700" : active ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700",
        "disabled:pointer-events-none disabled:opacity-45"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3 shrink-0", "aria-hidden": true }),
        label
      ]
    }
  );
}
function AiChatMessageActions({
  canGenerate,
  canViewMap,
  canSave,
  canShare,
  hasPlan,
  isBusy,
  isGeneratingPlan,
  copyFeedback = "idle",
  shareFeedback,
  onGeneratePlan,
  onViewMap,
  onSavePlan,
  onSharePlan
}) {
  const feedback = shareFeedback ?? copyFeedback;
  const shareLabel = feedback === "success" ? "已复制，去粘贴" : feedback === "error" ? "复制失败" : "分享";
  const showGenerate = canGenerate;
  const showViewMap = canViewMap && hasPlan;
  if (!showGenerate && !showViewMap && !canSave && !canShare) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative z-10 mt-2 px-1",
      role: "toolbar",
      "aria-label": "行程快捷操作",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-nowrap items-center gap-1.5 overflow-x-auto", children: [
          showGenerate ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            ActionChip,
            {
              label: isGeneratingPlan ? "生成中…" : hasPlan ? "重新生成" : "生成行程",
              icon: Sparkles,
              onClick: onGeneratePlan,
              disabled: isBusy,
              active: isGeneratingPlan,
              variant: "primary"
            }
          ) : null,
          showViewMap ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            ActionChip,
            {
              label: "查看地图",
              icon: MapPin,
              onClick: onViewMap,
              disabled: isBusy
            }
          ) : null,
          canSave ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            ActionChip,
            {
              label: "保存",
              icon: Bookmark,
              onClick: onSavePlan,
              disabled: isBusy
            }
          ) : null,
          canShare ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            ActionChip,
            {
              label: shareLabel,
              icon: Share2,
              onClick: onSharePlan,
              active: feedback === "success"
            }
          ) : null
        ] }),
        feedback === "success" ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-1 text-[10px] font-medium text-emerald-600", role: "status", children: "对话已复制，可在微信或备忘录中粘贴" }) : null,
        feedback === "error" ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-1 text-[10px] font-medium text-rose-500", role: "status", children: "复制失败，请长按选中对话后手动复制" }) : null
      ]
    }
  );
}
function AiChatMessage({ message, onUseExamplePrompt, showActions, actionProps }) {
  const reduceMotion = useReducedMotion();
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isWelcomeSeed = message.id === AI_CHAT_WELCOME_MESSAGE_ID;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.article,
    {
      className: cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row"),
      initial: reduceMotion ? false : { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: reduceMotion ? 0 : 0.22 },
      "aria-label": isUser ? "你的消息" : "AI 回复",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: cn(
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-2 ring-white",
              isUser ? "bg-slate-700 text-white shadow-sm" : "bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-md shadow-violet-500/25"
            ),
            "aria-hidden": true,
            children: isUser ? /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm leading-none", children: "🐌" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: cn(
              "min-w-0",
              isAssistant && !isWelcomeSeed ? "max-w-[min(100%,40rem)]" : "max-w-[min(100%,28rem)]",
              isUser ? "items-end" : "items-start",
              "flex flex-col"
            ),
            children: [
              !isWelcomeSeed ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: cn(
                    "mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider",
                    isUser ? "text-slate-400" : "text-violet-600"
                  ),
                  children: isUser ? "你" : "AI 顾问"
                }
              ) : null,
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: cn(
                    "w-full shadow-sm",
                    isWelcomeSeed ? "rounded-xl border border-dashed border-brand-200/80 bg-brand-50/40 px-3 py-2 text-sm text-slate-600" : "rounded-2xl px-3.5 py-2.5",
                    isUser ? "rounded-tr-md bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-brand-500/15" : !isWelcomeSeed && "rounded-tl-md border border-slate-200/90 bg-white text-slate-800 ring-1 ring-slate-100",
                    isAssistant && !isWelcomeSeed && "border-l-[3px] border-l-violet-400"
                  ),
                  children: isAssistant ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    message.content ? isWelcomeSeed ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "leading-relaxed", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AiChatMarkdown, { content: message.content }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AiChatMarkdown, { content: message.content, onUseExamplePrompt }) : message.status === "streaming" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-slate-400", "aria-hidden": true, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400 [animation-delay:150ms]" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400 [animation-delay:300ms]" })
                    ] }) : null,
                    message.status === "streaming" && message.content ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "ml-0.5 inline-block h-[1.1em] w-0.5 animate-pulse bg-brand-500 align-text-bottom",
                        "aria-hidden": true
                      }
                    ) : null
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap text-sm leading-relaxed", children: message.content })
                }
              ),
              showActions && actionProps && isAssistant && !isWelcomeSeed && message.status !== "streaming" && message.content.trim() ? /* @__PURE__ */ jsxRuntimeExports.jsx(AiChatMessageActions, { ...actionProps }) : null
            ]
          }
        )
      ]
    }
  );
}
const AiChatMessageBubble = reactExports.memo(AiChatMessage);
export {
  AIChatMessageInput as A,
  SlidersHorizontal as S,
  AI_CHAT_WELCOME_MESSAGE_ID as a,
  AiChatMessageBubble as b,
  useAiTravelParams as c,
  useAiChat as u
};
