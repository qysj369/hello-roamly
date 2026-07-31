# src 目录结构

```
src/
├── services/         # API 服务层 → services/README.md
│   ├── github/       # 示例：第三方接口
│   └── guides/       # 攻略 list / detail
├── assets/           # 静态资源（svg 等）
├── components/       # 通用组件 → 见 components/README.md
│   ├── layout/       # 布局组件
│   ├── ui/           # 基础 UI（Button、Card、Dialog）
│   ├── features/     # 功能组件（guides、map…）
│   ├── motion/       # 动效封装
│   └── dev/          # 开发工具面板
├── data/             # 静态 / 模拟数据
├── hooks/            # 自定义 Hooks → hooks/README.md
│   ├── api/          # React Query 等
│   ├── browser/      # 防抖、document.title
│   └── guides/       # 攻略筛选等业务 Hook
├── utils/            # 工具函数 → utils/README.md
│   ├── cn.ts         # Tailwind 类名合并
│   └── date.ts       # 中文日期格式化
├── lib/              # 配置与基础设施 → lib/README.md
│   ├── config/       # 品牌、环境变量
│   ├── api/          # http、auth
│   ├── map/          # mapbox
│   ├── motion/       # Framer Motion 预设
│   └── query/        # React Query client
├── pages/            # 页面组件 → pages/README.md
│   ├── home/         # 首页
│   ├── map/          # 地图
│   ├── guides/       # 列表 + 详情
│   ├── about/        # 我的
│   └── error/        # 404
├── providers/        # 全局 Provider → providers/README.md
├── router/           # 路由表与懒加载 → router/README.md
├── stores/           # 状态管理 → stores/README.md
│   └── ui/           # useUiStore（搜索词等）
├── types/            # TypeScript 类型 → types/README.md
│   ├── domain/       # 业务实体
│   ├── api/          # 接口 DTO
│   └── ambient/      # 全局声明（vite-env 等）
├── App.tsx           # 根组件：RouterProvider（页面在 pages/）
├── main.tsx          # 入口：StrictMode + AppProviders + 挂载 #root
└── index.css         # 全局样式（Tailwind）
```

## 启动链

```
main.tsx → AppProviders → App.tsx → RouterProvider → AppShell → pages/*
```
