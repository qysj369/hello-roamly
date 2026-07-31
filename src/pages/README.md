# pages — 页面组件

与路由一一对应的顶层页面，由 `router/index.tsx` 挂载在 `AppShell` 内。页面负责拼装布局与业务组件，复杂逻辑放在 `hooks/`、`services/`。

## 目录

| 路径 | 路由 | 说明 |
|------|------|------|
| `home/HomePage.tsx` | `/` | 首页：搜索、精选攻略 |
| `map/MapPage.tsx` | `/map` | 地图（经 `router/MapPageLazy` 懒加载） |
| `guides/GuidesPage.tsx` | `/guides` | 攻略列表 |
| `guides/GuideDetailPage.tsx` | `/guides/:guideId` | 攻略详情 |
| `about/AboutPage.tsx` | `/about` | 我的 / 开发面板 |
| `error/NotFoundPage.tsx` | `*` | 404 |

## 导入

路由表推荐从 barrel 引入：

```ts
import { HomePage, GuidesPage, GuideDetailPage } from '@/pages';
```

地图懒加载需指向具体文件：

```ts
const MapPage = lazy(() => import('@/pages/map/MapPage'));
```

## 约定

- 每个文件 **default export** 一个页面组件，命名 `*Page`
- 使用 `useDocumentTitle` 设置标题；数据用 `hooks/` + `services/`，UI 状态用 `stores/`
- 不把可复用 UI 写在 pages 内，抽到 `components/features/` 或 `components/ui/`
- 新增路由：在此添加页面 → 更新 `router/paths.ts` → 在 `router/index.tsx` 注册
