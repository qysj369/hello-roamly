# 数据库迁移 — 伸出触角

PostgreSQL / Supabase 执行顺序：

1. `001_create_travel_buddies.sql` — 结伴需求表 `travel_buddies`
2. `002_create_buddy_messages.sql` — 结伴站内信表 `buddy_messages`

本地开发未接数据库时，Vite 中间件使用 `server/.data/travel-buddy-db.json` 作为演示存储；前端同时支持 `localStorage` 回退。

生产环境请由后端实现与迁移脚本一致的 REST 接口：

- `GET/POST /api/travel-buddies`
- `GET/POST /api/buddy-messages`（GET 支持 `buddyPostId`、`peerUserId`、`since` 轮询参数）
