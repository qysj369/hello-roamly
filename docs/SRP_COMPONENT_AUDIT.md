# React 组件单一职责（SRP）审计

扫描范围：`src/components/`、`src/pages/`（2026-05-19）

## 判定标准

| 信号 | 说明 |
|------|------|
| **体量** | 单文件 ≥ 200 行 |
| **混合职责** | 同一文件内同时承担 UI 渲染、数据/副作用获取、复杂本地状态、领域计算 |
| **建议** | 抽 hooks（状态/副作用）、子组件（纯展示）、utils（纯函数） |

---

## 一、`src/components/` — 超过 200 行

| 文件 | 约行数 | 职责混杂 | 重构优先级 |
|------|--------|----------|------------|
| `features/ai/AIChatInterface.tsx` | ~170（已拆） | 原为编排+滚动+生成+工具栏 | ✅ 已重构 |
| `features/discover/DiscoverContentGrid.tsx` | ~456 | 分区渲染 + 排序文案 + 空态 + 指南预览逻辑 | **高** |
| `features/discover/DiscoverMasonryCard.tsx` | ~292 | 卡片 UI + 互动/收藏状态 + 媒体布局 | 中 |
| `features/moments/TravelMomentCard.tsx` | ~282 | 卡片 + 点赞/评论入口 + 地图缩略 | 中 |
| `features/moments/TravelMomentMapPicker.tsx` | ~283 | 地图 SDK + 选点 + 表单联动 | **高** |
| `features/ai/AIChatTravelParamsPanel.tsx` | ~272 | 参数表单 + 生成计划 CTA + 错误重试 | 中 |
| `features/plans/TravelPlanCard.tsx` | ~247 | 展示 + 收藏/分享 + 路由跳转 | 低 |
| `features/plans/TravelPlanDetailActions.tsx` | ~218 | 操作栏 + 确认态 + 多种 mutation | 中 |
| `features/plans/AmapPlanRouteMap.tsx` | ~209 | 地图生命周期 + 地理编码 hook + HTML 弹窗 | **高**（与 Mapbox 版重复） |
| `features/plans/MapboxPlanRouteMap.tsx` | ~203 | 同上（另一提供商） | **高** |

### 已完成的示范重构：`AIChatInterface`

**拆分结果：**

- `hooks/ai/useAiChatInterfaceController.ts` — 页面级编排
- `hooks/ai/useAiChatScrollSync.ts` — 滚动与消息锚点
- `hooks/ai/useAiChatPlanGeneration.ts` — 从对话生成行程
- `components/features/ai/AIChatToolbar.tsx` — 顶栏操作
- `components/features/ai/AIChatMessageStream.tsx` — 消息列表
- `components/features/ai/AIChatPlanGenerateBar.tsx` — 移动端生成 CTA

---

## 二、`src/pages/` — 超过 100 行（页面阈值更低）

| 文件 | 约行数 | 说明 |
|------|--------|------|
| `profile/UserProfilePage.tsx` | ~179 | Tab + 列表数据组合，可抽 `useUserProfileTabs` |
| `guides/GuideDetailPage.tsx` | ~135 | 详情 + SEO + 相关推荐 |
| `plans/TravelPlanDetailPage.tsx` | ~110 | 已较薄，地图/操作由子组件承担 |

其余页面多数 &lt; 100 行，职责边界清晰。

---

## 三、按职责类型归类

### A. 地图类（UI + SDK + 副作用）

- `AmapPlanRouteMap` / `MapboxPlanRouteMap` / `TravelMomentMapPicker` / `TravelMap`
- **建议**：`usePlanRouteMapLifecycle(plan, provider)` + `PlanRouteMapMarkers`（纯 props）

### B. 发现流（UI + 领域规则）

- `DiscoverContentGrid` — `splitDiscoverFeedItems` 等应在 utils/hooks，`DiscoverContentGrid` 只组合 `DiscoverGridSection`
- **建议**：`useDiscoverGridSections(items, filters, sortMode)`

### C. AI 对话（已部分治理）

- `AIChatTravelParamsPanel` 仍可拆：`TravelParamsForm` + `TravelParamsPlanActions`

### D. 纯展示但偏大

- `DiscoverMasonryCard`、`TravelMomentCard` — 拆 `*CardMedia`、`*CardActions`

---

## 四、推荐迭代顺序

