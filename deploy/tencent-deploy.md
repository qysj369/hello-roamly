# 腾讯云上线指南（国内流畅访问）

> 目标：把 `dist/` 部署到 **腾讯云 COS + CDN**，用户通过 `https://helloroamly.com` 访问。

---

## 一、本地准备（约 5 分钟）

### 1. 安装 COS 命令行

```powershell
pip install coscmd
pnpm run tencent:setup
```

### 2. 配置环境变量

已有 `.env.local`（含高德 Key）即可用于构建。

可选：复制模板并填写 COS 信息（不会提交 Git）：

```powershell
copy .env.tencent.example .env.tencent.local
```

在 `.env.tencent.local` 中至少设置：

```env
VITE_SITE_URL=https://helloroamly.com
VITE_AMAP_KEY=你的Key
VITE_AMAP_SECURITY_CODE=你的安全密钥
VITE_MAP_PROVIDER=amap
```

---

## 二、腾讯云控制台（约 15–30 分钟）

### 1. 创建 COS 存储桶

1. 打开 [COS 控制台](https://console.cloud.tencent.com/cos)
2. **创建存储桶**
   - 地域：如 **北京 ap-beijing**
   - 访问权限：**公有读私有写**
   - 名称示例：`hello-roamly-1250000000`（名称-APPID）

### 2. 开启静态网站

存储桶 → **基础配置 → 静态网站**

| 项 | 值 |
|---|---|
| 索引文档 | `index.html` |
| 错误文档 | `index.html`（SPA 回退） |

记下默认网站地址：`*.cos-website.*.myqcloud.com`，可先用来测试。

### 3. 配置 coscmd

[访问管理 → API 密钥](https://console.cloud.tencent.com/cam/capi) 获取 SecretId / SecretKey：

```powershell
coscmd config -a <SecretId> -s <SecretKey> -b hello-roamly-1250000000 -r ap-beijing
coscmd list /
```

---

## 三、构建并上传

```powershell
cd C:\Users\Administrator\Desktop\hello-roamly
pnpm run deploy:tencent
```

脚本会：

1. 加载 `.env.local` / `.env.tencent.local`
2. `pnpm run build` 生成 `dist/`
3. `coscmd upload -r dist /` 上传到 COS

上传完成后，用 COS **静态网站默认域名** 先打开首页验证。

---

## 四、CDN + 自定义域名（推荐）

1. [CDN 控制台](https://console.cloud.tencent.com/cdn) → 添加域名 `helloroamly.com`
2. 源站类型：**COS 源**，选择刚创建的桶
3. HTTPS：申请免费 SSL 并绑定
4. [DNSPod](https://console.dnspod.cn/)：添加 CNAME 指向 CDN
5. **ICP 备案**：国内自定义域名必须备案后才能正常访问

---

## 五、高德地图白名单

[高德控制台](https://console.amap.com/dev/key/app) → 你的 Key → **设置**

- **JS API 安全密钥**：与 `VITE_AMAP_SECURITY_CODE` 一致
- **域名白名单**：加入 `helloroamly.com` 和 `www.helloroamly.com`

---

## 六、验收

```powershell
pnpm run check:online
pnpm run preview:lan   # 局域网本地验收
```

检查清单：

- [ ] 首页能打开
- [ ] 地图能加载（不是空白）
- [ ] 允许定位后，点击地图能画跨城弧线
- [ ] AI 规划能出结果（需 DeepSeek Key）

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm run tencent:setup` | 检查 coscmd / 环境变量 |
| `pnpm run deploy:tencent` | 构建 + 上传 COS |
| `pnpm run check:online` | 检测 helloroamly.com / Vercel 是否可访问 |

---

## 故障排查

| 现象 | 处理 |
|------|------|
| `coscmd not found` | `pip install coscmd`，重启终端 |
| 上传 403 | 检查 SecretId/SecretKey 和桶名 |
| 打开 404 | 确认静态网站已开启，错误文档为 index.html |
| 地图空白 | 检查高德 Key、安全密钥、域名白名单 |
| 域名打不开 | DNS / CDN / 备案是否完成 |
