# components · 通用组件

按职责分子目录；页面从对应路径引用，避免根目录堆满文件。

| 目录 | 用途 | 示例 |
|------|------|------|
| `layout/` | 布局组件 | `AppShell`、`PageHeader`、`BottomNav` |
| `ui/` | 基础 UI | `Button`、`Card`、`Dialog` |
| `features/` | 功能组件（业务） | `GuideCardList`、`MapExpandPanel` |
| `motion/` | 动效封装 | `MotionPage`、`MotionCard` |
| `dev/` | 开发环境面板 | `QueryDevtoolsPanel` |

业务页面在 `src/pages/`；数据在 `data/`；工具在 `lib/`、`hooks/`。

各子目录均有 `README.md` 与（部分）`index.ts` 统一导出。