1. **DiscoverContentGrid** — 影响面大、逻辑集中  
2. **AmapPlanRouteMap + MapboxPlanRouteMap** — 抽共享 `usePlanRouteMap`  
3. **TravelMomentMapPicker** — 地图与表单分离  
4. **DiscoverMasonryCard / TravelMomentCard** — 按需拆分  

---

## 五、各组件拆分方案（任务 2）

原则：**容器组件**只组合 props；**Hook** 管状态/副作用；**utils** 管纯计算；**子组件** 管 JSX。

---

### 1. `DiscoverContentGrid` (~456 行) — 优先级：高

**现状问题**：在 JSX 内重复 4 段「分区 + 标题/副标题 + 排序 hint + 瀑布流」；`sectionSortHint`、`isEmpty` 与 `splitDiscoverFeedItems` 混在同一文件。

| 类型 | 建议提取 | 路径 |
|------|----------|------|
| **Hook** | `useDiscoverGridModel({ items, users, filters, sortMode })` → 返回 `{ sections, isEmpty, sortHint }` | `src/hooks/discover/useDiscoverGridModel.ts` |
| **Utils** | `getDiscoverSectionSortHint(sortMode)`（移出组件内 `sectionSortHint`） | `src/utils/discoverGrid.ts`（扩展现有） |
| **Utils** | `isDiscoverGridEmpty(sections)` | 同上 |
| **子组件** | `DiscoverEmptyState` — 空列表占位 | `DiscoverEmptyState.tsx` |
| **子组件** | `DiscoverPlansSection` / `DiscoverMomentsSection` / `DiscoverGuidesSection` / `DiscoverUsersSection` — 各包一层 `DiscoverGridSection` + 卡片映射 | `discover/sections/*.tsx` |
| **子组件** | `DiscoverFeedSentinel` — 底部 loading + `sentinelRef` | 可复用 `TravelMomentsFeedFooter` 模式 |

**重构后**：`DiscoverContentGrid` ≈ 40–60 行，仅 `const model = useDiscoverGridModel(...)` + 条件渲染各 Section。

---

### 2. `DiscoverMasonryCard` (~292 行) — 优先级：中

**现状问题**：`PinShell` / `CardShell` 两套布局 + 按 `item.kind` 分支解析封面/链接/文案。

| 类型 | 建议提取 | 路径 |
|------|----------|------|
| **子组件** | `DiscoverPinCard` ← 现有 `PinShell` | `DiscoverPinCard.tsx` |
| **子组件** | `DiscoverClassicCard` ← 现有 `CardShell` | `DiscoverClassicCard.tsx` |
| **Utils** | `resolveDiscoverCardViewModel(item)` → `{ href, coverUrl, coverAlt, title, subtitle, meta, badge }` | `src/utils/discoverCardViewModel.ts` |
| **子组件** | `DiscoverCardKindBadge` — `KIND_META` 徽章 | `DiscoverCardKindBadge.tsx` |
| **子组件** | `GuideMasonryCard` / `PlanMasonryCard` / `MomentMasonryCard` — 三选一薄包装（可选） | `discover/cards/` |

**Hook**：一般不需要；数据来自 props，无远程请求。

**重构后**：`DiscoverMasonryCard` 只做 `layout === 'pinterest' ? <DiscoverPinCard ... /> : <DiscoverClassicCard ... />`。

---

### 3. `TravelMomentCard` (~282 行) — 优先级：中

**现状问题**：已有 `TravelMomentCardMedia` / `Actions`，但 Header、可见性徽章、`buildLocationLabel` 仍在主文件。

| 类型 | 建议提取 | 路径 |
|------|----------|------|
| **子组件** | `TravelMomentCardHeader` — 头像、作者、时间 | `TravelMomentCardHeader.tsx` |
| **子组件** | `TravelMomentVisibilityBadge` ← 现有 `MomentVisibilityBadge` | 独立文件 |
| **Utils** | `buildMomentLocationLabel(moment)` ← 现有 `buildLocationLabel` | `src/utils/travelMomentDisplay.ts` |
| **Utils** | `VISIBILITY_BADGE_STYLES` 常量 | `travelMomentVisibility.ts` 或 `momentCardStyles.ts` |
| **Hook** | `useTravelMomentCardAccess(moment, viewerId?)` → `canView, shareEnabled` | `useTravelMomentCardAccess.ts`（封装 `canViewTravelMoment`） |

**重构后**：主卡片 ≈ 80 行，组合 Header + Media + TagList + Actions。

---

### 4. `TravelMomentMapPicker` (~283 行) — 优先级：高

