# lib — 配置与基础设施

应用级配置与第三方集成封装：环境变量、HTTP、地图、动效预设、React Query 客户端等。

## 目录

| 路径 | 说明 |
|------|------|
| `config/` | 品牌常量、`readEnv` 等环境变量读取 |
| `api/` | Axios 实例、Bearer Token 存取 |
| `map/` | Mapbox token 与默认视野 |
| `motion/` | Framer Motion 变体与过渡 |
| `query/` | TanStack Query `queryClient` 单例 |

通用小工具（`cn`、日期格式化）见 [`../utils/README.md`](../utils/README.md)。

## 导入方式

```ts
import { APP_NAME } from '@/lib/config/brand';
import { http } from '@/lib/api/http';
import { queryClient } from '@/lib/query/client';
```

也可从根 barrel 按需引用（`@/lib`）：

```ts
import { APP_NAME, queryClient } from '@/lib';
```

## 环境变量

在 `.env.local` 中配置（见项目根 `.env.local.example`）：

- `VITE_MAPBOX_TOKEN` — 地图
- `VITE_API_BASE_URL` — API 根地址（可选）
- `VITE_API_TOKEN` — 开发用 Bearer（可选，勿提交密钥）
