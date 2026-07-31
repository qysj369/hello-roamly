# hello-roamly

面向穷游与自由行场景的旅行社区前端：**攻略、AI 行程、发现流、地图、旅伴与分享**。基于 React 18 + TypeScript + Vite，默认 **pnpm** 管理依赖；未配置后端时使用内置演示数据，可逐步接入真实 API。

## 项目简介

Hello Roamly 是一个以「规划 → 发现 → 分享」为主线的旅行 Web 应用（中国版优先）：

- 首页提供目的地搜索、AI 一键穷游行程与科技感沉浸式展示
- **发现**页聚合攻略、AI 计划与旅行瞬间，支持兴趣推荐与瀑布流浏览
- **攻略**与**计划详情**支持地图路线、点赞收藏、PDF/海报分享
- **AI 顾问**对话（DeepSeek 或本地演示）与旅行参数面板
- **地图**支持高德（国内）与 Mapbox（备选），行程点位地理编码
- **个人主页**、私信、旅伴匹配、邀请奖励等社交能力（演示期多为本地存储）

## 核心功能

| 模块 | 说明 |
|------|------|
| 首页 | 搜索、AI 行程生成、近期计划展示 |
| 发现 | 筛选 / 排序、个性化推荐、Pinterest 瀑布流 |
| 攻略 | 列表与详情、关联城市与预算标签 |
| 旅行计划 | AI 生成或演示数据、日程、地图、互动与导出 |
| 旅行瞬间 | 图文/视频发布、可见性、双击点赞 |
| AI | 旅行顾问对话、计划 JSON 生成（DeepSeek） |
| 地图 | 行程路线、GCJ-02 / WGS84 适配 |
| 分享 | 微信海报、小红书多图、分享归因统计 |
| 支付 / 审核 / 邀请 | 接口预留，关于页可演示流程 |
| 无障碍与响应式 | 语义化结构、键盘导航、移动端底栏 + 侧栏菜单 |

路径常量见 [`src/router/paths.ts`](src/router/paths.ts)。

## 本地开发环境

### 环境要求

- **Node.js** 20+（推荐 LTS）
- **pnpm** 9+（`corepack enable` 后可使用仓库锁定的 `packageManager` 版本）

### 快速开始

```bash
cd hello-roamly
pnpm install
cp .env.local.example .env.local   # Windows: copy .env.local.example .env.local
# 按需编辑 .env.local（地图 Token、DeepSeek Key 等）
pnpm dev
```

浏览器打开终端提示的地址（通常为 `http://localhost:5173`）。

### 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 本地开发服务器 |
| `pnpm typecheck` | TypeScript 项目引用构建检查（**推荐**，与 CI 一致） |
| `pnpm build` | 生成 sitemap + 类型检查 + 生产构建 |
| `pnpm build:ssg` | 构建 + 关键路由静态预渲染 |
| `pnpm lint` / `pnpm lint:fix` | ESLint |
| `pnpm format` / `pnpm format:check` | Prettier |
| `pnpm test` | Vitest 单元测试 |
| `pnpm run precommit` | 与 pre-commit 钩子相同的质量检查 |

路径别名：`@/` → `src/`（`vite.config.ts` 与 `tsconfig.app.json` 已配置）。

### Git 提交前检查（Husky + lint-staged）

首次克隆或拉取依赖后，`pnpm install` 会通过 `prepare` 脚本安装 Husky 钩子。

配置文件：[`lint-staged.config.mjs`](lint-staged.config.mjs)

| 阶段 | 范围 | 命令 |
|------|------|------|
| **ESLint** | 暂存区 `*.ts` / `*.tsx` | `eslint --fix --max-warnings 0` |
| **Prettier** | 暂存区 `*.{ts,tsx,css,json,md}` | `prettier --write` |
| **TypeScript** | 全项目（推荐） | `pnpm run typecheck`（`tsc -b`，与 CI 一致） |

说明：`tsc` 依赖项目引用图，无法只对单个暂存文件做可靠类型检查，因此在 lint-staged 之后执行一次全量 `typecheck`。

**`pre-commit` 顺序：** `lint-staged` → `typecheck`

手动跑一遍（不提交）：

```bash
pnpm run precommit
# 仅格式化/检查暂存文件：
pnpm exec lint-staged
```

