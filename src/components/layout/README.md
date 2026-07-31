# layout · 布局组件

全站壳层与导航，不含业务数据。统一从 `@/components/layout` 导入。

| 组件 | 职责 |
|------|------|
| `AppShell` | 根布局：组合顶栏、主内容区、底栏（挂到路由父级） |
| `PageContainer` | 页面外框：`max-w-lg`、内边距、底栏安全留白 |
| `PageHeader` | 顶栏 Logo（HelloRoanmIy）+ 登录/注册 + 开始探索 |
| `SiteFooter` | 底部标语（Hello World, Hello Roamly） |
| `BottomNav` | 固定底栏 Tab（首页 / 地图 / 攻略 / 我的） |
| `AnimatedOutlet` | `react-router` 子路由出口 + 切页动效 |

```tsx
import { AppShell } from '@/components/layout';

// router/index.tsx
{ path: '/', element: <AppShell />, children: [...] }
```

单独页面若需同款宽度约束，可包一层 `PageContainer`（不必重复 `AppShell`）。
