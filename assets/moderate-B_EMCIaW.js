import { e0 as readEnv, dh as http, dF as moderationCheckResponseSchema, F as ContentModerationRejectedError } from "./index-DwV1qlqh.js";
function isTruthyFlag(value) {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}
function isContentModerationEnabled() {
  return isTruthyFlag(readEnv("VITE_CONTENT_MODERATION_ENABLED"));
}
function isContentModerationStrict() {
  return isTruthyFlag(readEnv("VITE_CONTENT_MODERATION_STRICT"));
}
function isModerationDemoBlockEnabled() {
  return isTruthyFlag(readEnv("VITE_CONTENT_MODERATION_DEMO_BLOCK"));
}
function hasModerationBackend() {
  var _a;
  return Boolean((_a = readEnv("VITE_API_BASE_URL")) == null ? void 0 : _a.trim());
}
const MAX_TEXT_LENGTH = 8e3;
const DEMO_BLOCK_SUBSTRINGS = ["违规测试", "内容安全测试不通过"];
function reject(message, labels = ["local_preflight"]) {
  return {
    decision: "reject",
    requestId: `local-${Date.now()}`,
    labels,
    message,
    localOnly: true
  };
}
function pass(message) {
  return {
    decision: "pass",
    requestId: `local-${Date.now()}`,
    labels: [],
    message,
    localOnly: true
  };
}
function runLocalPreflight(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return reject("内容不能为空");
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    return reject(`内容过长，请控制在 ${MAX_TEXT_LENGTH} 字以内`);
  }
  if (isModerationDemoBlockEnabled()) {
    const hit = DEMO_BLOCK_SUBSTRINGS.find((word) => trimmed.includes(word));
    if (hit) {
      return reject(`演示拦截：检测到「${hit}」，正式环境请接入云内容安全 API`);
    }
  }
  return pass();
}
const MODERATION_API = {
  check: "/moderation/check"
};
function passThrough(message) {
  return {
    decision: "pass",
    requestId: `bypass-${Date.now()}`,
    message
  };
}
function buildDemoResult(input) {
  const preflight = runLocalPreflight(input.text);
  if (preflight && preflight.decision === "reject") {
    return preflight;
  }
  return {
    decision: "pass",
    requestId: `demo-mod-${Date.now()}`,
    localOnly: true,
    message: "内容安全接口已预留：请配置 VITE_API_BASE_URL 与后端云审服务后启用正式审核"
  };
}
async function checkContentModeration(input) {
  if (!isContentModerationEnabled()) {
    return passThrough();
  }
  const preflight = runLocalPreflight(input.text);
  if ((preflight == null ? void 0 : preflight.decision) === "reject") {
    return preflight;
  }
  if (!hasModerationBackend()) {
    return buildDemoResult(input);
  }
  const body = {
    scene: input.scene,
    text: input.text,
    bizId: input.bizId,
    userId: input.userId
  };
  const { data } = await http.post(MODERATION_API.check, body);
  const parsed = moderationCheckResponseSchema.parse(data);
  return {
    decision: parsed.decision,
    requestId: parsed.requestId,
    labels: parsed.labels,
    message: parsed.message
  };
}
const DEFAULT_REJECT_MESSAGE = "内容未通过安全审核，请修改后重试";
async function moderateUserContent(input) {
  return checkContentModeration(input);
}
async function assertContentAllowed(input) {
  const result = await moderateUserContent(input);
  if (result.decision === "reject") {
    throw new ContentModerationRejectedError(result.message ?? DEFAULT_REJECT_MESSAGE, result);
  }
  if (result.decision === "review" && isContentModerationStrict()) {
    throw new ContentModerationRejectedError(
      result.message ?? "内容待人工复核，请稍后再试",
      result
    );
  }
  return result;
}
function isModerationActive() {
  return isContentModerationEnabled();
}
const moderate = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  assertContentAllowed,
  isModerationActive,
  moderateUserContent
}, Symbol.toStringTag, { value: "Module" }));
export {
  assertContentAllowed as a,
  isContentModerationStrict as b,
  isModerationDemoBlockEnabled as c,
  moderateUserContent as d,
  hasModerationBackend as h,
  isContentModerationEnabled as i,
  moderate as m
};
