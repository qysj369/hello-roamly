import { aX as axios, P as DeepSeekApiError, dN as parseDeepSeekError } from "./index-DwV1qlqh.js";
import { d as getDeepSeekConfig } from "./ai-CeNlrO9U.js";
function createDeepSeekHttp() {
  const config = getDeepSeekConfig();
  if (!config) {
    throw new Error("DeepSeek 未配置：请设置 VITE_DEEPSEEK_API_KEY");
  }
  const client = axios.create({
    baseURL: config.baseURL,
    timeout: 9e4,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    }
  });
  return { client, config };
}
const CHAT_COMPLETIONS_PATH = "/chat/completions";
async function createDeepSeekChatCompletion({
  messages,
  temperature = 0.7,
  maxTokens = 2048,
  jsonMode = false
}) {
  var _a, _b, _c;
  const { client, config } = createDeepSeekHttp();
  try {
    const { data } = await client.post(CHAT_COMPLETIONS_PATH, {
      model: config.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
      ...jsonMode ? { response_format: { type: "json_object" } } : {}
    });
    const content = (_c = (_b = (_a = data.choices[0]) == null ? void 0 : _a.message) == null ? void 0 : _b.content) == null ? void 0 : _c.trim();
    if (!content) {
      throw new DeepSeekApiError("DeepSeek 返回了空回复");
    }
    return content;
  } catch (error) {
    throw parseDeepSeekError(error);
  }
}
export {
  createDeepSeekChatCompletion as c
};
