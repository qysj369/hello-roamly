# features · 功能组件

带业务语义的 UI，按产品模块分子目录。依赖 `ui/`、`layout/`、`motion/`，不反向依赖 `pages/`。

| 子目录 | 说明 | 组件 |
|--------|------|------|
| `guides/` | 穷游攻略 | `GuideCardList` |
| `map/` | 地图探索 | `MapboxMap`、`MapExpandPanel` |

```tsx
import { GuideCardList } from '@/components/features/guides/GuideCardList';
import { MapExpandPanel } from '@/components/features/map/MapExpandPanel';

// 或
import { GuideCardList, MapExpandPanel } from '@/components/features';
```

新增功能域时新建子文件夹，例如 `features/trip/`（行程规划）、`features/ai/`（问答）。
