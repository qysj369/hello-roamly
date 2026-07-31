# stores — 状态管理

客户端全局状态，使用 [Zustand](https://github.com/pmndrs/zustand)。放**跨页面、非服务端**的 UI 状态；远程数据用 `services/` + `hooks/api/`（React Query）。

## 目录

| 路径 | Store | 说明 |
|------|-------|------|
| `ui/store.ts` | `useUiStore` | 全站搜索词、开发演示计数 |

后续可按域扩展，例如 `map/store.ts`（地图 UI）、`auth/store.ts`（登录会话）。

## 导入

```ts
import { useUiStore } from '@/stores';
// 或
import { useUiStore } from '@/stores/ui/store';
```

## 使用约定

- Hook 命名：`use` + 领域 + `Store`，如 `useUiStore`
- 用 selector 订阅，避免整 store 重渲染：`useUiStore((s) => s.searchQuery)`
- 服务端列表 / 详情不要放进 Zustand，交给 React Query
- 需要持久化时再考虑 `persist` 中间件（本目录暂未使用）

## 与相邻层

| 层 | 职责 |
|----|------|
| `stores/` | 客户端 UI 状态 |
| `hooks/` | 组合 store + services + 副作用 |
| `services/` | HTTP / API |
| `providers/` | React Query 等 Context |