跳过单次提交（慎用）：`git commit --no-verify`

**验证钩子是否生效：** 见 [docs/VERIFY_PRECOMMIT.md](docs/VERIFY_PRECOMMIT.md)，或执行 `pnpm run verify:precommit`（使用 `src/_verify_precommit_temp.ts` 临时文件）。

### 开发提示

- 未配置 `VITE_API_BASE_URL` 时，列表与互动多为 **演示数据 + localStorage**
- 关于页底部 **开发 · API Token** 可保存 Bearer，供 `axios` 拦截器使用
- 源码结构：[`src/README.md`](src/README.md)、组件分层：[`src/components/README.md`](src/components/README.md)
- 代码内 `// TODO:` 标记了待接后端或待优化项，可用 `rg "// TODO:" src` 检索

## 代码注释规范（示例）

项目内注释分三类，**优先写「为什么」**，避免复述代码字面含义。

| 类型 | 写法 | 适用场景 |
|------|------|----------|
| **JSDoc** | `/** ... */` + `@param` / `@returns` / `@remarks` | 导出函数、Hook、公共组件 props |
| **行内说明** | `// 业务原因…` | 非显而易见的分支、魔法数、演示回退 |
| **待办** | `// TODO: 动作 + 目标` | 临时代码、待接 API、已知技术债 |

### 规范示例（仓库内已落地）

**1. 工具函数 — `buildDiscoverFeed`**（`src/utils/discoverContent.ts`）

```ts
/**
 * 在内存中构建发现流并完成排序（演示数据源）。
 * @remarks 流水线：collect → rank → applyDiscoverFeedSort；瞬间入池前校验可见性。
 * @param filters - 筛选条件
 * @param sortMode - recommend | recent
 * @returns 带 recommendScore 的条目列表
 */
```

**2. 服务层 — `fetchDiscoverFeed`**（`src/services/discover/fetchDiscoverFeed.ts`）

```ts
/**
 * 拉取发现页 feed（TanStack Query 用）。
 * @remarks 演示：延迟后 buildDiscoverFeed；上线改为 GET /discover/feed
 * @example await fetchDiscoverFeed(filters, 'recommend')
 */
```

**3. AI 解析 — `parseTravelPlanFromAiResponse`**（`src/services/ai/parseTravelPlan.ts`）

```ts
/**
 * 将模型输出解析为结构化计划。
 * @throws {DeepSeekApiError} JSON 非法或缺字段
 */
```

**4. Hook — `useAiChat`**（`src/hooks/ai/useAiChat.ts`）

```ts
/**
 * AI 顾问对话：先审后发、requestId 防乱序。
 * @returns messages, sendMessage, retryLastMessage, composerId, …
 */
```

**5. 组件 — `OptimizedImage`**（`src/components/ui/OptimizedImage.tsx`）

```ts
/**
 * 响应式图片：懒加载 + WebP picture。
 * @example <OptimizedImage src={url} alt="封面" fill />
 */
```

**6. 无障碍组件 — `SkipToMainLink`**（`src/components/layout/SkipToMainLink.tsx`）

```ts
/**
 * 跳过顶栏至 #main-content，与 AppShell 主区域 id 配对。
 */
```

更多「为什么」说明见 `travelBuddyMatch.ts`、`discoverRecommend.ts`、`inviteApi.ts` 等模块内注释。

## 技术栈与关键依赖

### 核心框架

| 类别 | 技术 |
|------|------|
| 框架 | React 18、TypeScript 5.7 |
| 构建 | Vite 6、`@vitejs/plugin-react` |
| 样式 | Tailwind CSS v4、`@tailwindcss/forms` |
| 路由 | react-router-dom 7 |
| 数据请求 | TanStack Query 5、axios |
| 客户端状态 | Zustand 5 |
| UI / 动效 | Headless UI、Framer Motion、lucide-react |
| 地图 | 高德 JS API Loader、Mapbox GL、react-map-gl |
| 内容 | react-markdown、highlight.js、react-dropzone |
| 校验 | Zod 4 |
| 质量 | ESLint（Airbnb + TS）、Prettier、Vitest、Playwright（SSG） |

### 关键依赖说明

