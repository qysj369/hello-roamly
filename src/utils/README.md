# utils — 工具函数

无业务语义、可复用的纯函数：样式类名合并、日期格式化等。不依赖 React，不发起网络请求。

## 模块

| 文件 | 导出 | 说明 |
|------|------|------|
| `cn.ts` | `cn` | `clsx` + `tailwind-merge` |
| `date.ts` | `toDate`, `formatDateZh`, `formatRelativeZh` | `date-fns` 中文 locale |

## 导入

```ts
import { cn } from '@/utils/cn';
import { formatRelativeZh } from '@/utils/date';
// 或
import { cn, formatDateZh } from '@/utils';
```

## 与 `lib/` 的区别

| 目录 | 内容 |
|------|------|
| `utils/` | 通用小工具（类名、日期、字符串等） |
| `lib/` | 应用配置与基础设施（http、env、mapbox、motion 预设、queryClient） |

新增工具函数优先放本目录；仅当与 Axios / 环境变量 / 第三方 SDK 强绑定时才放 `lib/`。