**现状问题**：Mapbox/Amap 两套 Surface + 地理编码/反查 + 折叠 UI 全在一个文件。

| 类型 | 建议提取 | 路径 |
|------|----------|------|
| **Hook** | `useMomentMapPick({ value, onChange })` → `{ mapOpen, setMapOpen, pin, initialView, isResolving, mapError, handlePick, handlePlaceSearch }` | `src/hooks/map/useMomentMapPick.ts` |
| **Hook** | `useAmapMomentMap({ containerId, initialView, pin, onPick })` | `src/hooks/map/useAmapMomentMap.ts` |
| **子组件** | `MapboxMomentMapSurface` / `AmapMomentMapSurface` | `src/components/features/map/moment/` |
| **子组件** | `MomentMapPickerToolbar` — 打开地图、坐标展示、关闭 | `MomentMapPickerToolbar.tsx` |
| **子组件** | `MomentLocationTextFields` — 城市/地点文本输入（若与地图分离） | 按需 |
| **Utils** | 已有 `formatCoordinatesLabel`；可增 `mergeMomentLocationFromGeocode` | `travelMomentLocation.ts` |

**重构后**：`TravelMomentMapPicker` 只选 provider + 渲染 Surface + 绑定 hook。

---

### 5. `AIChatTravelParamsPanel` (~272 行) — 优先级：中

**现状问题**：侧栏动画 + 预算滑块 + 天数/节奏/兴趣 + 生成计划 + `AsyncFeedback` 耦合。

| 类型 | 建议提取 | 路径 |
|------|----------|------|
| **Utils** | `formatAiBudgetLabel(value)` ← 现有 `formatBudget` | `src/utils/formatAiBudget.ts` |
| **子组件** | `TravelParamsBudgetRange` — 双滑块 | `TravelParamsBudgetRange.tsx` |
| **子组件** | `TravelParamsDaySelector` | `TravelParamsDaySelector.tsx` |
| **子组件** | `TravelParamsInterestChips` | `TravelParamsInterestChips.tsx` |
| **子组件** | `TravelParamsPaceSelector` | `TravelParamsPaceSelector.tsx` |
| **子组件** | `TravelParamsPanelShell` — `motion.aside` + 折叠按钮 | `TravelParamsPanelShell.tsx` |
| **子组件** | `TravelParamsGenerateFooter` — 生成 CTA + `AsyncFeedback` | `TravelParamsGenerateFooter.tsx` |

**Hook**：可选 `useTravelParamsPanelLayout(isOpen)`（仅媒体查询），非必须。

**重构后**：`AIChatTravelParamsPanel` ≈ 60 行表单组合。

---

### 6. `TravelPlanCard` (~247 行) — 优先级：低

**现状问题**：文件内已有 `TravelPlanCardCover` / `Creator` / `Heading` / `Stats` 等 memo，但未拆文件；收藏/分享逻辑若在主组件需隔离。

| 类型 | 建议提取 | 路径 |
|------|----------|------|
| **子组件** | `TravelPlanCardCover.tsx` / `TravelPlanCardCreator.tsx` / `TravelPlanCardHeading.tsx` / `TravelPlanCardStats.tsx` | 各独立文件（从现有 memo 迁出） |
| **子组件** | `TravelPlanCardFooter` — 收藏、分享、跳转 | `TravelPlanCardFooter.tsx` |
| **Hook** | `useTravelPlanCardActions(planId)` — 收藏态、分享 handler（若存在本地状态） | `src/hooks/plans/` |
| **Utils** | 已用 `getPlanDestination`、`getPlanCoverUrl` 等 — 保持 | `travelPlanView.ts` |

**重构后**：`TravelPlanCard` ≈ 50 行 `<article>` 骨架 + 子组件列表。

---

### 7. `TravelPlanDetailActions` (~218 行) — 优先级：中

**现状问题**：`PanelActionButton` / `ToolbarActionButton` 样式重复；业务已在 `useTravelPlanDetailActions`，UI 仍偏大。

| 类型 | 建议提取 | 路径 |
|------|----------|------|
| **子组件** | `PlanDetailPanelActionButton` | `plans/actions/PlanDetailPanelActionButton.tsx` |
| **子组件** | `PlanDetailToolbarActionButton` | `plans/actions/PlanDetailToolbarActionButton.tsx` |
| **子组件** | `TravelPlanDetailActionsPanel` — variant `panel` 布局 | `TravelPlanDetailActionsPanel.tsx` |
| **子组件** | `TravelPlanDetailActionsToolbar` — variant `toolbar` | `TravelPlanDetailActionsToolbar.tsx` |
| **Utils** | `getPlanActionSummary(plan)` → destination/days/cost 一行文案 | `travelPlanView.ts` |

