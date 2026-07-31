# GitHub 自动部署（Vercel）

> **国内访问注意**：`*.vercel.app` 在中国大陆常出现超时或无法打开，**不能作为面向国内用户的唯一线上地址**。国内测试与推广请用 [tencent-static.ps1](./tencent-static.ps1)（腾讯云 COS）或 [china-static.ps1](./china-static.ps1)（阿里云 OSS），或先用 `pnpm run preview:lan` 做局域网验收。

任选 **一种** 方式即可，避免同一次 push 触发两次构建。

---

## 方式 A：Vercel 直连 GitHub（推荐）

无需 GitHub Actions 部署密钥，由 Vercel 在云端自动构建。

1. 将代码推送到 GitHub 仓库（`main` 或 `master` 分支）。
2. 打开 [Vercel Dashboard](https://vercel.com/new) → **Add New Project**。
3. **Import** 你的 GitHub 仓库，授权 Vercel GitHub App。
4. Framework 选 **Vite**（或自动识别）；根目录、构建命令以仓库内 `vercel.json` 为准：
   - Build Command: `pnpm run build`（`build:ssg` 需 Playwright，Vercel 上易失败）
   - Output Directory: `dist`
   - Install Command: `pnpm install --frozen-lockfile`
5. **Environment Variables**：按 [`.env.vercel.example`](../.env.vercel.example) 填写（至少 `VITE_SITE_URL`，以及 `VITE_AMAP_KEY` 或 `VITE_MAPBOX_TOKEN`）。
6. 点击 **Deploy**。

之后每次 **push 到默认分支** 或 **合并 PR**，Vercel 会自动：

- Production：默认分支上的 push
- Preview：每个 Pull Request 一个预览 URL

在 Vercel → Project → **Settings → Git** 可调整生产分支、是否等待 CI 等。

若启用方式 A，建议在 GitHub 仓库 **Actions** 中禁用或删除 `.github/workflows/deploy-vercel.yml`，仅保留 `ci.yml` 做 PR 检查。

---

## 方式 B：GitHub Actions 部署

在 GitHub 仓库构建并 `vercel deploy --prebuilt`，适合需要部署日志集中在 GitHub 的团队。

### 1. 在 Vercel 创建空项目

```bash
pnpm add -g vercel
cd hello-roamly
vercel link
```

记下终端输出的 **Org ID**、**Project ID**。

### 2. 创建 Access Token

[Vercel Account → Tokens](https://vercel.com/account/tokens) → Create Token。

### 3. 配置 GitHub Secrets

仓库 → **Settings → Secrets and variables → Actions → New repository secret**：

| Secret | 说明 |
|--------|------|
| `VERCEL_TOKEN` | 上一步的 Token |
| `VERCEL_ORG_ID` | `vercel link` 或 `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | 同上 |

环境变量（`VITE_*`）仍在 **Vercel 项目 Environment Variables** 中配置；`vercel pull` 会在构建时拉取。

### 4. 推送代码

推送到 `main` / `master` 将触发 [`.github/workflows/deploy-vercel.yml`](../.github/workflows/deploy-vercel.yml)。

手动触发：Actions → **Deploy to Vercel** → **Run workflow**。

---

## Pull Request 检查

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) 在 **PR** 时运行：

- `pnpm run typecheck`
- `pnpm run lint`（失败不阻断，可改为硬性检查）
- `pnpm run build:ssg`

与 Vercel Preview 部署互补：CI 在 GitHub 跑检查，Vercel 提供可点击的预览站。

---

## 可选：仓库变量

**Settings → Secrets and variables → Actions → Variables**

| 变量 | 说明 |
|------|------|
| `SKIP_PRERENDER` | 设为 `1` 时 CI 跳过 Playwright 预渲染，加快 PR 构建 |

---

## 故障排查

| 现象 | 处理 |
|------|------|
| 构建失败 `playwright` | 确认 `vercel.json` 的 `installCommand` 含 `playwright install chromium` |
| 地图空白 | 在 Vercel 配置 `VITE_AMAP_KEY` + `VITE_AMAP_SECURITY_CODE`，或 `VITE_MAPBOX_TOKEN` |
| 高德报 INVALID_USER_KEY / 鉴权失败 | 控制台为 Key 配置 **安全密钥**，并将站点域名加入 **JS API 白名单** |
| 坐标偏移几百米 | 勿混用坐标系；中国版全程用高德，或调用 `normalizeCoordinatesForActiveProvider` |
| 国内访问慢 | 配置 `VITE_CDN_BASE` + `VITE_IMAGE_CDN`，或将 dist 部署到 OSS/COS |
| SEO 链接错误 | 配置 `VITE_SITE_URL` 为生产域名 |
| 重复部署两次 | 只保留方式 A 或方式 B 其一 |
