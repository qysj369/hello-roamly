# TravelPlanCard

展示 AI 生成的旅行计划，用于首页跑马灯等场景。

## 模块结构

| 文件 | 说明 |
|------|------|
| `TravelPlanCard.tsx` | 主卡片（封面 → 标题/描述 → 元信息 → 创建者 → 风格标签 → 互动 → 详情） |
| `TravelPlanCardStyleTags.tsx` | 旅行风格标签 + Framer Motion |
| `TravelPlanCardActions.tsx` | 点赞 / 收藏 / 分享 |
| `data/buildTravelPlan.ts` | 从 `Guide` 组装 `TravelPlan` |

## 使用

```tsx
import { TravelPlanCard } from '@/components/features/plans';
import { buildTravelPlanFromGuide } from '@/data/buildTravelPlan';

const plan = buildTravelPlanFromGuide(guide);

<TravelPlanCard plan={plan} />;
```

## 数据字段

见 `types/domain/travelPlan.ts`。互动状态存于 `usePlanInteractionStore`（localStorage）。