**Hook**：保持 `useTravelPlanDetailActions`（已存在），组件只消费 `{ copyItinerary, exportPdf, findCompanion, feedback }`。

---

### 8. `AmapPlanRouteMap` + `MapboxPlanRouteMap` (~209 / ~203 行) — 优先级：高

**现状问题**：双文件 80% 重复；`markerHtml` / `popupHtml`、三处 `useEffect`（初始化、标点、选中）各写一遍。

| 类型 | 建议提取 | 路径 |
|------|----------|------|
| **Hook** | `usePlanMapPoints(plan)` — **已有** | `hooks/map/usePlanMapPoints.ts` |
| **Hook** | `usePlanRouteMapSelection(points)` → `selectedPointId, selectPoint` | 新建 |
| **Hook** | `useAmapPlanRouteMap({ containerId, points, selectedId })` | `hooks/map/useAmapPlanRouteMap.ts` |
| **Hook** | `useMapboxPlanRouteMap({ containerRef, points, selectedId })` | `hooks/map/useMapboxPlanRouteMap.ts` |
| **Utils** | `buildPlanMapMarkerHtml(point, selected)` | `src/lib/map/planMapMarkers.ts` |
| **Utils** | `buildPlanMapPopupHtml(point, providerLabel)` | 同上 |
| **子组件** | `PlanRouteMapChrome` — 加载中、地理编码进度、错误、`AsyncFeedback` | `PlanRouteMapChrome.tsx` |
| **子组件** | `PlanRouteMapLegend` — 已 geocode 数量说明 | 可选 |

**重构后**：`AmapPlanRouteMap` / `MapboxPlanRouteMap` 各 ≈ 40 行：hook + `<div ref/id>` + `<PlanRouteMapChrome />`。

---

### 9. `AIChatInterface` (~170 行) — ✅ 已完成

| 已提取 | 职责 |
|--------|------|
| `useAiChatInterfaceController` | 编排 |
| `useAiChatScrollSync` | 滚动 |
| `useAiChatPlanGeneration` | 行程生成 |
| `AIChatToolbar` / `AIChatMessageStream` / `AIChatPlanGenerateBar` | UI |

---

### 10. `UserProfilePage` (~179 行) — 页面

| 类型 | 建议提取 | 路径 |
|------|----------|------|
| **Hook** | `useUserProfilePage()` → user, seo, share tracking, `handleFindCompanion`, `handleMessage` | `hooks/profile/useUserProfilePage.ts` |
| **子组件** | `UserProfilePageToolbar` — 返回、私信、找旅伴 | 可选 |
| **子组件** | `UserProfileNotFound` — 无用户空态 | 可选 |
| **Utils** | `buildCompanionGuidesState(user)` ← 现有 navigate state 构建 | `travelPlanCompanionNavigation.ts` |

**数据**：继续用现有 `useUserProfile`；页面不直接 fetch。

---

### 11. `GuideDetailPage` (~135 行) — 页面

| 类型 | 建议提取 | 路径 |
|------|----------|------|
| **Hook** | 已有 `useGuideDetail` — 保持 | — |
| **子组件** | `GuideDetailSkeleton` / `GuideDetailHero` / `GuideDetailMeta` | `guides/detail/` |
| **Utils** | SEO 已在 `guideDetailPageSeo` — 保持 | `lib/seo` |

---

### 12. `TravelPlanDetailPage` (~110 行) — 已较合理

仅需确保：地图用 `AmapPlanRouteMap`/`Mapbox` 薄包装、操作用 `TravelPlanDetailActions`、数据用 `useTravelPlanDetail`（若有）。**暂不必大拆**。

---

## 六、推荐实施顺序

1. `DiscoverContentGrid` + `useDiscoverGridModel`
2. `AmapPlanRouteMap` / `MapboxPlanRouteMap` 共享 map hooks + html utils
3. `TravelMomentMapPicker` + moment map hooks
4. `AIChatTravelParamsPanel` 表单子组件
5. `DiscoverMasonryCard` viewModel + shells
6. `TravelPlanCard` 文件级拆分
7. `TravelPlanDetailActions` 按钮组件
8. `TravelMomentCard` header/badge 抽出
9. `UserProfilePage` 编排 hook

---

## 七、验证

```bash
pnpm run typecheck
pnpm test
```
