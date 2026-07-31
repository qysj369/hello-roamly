-- user_ai_sessions：AI 规划会话（历史 + 已保存方案统一表）
CREATE TABLE IF NOT EXISTS user_ai_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  location JSONB NOT NULL,
  initial_query TEXT NOT NULL DEFAULT '',
  trigger_type TEXT NOT NULL DEFAULT 'map_click',
  full_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_saved BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_ai_sessions_user_id ON user_ai_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_sessions_user_updated ON user_ai_sessions (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_ai_sessions_saved ON user_ai_sessions (user_id, is_saved) WHERE is_saved = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_ai_sessions_public ON user_ai_sessions (is_public) WHERE is_public = TRUE;

-- 可选：从旧表迁移后弃用 user_plans（保留以免破坏已有部署）
-- DROP TABLE IF EXISTS user_plans;
