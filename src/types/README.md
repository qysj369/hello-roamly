# types — TypeScript 类型定义

项目内共享的类型与全局声明，**不含运行时代码**。

## 目录

| 路径 | 说明 |
|------|------|
| `domain/` | 业务实体（如 `Guide`） |
| `api/` | 接口请求 / 响应形状（如 `ListGuidesParams`） |
| `ambient/` | 全局声明（`ImportMetaEnv`、React 模块说明等） |

## 导入

```ts
import type { Guide } from '@/types/domain/guide';
import type { ListGuidesParams } from '@/types/api/guides';
// 或
import type { Guide, ListGuidesParams } from '@/types';
```

## 约定

- **domain**：与后端 / 产品模型一致，供 `data/`、`services/`、`components/` 共用
- **api**：仅描述 HTTP 契约；实现放在 `services/`
- **ambient**：使用 `declare` / `interface` 扩充全局，不要 `export` 业务类型
- 组件 Props 类型优先写在组件文件内；仅跨模块复用时放入 `types/`

## 与相邻层

| 层 | 类型来源 |
|----|----------|
| `types/domain` | 实体 |
| `types/api` | 接口 DTO |
| `services/` | 引用上述类型，不重复定义实体 |
