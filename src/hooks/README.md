# hooks · 自定义 Hooks

可复用的 React 逻辑，**不渲染 UI**。按职责分子目录，统一从 `@/hooks` 导入。

| 子目录 | 说明 | 示例 |
|--------|------|------|
| `api/` | 封装 `services/` + TanStack Query | `useGithubZen`、`useGuideList`、`useGuideDetail` |
| `browser/` | DOM / 窗口 / 防抖 | `useDebouncedValue`、`useDocumentTitle` |
| `guides/` | 攻略业务逻辑 | `useFilteredGuides` |

## 约定

- 文件名：`use` + 驼峰，如 `useFilteredGuides.ts`
- 请求类 Hook 放在 `api/`，`queryKey` 与 Hook 同文件导出
- 客户端状态从 `@/stores` 读取（Zustand）；Hook 负责组合 store + services + 副作用
- 不要在这里放 JSX 或业务组件

```tsx
import { useGithubZen, useFilteredGuides, useDocumentTitle } from '@/hooks';
```

## 与相邻目录

| 目录 | 关系 |
|------|------|
| `services/` | 纯异步 API 函数，供 `hooks/api/*` 调用 |
| `stores/` | 全局 UI 状态 |
| `components/` | 消费 Hooks，不定义 Hooks |
