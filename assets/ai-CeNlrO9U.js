import { i as isProductionAppMode } from "./appMode-mvxqt0jz.js";
import { e0 as readEnv } from "./index-DwV1qlqh.js";
import { n as normalizeMapCredential } from "./credentials-BlGlDwm4.js";
const DEFAULT_DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-chat";
function getDeepSeekConfig() {
  const apiKey = normalizeMapCredential(readEnv("VITE_DEEPSEEK_API_KEY"));
  if (!apiKey) {
    return null;
  }
  return {
    apiKey,
    baseURL: readEnv("VITE_DEEPSEEK_BASE_URL") ?? DEFAULT_DEEPSEEK_BASE_URL,
    model: readEnv("VITE_DEEPSEEK_MODEL") ?? DEFAULT_DEEPSEEK_MODEL
  };
}
function isDeepSeekConfigured() {
  return getDeepSeekConfig() !== null;
}
function getAiProvider() {
  return isDeepSeekConfigured() ? "deepseek" : "mock";
}
function getAiProviderDisplay() {
  if (isDeepSeekConfigured()) {
    return "deepseek";
  }
  if (isProductionAppMode()) {
    return "unconfigured";
  }
  return "mock";
}
function getAiProviderDisplayLabel(display = getAiProviderDisplay()) {
  if (display === "deepseek") {
    return "DeepSeek";
  }
  if (display === "unconfigured") {
    return "未配置 AI";
  }
  return "演示模式";
}
const PRODUCTION_AI_ERROR = "上线模式需要配置 VITE_DEEPSEEK_API_KEY。请在 .env.local 填入 DeepSeek Key 后重启 pnpm dev。";
function assertAiServiceReady() {
  if (isProductionAppMode() && !isDeepSeekConfigured()) {
    throw new Error(PRODUCTION_AI_ERROR);
  }
}
export {
  assertAiServiceReady as a,
  getAiProviderDisplay as b,
  getAiProviderDisplayLabel as c,
  getDeepSeekConfig as d,
  getAiProvider as g,
  isDeepSeekConfigured as i
};
