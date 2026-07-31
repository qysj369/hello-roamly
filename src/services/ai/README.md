# services/ai/ — AI 服务实现

对外统一从 **`src/services/ai.ts`** 导入（勿直接依赖本目录下的子路径，除非在实现层内部）。

## 架构

| 模块 | 说明 |
|------|------|
| `chat.ts` | 统一入口 `generateChatReply`（DeepSeek / Mock 自动切换） |
| `streamChat.ts` | 流式顾问对话 `streamChatReply`（SSE `/api/ai/chat-stream`） |
| `deepseek/` | DeepSeek Chat Completions API 客户端 |
| `prompts/travelAdvisorSystem.ts` | 旅行顾问 System Prompt |
| `generateMockChatReply.ts` | 无 Key 时的本地演示回复 |
| `generateTravelPlan.ts` | `generateTravelPlan(prompt, options)` → `TravelPlan` |

## 环境变量（`.env.local`）

```env
VITE_DEEPSEEK_API_KEY=sk-your-key
# 可选
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com
VITE_DEEPSEEK_MODEL=deepseek-chat
```

未配置 `VITE_DEEPSEEK_API_KEY` 时自动回退演示模式。

> 生产环境建议通过自建后端代理 API Key，避免密钥暴露在前端 bundle。

## 使用

```ts
import { generateChatReply, streamChatReply, getAiProvider } from '@/services/ai';

await streamChatReply({
  messages,
  context,
  onDelta: (chunk) => { /* 追加到 UI */ },
  signal: abortController.signal,
});

const reply = await generateChatReply(messages, context); // 非流式（兼容）
const provider = getAiProvider(); // 'deepseek' | 'mock'

const plan = await generateTravelPlan('成都周末美食穷游', {
  destination: '成都',
  days: 3,
  budget: { min: 1500, max: 2500 },
  interests: ['food', 'culture'],
  pace: 'balanced',
});
```

## DeepSeek 文档

https://api-docs.deepseek.com/api/create-chat-completion