| 包 | 用途 |
|----|------|
| `@tanstack/react-query` | 服务端状态缓存、变更与重试 |
| `zustand` | 搜索、生成计划、瞬间、私信等 UI/本地状态 |
| `axios` | HTTP 客户端（`src/lib/api/http.ts`） |
| `framer-motion` | 路由与卡片动效，支持 `prefers-reduced-motion` |
| `date-fns` + `clsx` + `tailwind-merge` | 日期格式化、`cn()` 合并类名 |
| `@tsparticles/react` | 首页粒子背景 |
| `qrcode` | 分享海报二维码 |
| `@sentry/react` | 可选错误监控 |
| `vite-plugin-pwa` | 可选 PWA 构建 |

业务 API 封装在 [`src/services/`](src/services/)，类型定义在 [`src/types/`](src/types/)。

## 环境变量配置

> 所有 **`VITE_` 前缀**变量会打入前端 bundle，勿放入数据库密码、支付私钥、云审密钥等敏感信息。  
> 复制 [`.env.local.example`](.env.local.example) 为 `.env.local`（已 gitignore）。Vercel 部署见 [`.env.vercel.example`](.env.vercel.example)。

### 基础与 SEO

| 变量 | 必填 | 说明 |
|------|------|------|
| `VITE_SITE_URL` | 生产推荐 | 站点根 URL，用于 canonical、Open Graph、sitemap、分享链接 |
| `VITE_MARKET` | 否 | `CN`（默认）或 `GLOBAL` |

### 地图

