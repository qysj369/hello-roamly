# TypeScript 类型审计报告

审计日期：项目当前工作区  
编译选项：`strict: true`（`tsconfig.app.json`）

## 1. 类型检查结果

| 命令 | 结果 | 说明 |
|------|------|------|
| `pnpm run typecheck` | **通过（0 错误）** | 权威检查：`tsc -b`（app + node 子项目） |
| `npx tsc -p tsconfig.app.json --noEmit` | **通过（0 错误）** | 仅应用 `src/` |
| `npx tsc --noEmit`（根目录无 `-p`） | 可能无输出 | 根 `tsconfig.json` 仅为 references，请优先用上一行 |

**类型错误列表：** 无。无需修复项。

## 2. `any` 排查

| 检查项 | 结果 |
|--------|------|
| `src/**/*.{ts,tsx}` 中 `: any` / `as any` | **0 处** |
| `@ts-ignore` / `@ts-expect-error` | **0 处** |
| ESLint `no-explicit-any`（若已启用） | 与严格模式一致 |

## 3. 类型目录结构（已存在）

```text
src/types/
├── index.ts              # 统一导出入口（@/types）
├── interfaces/           # 审查清单核心实体（TravelPlan、UserProfile…）
├── domain/               # 业务模型与枚举
├── api/                  # HTTP 请求/响应 DTO
├── ambient/              # vite-env、amap 全局声明
└── router-state.ts       # 路由级页面状态
```

`services/` 已使用 `@/types/api/*` 与 `@/types/domain/*`，未重复定义实体。

## 4. `useState` / `useReducer` 审查

| 项 | 结果 |
|----|------|
| `useReducer` | 项目中 **未使用** |
| `useState` | 多数已显式泛型（如 `useState<AiChatMessage[]>`）；字符串表单在关键 Hook 中已补全 `useState<string>('')` |
| 布尔/数字 | `useState(false)` / `useState(0)` 由字面量正确收窄，无需改动 |

## 5. 核心数据结构接口（示例）

以下定义位于 `src/types/interfaces/`，并由 `src/types/index.ts` 再导出。

### 5.1 `TravelPlan` / `EnrichedTravelPlan`

```ts
// src/types/interfaces/travelPlan.ts
export interface TravelPlan {
  id: string;
  title: string;
  summary: string;
  dailyPlans: TravelPlanDay[];
  totalCost: number;
  tags: string[];
  suitableAudience?: string;
  practicalInfo?: TravelPlanPracticalInfo;
}

export interface EnrichedTravelPlan extends TravelPlan {
  presentation: TravelPlanPresentation;
}
```

API 契约：`GetTravelPlanResponse`、`CreateTravelPlanResponse`（`src/types/api/travelPlan.ts`）。

### 5.2 `User` / `UserProfile`

```ts
// src/types/interfaces/user.ts
export interface User extends UserBasicInfo, UserTravelInfo, UserSocialInfo, UserSettings {
  stats: UserStats;
  badges: UserBadge[];
  role?: UserRole;
  accountStatus?: UserAccountStatus;
  auth?: UserAuthBinding;
  companionPreferences?: UserCompanionPreferences;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends User {}
```

公开资料：`UserPublicProfile`；API：`GetCurrentUserResponse`（`src/types/api/user.ts`）。

### 5.3 发现流 `DiscoverFeedItem` / `RecommendedDiscoverItem`

```ts
// src/types/domain/discover.ts（节选）
export type DiscoverFeedItem =
  | DiscoverGuideItem
  | DiscoverPlanItem
  | DiscoverMomentItem;

export type RecommendedDiscoverItem = DiscoverFeedItem & {
  recommendScore: number;
  recommendReasons: string[];
};
```

服务：`fetchDiscoverFeed` → `Promise<RecommendedDiscoverItem[]>`。

## 6. 维护建议

1. **CI / pre-commit** 已包含 `pnpm run typecheck`，保持即可。
2. 新增 API 时：**先在 `types/api/` 定义 DTO**，再在 `services/` 引用。
3. 避免在 `services/` 内联重复实体类型；复杂 JSON 解析（如 AI 计划）用 `parseTravelPlanFromAiResponse` + `ParsedTravelPlan`。
4. 日常检查命令：

```bash
pnpm run typecheck
rg ": any|as any" src
```

## 7. 本次微调（非错误修复）

- `AIChatMessageInput`、`SiteChatComposer`、`useTravelMomentPublishForm`：`useState<string>('')` 显式标注，便于审查表单状态类型。
