# providers — 全局 Provider

在 `main.tsx` 中包裹整棵 React 树，存放跨路由的 Context / 第三方根组件。

| 文件 | 说明 |
|------|------|
| `AppProviders.tsx` | `QueryClientProvider`、开发环境 React Query Devtools |

新增全局 Provider（主题、i18n 等）请在此组合，避免写进 `App.tsx`。