| 变量 | 必填 | 说明 |
|------|------|------|
| `VITE_AMAP_KEY` | 国内推荐 | [高德开放平台](https://console.amap.com/dev/key/app) Web Key |
| `VITE_AMAP_SECURITY_CODE` | 与 Key 同配 | 高德 JS API 2.0 安全密钥 |
| `VITE_MAPBOX_TOKEN` | 备选 | Mapbox 公开 token |
| `VITE_MAP_PROVIDER` | 否 | `auto`（默认，优先高德）\| `amap` \| `mapbox` |

配置后访问 `/map`。坐标系：高德 **GCJ-02**，Mapbox **WGS84**（见 `src/lib/map/coordinates.ts`）。

### 后端 API 与认证

| 变量 | 必填 | 说明 |
|------|------|------|
| `VITE_API_BASE_URL` | 否 | 自建 API 根路径；未配置则走演示数据 |
| `VITE_API_TOKEN` | 否 | 开发用 Bearer（会暴露给浏览器，生产慎用） |

### AI（DeepSeek）

| 变量 | 必填 | 说明 |
|------|------|------|
| `VITE_DEEPSEEK_API_KEY` | 否 | 配置后启用真实对话与 JSON 行程生成；未配置为演示模式 |
| `VITE_DEEPSEEK_BASE_URL` | 否 | 默认 `https://api.deepseek.com` |
| `VITE_DEEPSEEK_MODEL` | 否 | 默认 `deepseek-chat` |

### 支付（预留，商户密钥仅后端）

| 变量 | 说明 |
|------|------|
| `VITE_PAYMENT_UI_ENABLED` | `1` 显示支付 UI |
| `VITE_PAYMENT_ALIPAY_ENABLED` / `VITE_PAYMENT_WECHAT_ENABLED` | 渠道开关 |

### 内容安全（预留）

| 变量 | 说明 |
|------|------|
| `VITE_CONTENT_MODERATION_ENABLED` | 开启审核流程 |
| `VITE_CONTENT_MODERATION_STRICT` | 严格模式 |
| `VITE_CONTENT_MODERATION_DEMO_BLOCK` | 演示本地拦截（如「违规测试」） |

### CDN 与图片

| 变量 | 说明 |
|------|------|
| `VITE_CDN_BASE` | 构建产物 CDN 根路径（Vite `base`） |
| `VITE_IMAGE_CDN` | 远程图代理模板，支持 `{url}` |
| `VITE_USE_CHINA_CDN` | 优先国内 CDN 策略 |
| `VITE_ALLOW_FOREIGN_IMAGE_PROXY` | `1` 允许境外 wsrv.nl 演示 WebP 代理 |

### 分享、邀请、监控

| 变量 | 说明 |
|------|------|
| `VITE_SHARE_ANALYTICS_ENABLED` | 默认开启；`0` 关闭分享统计 |
| `VITE_INVITE_ENABLED` | 默认开启；`0` 关闭邀请模块 |
| `VITE_SENTRY_DSN` | Sentry 项目 DSN |
| `VITE_SENTRY_ENABLED` / `VITE_SENTRY_DEBUG` | 开关与开发上报 |
| `VITE_SENTRY_ENVIRONMENT` / `VITE_SENTRY_RELEASE` | 环境与版本 |
| `VITE_SENTRY_TRACES_SAMPLE_RATE` | 性能采样率 0–1 |

### 构建 / CI（非 `VITE_`，终端或 CI 使用）

| 变量 | 说明 |
|------|------|
| `SKIP_PRERENDER` | `1` 跳过 SSG，加快构建 |
| `PRERENDER_PORT` | 预渲染预览端口，默认 `4173` |

### 仅服务端（不要加 `VITE_` 前缀）

在自建 API 或 Vercel Serverless 中配置，例如：

```env
DATABASE_URL=postgresql://...
API_SECRET=...
DEEPSEEK_API_KEY=sk-...        # 若不想暴露给浏览器，应只放服务端
MODERATION_API_KEY=...
```

完整字段声明见 [`src/types/ambient/vite-env.d.ts`](src/types/ambient/vite-env.d.ts)。

---

## README 文档大纲

| 章节 | 内容 |
|------|------|
| [项目简介](#项目简介) | 产品定位与主线能力 |
| [核心功能](#核心功能) | 模块一览表 |
| [本地开发环境](#本地开发环境) | 环境要求、快速开始、常用命令、开发提示 |
| [代码注释规范（示例）](#代码注释规范示例) | JSDoc / 行内 / TODO 约定与 6 个范例 |
| [技术栈与关键依赖](#技术栈与关键依赖) | 框架表 + npm 包说明 |
| [环境变量配置](#环境变量配置) | 按类别分组的 `VITE_*` 说明 |
| [主要路由](#主要路由) | 路径与页面对照 |
| [SEO、部署与更多文档](#seo部署与更多文档) | SSG、平台、重定向、相关 README 链接 |

## 主要路由

| 路径 | 页面 |
|------|------|
| `/` | 首页 |
| `/discover` | 发现 |
| `/ai` | AI 旅行顾问 |
| `/map` | 地图 |
| `/guides`、`/guides/:guideId` | 攻略列表 / 详情 |
| `/plans/:planId` | 旅行计划详情 |
| `/profile`、`/users/:userId` | 我的 / 用户主页 |
| `/messages`、`/messages/:peerUserId` | 私信 |
| `/about` | 关于与功能演示 |

## SEO、部署与更多文档

- **SEO / SSG**：`pnpm run seo:generate`、`pnpm run build:ssg`；详见下文原流程
- **部署**：Netlify（`netlify.toml`）、Vercel（`vercel.json`）、Nginx 示例见 [`deploy/`](deploy/)
- **GitHub → Vercel**：[deploy/github-vercel.md](deploy/github-vercel.md)

### 静态预渲染（可选）

```bash
pnpm exec playwright install chromium   # 首次
pnpm run build:ssg
pnpm run preview:ssg                    # 默认 http://localhost:4173
```

生产建议设置 `VITE_SITE_URL` 后再执行 `build:ssg`。未预渲染路由包括 `/map`、`/messages/*` 等（纯 SPA）。

### 重定向（旧路径兼容）

| 旧路径 | 新路径 |
|--------|--------|
| `/home` | `/` |
| `/me` | `/profile` |
| `/chat` | `/ai` |
| `/explore` | `/discover` |
| `/guide` | `/guides` |

维护清单：[`deploy/siteRedirects.ts`](deploy/siteRedirects.ts)。

---

## 动画与状态（补充）

- 动效：`src/lib/motion.ts`、`AnimatedOutlet`、`MotionSection` 等；尊重系统「减少动态效果」
- TanStack Query：`src/lib/queryClient.ts`、`src/hooks/`
- Zustand：`src/stores/`

## 相关文档

- [src/README.md](src/README.md) — 源码目录
- [src/components/README.md](src/components/README.md) — 组件分层
- [src/types/README.md](src/types/README.md) — 类型说明
- [.env.vercel.example](.env.vercel.example) — Vercel 环境变量清单
