# services — API 服务层

封装对后端 / 第三方 API 的调用：请求路径、参数、响应解析与错误语义。使用 `lib/api/http` 发请求，**不包含** React Hook 或 UI。

## 目录

按业务域分子目录，一个文件一类接口或一组相关接口：

| 路径 | 说明 |
|------|------|
| `github/zen.ts` | 示例：GitHub Zen 文本接口 |
| `guides/` | 攻略列表 / 详情（见下表） |

### guides

| 文件 | 方法 | 说明 |
|------|------|------|
| `list.ts` | `fetchGuideList` | `GET /guides`，无 `VITE_API_BASE_URL` 时用 `data/demoGuides` |
| `detail.ts` | `fetchGuideDetail` | `GET /guides/:id` |
| `filter.ts` | `filterGuides` | 本地 mock 筛选 |
| `paths.ts` | `GUIDES_API` | 路径常量 |

实体与 DTO 在 `src/types/domain`、`src/types/api`。

## 导入方式

```ts
import { fetchGithubZen } from '@/services/github/zen';
// 或
import { fetchGithubZen } from '@/services';
```

## 与相邻层

| 层 | 职责 |
|----|------|
| `lib/api/http` | Axios 实例、Token、通用错误 |
| `services/` | 具体 API 方法与领域类型 |
| `hooks/api/` | React Query：`queryKey`、`useXxx` |
| `data/` | 本地 mock / 静态数据（无网络） |

## 约定

- 函数名：`fetch*` / `create*` / `update*` 等动词开头
- 返回已解析的业务数据；抛 `Error` 由 `http` 拦截器或本层补充说明
- 不在此层使用 `useQuery` / `useState`
