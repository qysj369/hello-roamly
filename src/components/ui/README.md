# ui · 基础 UI 组件

无业务语义，可在任意页面复用。统一从 `@/components/ui` 导入。

| 组件 | 说明 |
|------|------|
| `Button` | `variant`: primary / secondary / ghost / danger · `size`: sm / md / lg |
| `Card` | `CardHeader` `CardTitle` `CardDescription` `CardContent` `CardFooter` |
| `Dialog` | Headless UI 对话框，支持 `confirmLabel` / `onConfirm` |
| `OptimizedImage` | 懒加载 + WebP `<picture>` + 响应式 srcset（Vite 版 next/image） |
| `AvatarImage` | 圆形头像（需 `displayName` 生成 alt） |

```tsx
import { Button, Card, CardContent, CardTitle, Dialog } from '@/components/ui';
```

开发示例见「我的」页 → `UiShowcase`（仅 `pnpm dev`）。
